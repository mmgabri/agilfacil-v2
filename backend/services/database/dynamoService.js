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

module.exports = { putTable, getBoardByUserDb, getBoardDb, getRoomDb, deleteBoardDb, getUserMigrationByEmail };
