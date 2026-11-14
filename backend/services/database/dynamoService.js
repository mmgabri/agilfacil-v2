const config = require('../../config');
const { DynamoDBClient, QueryCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { PutCommand, GetCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const log = require('../../utils/logger');

const client = new DynamoDBClient({ region: config.REGION });
const docClient = DynamoDBDocumentClient.from(client);

const putTable = (tableName, item) => {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    docClient
      .send(new PutCommand({ TableName: tableName, Item: item }))
      .then(() => {
        log.debug('DynamoDB put success', { table: tableName, elapsedMs: (performance.now() - start).toFixed(3) });
        resolve(item);
      })
      .catch((error) => {
        log.error('DynamoDB put error', { table: tableName, error: error.message });
        reject(`Erro ao inserir na tabela ${tableName}:`);
      });
  });
};

const getBoardByUserDb = (tableName, indexNameUser, creatorId) => {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const params = {
      TableName: tableName,
      IndexName: indexNameUser,
      KeyConditionExpression: 'creatorId = :creatorId',
      ExpressionAttributeValues: {
        ':creatorId': { S: creatorId },
      },
      ScanIndexForward: false,
    };

    docClient.send(new QueryCommand(params))
      .then((data) => {
        if (data.Items) {
          const formattedItems = data.Items.map((item) => unmarshall(item));
          log.debug('DynamoDB query by user success', { table: tableName, creatorId, count: formattedItems.length, elapsedMs: (performance.now() - start).toFixed(3) });
          resolve(formattedItems);
        } else {
          reject('Nenhum item encontrado no GSI.');
        }
      })
      .catch((error) => {
        log.error('DynamoDB query by user error', { table: tableName, creatorId, error: error.message });
        reject(`Erro ao consultar o GSI: ${error.message}`);
      });
  });
};

const getBoardDb = (tableName, boardId) => {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const params = {
      TableName: tableName,
      KeyConditionExpression: 'boardId = :boardId',
      ExpressionAttributeValues: {
        ':boardId': { S: boardId },
      },
    };

    docClient.send(new QueryCommand(params))
      .then((data) => {
        if (data.Items && data.Items.length > 0) {
          const formattedItem = unmarshall(data.Items[0]);
          log.debug('DynamoDB get board success', { table: tableName, boardId, elapsedMs: (performance.now() - start).toFixed(3) });
          resolve(formattedItem);
        } else {
          log.debug('DynamoDB get board not found', { table: tableName, boardId });
          reject('NOT_FOUND');
        }
      })
      .catch((err) => {
        log.error('DynamoDB get board error', { table: tableName, boardId, error: err.message });
        reject('Erro ao consultar dados da tabela boad');
      });
  });
};

const getRoomDb = (tableName, roomId) => {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const params = {
      TableName: tableName,
      KeyConditionExpression: 'roomId = :roomId',
      ExpressionAttributeValues: {
        ':roomId': { S: roomId },
      },
    };

    docClient.send(new QueryCommand(params))
      .then((data) => {
        if (data.Items && data.Items.length > 0) {
          const formattedItem = unmarshall(data.Items[0]);
          log.debug('DynamoDB get room success', { table: tableName, roomId, elapsedMs: (performance.now() - start).toFixed(3) });
          resolve(formattedItem);
        } else {
          log.debug('DynamoDB get room not found', { table: tableName, roomId });
          reject('NOT_FOUND');
        }
      })
      .catch((err) => {
        log.error('DynamoDB get room error', { table: tableName, roomId, error: err.message });
        reject('Erro ao consultar dados da tabela boad');
      });
  });
};

const deleteBoardDb = (tableName, boardId, createdAt) => {
  return new Promise(async (resolve, reject) => {
    const start = performance.now();
    const params = {
      TableName: tableName,
      Key: {
        boardId: { S: boardId },
        createdAt: { S: createdAt }
      }
    };

    docClient.send(new DeleteItemCommand(params))
      .then(() => {
        log.debug('DynamoDB delete success', { table: tableName, boardId, elapsedMs: (performance.now() - start).toFixed(3) });
        resolve('DELETED');
      })
      .catch((err) => {
        log.error('DynamoDB delete error', { table: tableName, boardId, error: err.message });
        reject('Erro ao deletar o board');
      });
  });
};

// ── User Migration ─────────────────────────────────────────────────────────────

const getUserMigrationByEmail = (tableName, email) => {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    docClient
      .send(new GetCommand({ TableName: tableName, Key: { email } }))
      .then((data) => {
        log.debug('DynamoDB get user migration', { table: tableName, email, found: !!data.Item, elapsedMs: (performance.now() - start).toFixed(3) });
        resolve(data.Item || null);
      })
      .catch((err) => {
        log.error('DynamoDB get user migration error', { table: tableName, email, error: err.message });
        reject(err);
      });
  });
};

// ── Escrita concorrente segura (optimistic locking) ───────────────────────────
//
// Board e sala são gravados como um item inteiro. Sem controle, duas invocações
// concorrentes (ex.: dois usuários criando card no mesmo instante) leem a mesma
// versão e a última gravação apaga a anterior (lost update — no teste de carga
// em produção, 6 usuários simultâneos perderam 44 de 60 cards).
//
// mutateItem: lê o item, aplica `mutate` e grava condicionado à versão lida.
// Se outra invocação gravou no meio tempo, relê e reaplica a mutação.
//   mutate(item) → item alterado, ou null quando não há nada a gravar.
//   Erros lançados dentro de mutate (validação) não são re-tentados.

const MAX_WRITE_ATTEMPTS = 20;
// Backoff exponencial com "full jitter" (teto de 1s): espalha as re-tentativas
// para que invocações concorrentes não colidam de novo no mesmo instante.
const backoffMs = (attempt) => Math.random() * Math.min(1000, 25 * 2 ** attempt);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const putVersioned = async (tableName, keyName, item, expectedVersion) => {
  const next = { ...item, version: (expectedVersion || 0) + 1 };
  const hasVersion = expectedVersion !== undefined && expectedVersion !== null;
  await docClient.send(new PutCommand({
    TableName: tableName,
    Item: next,
    // attribute_exists(chave): não recria um item apagado enquanto alguém editava.
    // attribute_not_exists(version): itens antigos, criados antes do versionamento.
    ConditionExpression: hasVersion
      ? 'attribute_exists(#k) AND version = :v'
      : 'attribute_exists(#k) AND attribute_not_exists(version)',
    ExpressionAttributeNames: { '#k': keyName },
    ...(hasVersion && { ExpressionAttributeValues: { ':v': expectedVersion } }),
  }));
  return next;
};

const mutateItem = async ({ tableName, keyName, id, load, mutate }) => {
  for (let attempt = 1; ; attempt++) {
    const current = await load();
    const expectedVersion = current.version;
    const updated = await mutate(current);
    if (!updated) return current;

    const start = performance.now();
    try {
      const saved = await putVersioned(tableName, keyName, updated, expectedVersion);
      log.debug('DynamoDB versioned put success', { table: tableName, id, version: saved.version, attempt, elapsedMs: (performance.now() - start).toFixed(3) });
      return saved;
    } catch (err) {
      if (err.name !== 'ConditionalCheckFailedException') {
        log.error('DynamoDB versioned put error', { table: tableName, id, attempt, error: err.message });
        throw err;
      }
      if (attempt >= MAX_WRITE_ATTEMPTS) {
        log.error('DynamoDB conflito de escrita — tentativas esgotadas', { table: tableName, id, attempt });
        throw new Error('Conflito de escrita: tentativas esgotadas.');
      }
      log.info('DynamoDB conflito de escrita — relendo e reaplicando', { table: tableName, id, attempt });
      await sleep(backoffMs(attempt));
    }
  }
};

module.exports = { putTable, getBoardByUserDb, getBoardDb, getRoomDb, deleteBoardDb, getUserMigrationByEmail, mutateItem };
