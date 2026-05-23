const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');
const { getConnectionsBySession, deleteConnection } = require('../services/connections/connectionsService');
const log = require('./logger');

// Envia { type, data } para todos os clientes conectados na mesma sessão.
// excludeConnectionId: opcional — exclui a conexão que está no meio do $connect
//   (AWS não permite PostToConnection enquanto o $connect ainda está em execução).
// Conexões com status 410 (Gone) são removidas automaticamente do DynamoDB.
const broadcastToSession = async (endpoint, idSession, type, data, excludeConnectionId = null) => {
  const connections = await getConnectionsBySession(idSession);
  const targets = excludeConnectionId
    ? connections.filter(c => c.connectionId !== excludeConnectionId)
    : connections;

  log.debug('Broadcast to session', { idSession, type, connectionCount: connections.length, excluded: excludeConnectionId ?? 'none' });

  if (!targets.length) return;

  const client = new ApiGatewayManagementApiClient({ endpoint });
  const message = Buffer.from(JSON.stringify({ type, data }));

  await Promise.all(
    targets.map(async ({ connectionId }) => {
      try {
        await client.send(new PostToConnectionCommand({ ConnectionId: connectionId, Data: message }));
      } catch (err) {
        if (err.$metadata?.httpStatusCode === 410) {
          log.debug('Removendo conexão stale', { connectionId, idSession });
          await deleteConnection(connectionId);
        } else {
          log.error('Erro ao enviar para connectionId', { connectionId, idSession, error: err.message });
        }
      }
    })
  );
};

module.exports = { broadcastToSession };