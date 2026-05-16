const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, DeleteCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.REGION || 'sa-east-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_CONNECTIONS = process.env.TABLE_CONNECTIONS || 'connections';

const saveConnection = async (connectionId, { userName, userId, idSession, service }) => {
  const ttl = Math.floor(Date.now() / 1000) + 86400; // expira em 24h
  await docClient.send(new PutCommand({
    TableName: TABLE_CONNECTIONS,
    Item: {
      connectionId,
      userName: userName || '',
      userId: userId || '',
      idSession: idSession || '',
      service: service || '',
      ttl,
    },
  }));
};

const getConnection = async (connectionId) => {
  const result = await docClient.send(new GetCommand({
    TableName: TABLE_CONNECTIONS,
    Key: { connectionId },
  }));
  return result.Item;
};

const deleteConnection = async (connectionId) => {
  await docClient.send(new DeleteCommand({
    TableName: TABLE_CONNECTIONS,
    Key: { connectionId },
  }));
};

const getConnectionsBySession = async (idSession) => {
  const result = await docClient.send(new QueryCommand({
    TableName: TABLE_CONNECTIONS,
    IndexName: 'idSessionIndex',
    KeyConditionExpression: 'idSession = :idSession',
    ExpressionAttributeValues: { ':idSession': idSession },
  }));
  return result.Items || [];
};

module.exports = { saveConnection, getConnection, deleteConnection, getConnectionsBySession };
