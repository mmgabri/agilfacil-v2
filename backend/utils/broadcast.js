const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');
const { getConnectionsBySession, deleteConnection } = require('../services/connections/connectionsService');

// Envia { type, data } para todos os clientes conectados na mesma sessão.
// Conexões com status 410 (Gone) são removidas automaticamente do DynamoDB.
const broadcastToSession = async (endpoint, idSession, type, data) => {
  const connections = await getConnectionsBySession(idSession);
  if (!connections.length) return;

  const client = new ApiGatewayManagementApiClient({ endpoint });
  const message = Buffer.from(JSON.stringify({ type, data }));

  await Promise.all(
    connections.map(async ({ connectionId }) => {
      try {
        await client.send(new PostToConnectionCommand({ ConnectionId: connectionId, Data: message }));
      } catch (err) {
        if (err.$metadata?.httpStatusCode === 410) {
          await deleteConnection(connectionId);
        } else {
          console.error(`Erro ao enviar para connectionId ${connectionId}:`, err);
        }
      }
    })
  );
};

module.exports = { broadcastToSession };
