const config = require('../../config');
const { DynamoDBClient, QueryCommand, DeleteItemCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');
const { PutCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const client = new DynamoDBClient({ region: config.REGION });
const docClient = DynamoDBDocumentClient.from(client);

const putTable = (tableName, item) => {
  return new Promise((resolve, reject) => {
    docClient
      .send(new PutCommand({ TableName: tableName, Item: item }))
      .then((data) => {
        resolve(item);
      })
      .catch((error) => {
        console.error(`Erro ao inserir na tabela ${tableName}:`, error);
        reject(`Erro ao inserir na tabela ${tableName}:`);
      });
  });
};

const getBoardByUserDb = (tableName, indexNameUser, creatorId) => {
  return new Promise((resolve, reject) => {
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
          resolve(formattedItems);
        } else {
          reject('Nenhum item encontrado no GSI.');
        }
      })
      .catch((error) => {
        reject(`Erro ao consultar o GSI: ${error.message}`);
      });
  });
}

const getBoardDb = (tableName, boardId) => {
  return new Promise((resolve, reject) => {
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
          resolve(formattedItem);
        } else {
          reject('NOT_FOUND');
        }
      })
      .catch((err) => {
        console.error('Erro ao consultar dados da tabela board:', err);
        reject('Erro ao consultar dados da tabela boad');
      });
  });
};

const getRoomDb = (tableName, roomId) => {
  return new Promise((resolve, reject) => {
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
          resolve(formattedItem);
        } else {
          reject('NOT_FOUND');
        }
      })
      .catch((err) => {
        console.error('Erro ao consultar dados da tabela board:', err);
        reject('Erro ao consultar dados da tabela boad');
      });
  });
};

const deleteBoardDb = (tableName, boardId, createdAt) => {
  return new Promise(async (resolve, reject) => {

    const params = {
      TableName: tableName,
      Key: {
        boardId: { S: boardId },
        createdAt: { S: createdAt }
      }
    };

    docClient.send(new DeleteItemCommand(params)) // Altere para DeleteItemCommand
      .then(() => {
        resolve('DELETED');
      })
      .catch((err) => {
        console.error('Erro ao deletar o board:', err);
        reject('Erro ao deletar o board');
      });
  });
};

module.exports = { putTable, getBoardByUserDb, getBoardDb, getRoomDb, deleteBoardDb }