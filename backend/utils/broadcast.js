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

// Envia { type, data } para uma única conexão específica.
// Usado quando um cliente recém-conectado precisa do estado atual, já que
// broadcastToSession exclui a própria conexão durante o $connect (ver acima).
const sendToConnection = async (endpoint, connectionId, type, data) => {
  const client = new ApiGatewayManagementApiClient({ endpoint });
  const message = Buffer.from(JSON.stringify({ type, data }));

  try {
    await client.send(new PostToConnectionCommand({ ConnectionId: connectionId, Data: message }));
  } catch (err) {
    if (err.$metadata?.httpStatusCode === 410) {
      log.debug('Removendo conexão stale', { connectionId });
      await deleteConnection(connectionId);
    } else {
      log.error('Erro ao enviar para connectionId', { connectionId, error: err.message });
    }
  }
};

module.exports = { broadcastToSession, sendToConnection };