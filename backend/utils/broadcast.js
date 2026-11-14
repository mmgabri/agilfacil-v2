const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');
const { getConnectionsBySession } = require('../services/connections/connectionsService');
const log = require('./logger');

// Envia { type, data } para todos os clientes conectados na mesma sessão.
// excludeConnectionId: opcional — exclui a conexão que está no meio do $connect
//   (AWS não permite PostToConnection enquanto o $connect ainda está em execução).
// Conexões com status 410 (Gone) NÃO são removidas aqui: o $disconnect dessa
// conexão chega logo em seguida e precisa do registro (userId/idSession) para
// tirar o usuário da lista de online. Se o $disconnect nunca chegar, o TTL da
// tabela de conexões (24h) remove o registro.
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
          log.debug('Conexão stale (410) — aguardando $disconnect', { connectionId, idSession });
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
      log.debug('Conexão stale (410) — aguardando $disconnect', { connectionId });
    } else {
      log.error('Erro ao enviar para connectionId', { connectionId, error: err.message });
    }
  }
};

module.exports = { broadcastToSession, sendToConnection };