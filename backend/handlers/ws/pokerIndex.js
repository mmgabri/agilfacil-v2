const { saveConnection, getConnection, deleteConnection } = require('../../services/connections/connectionsService');
const { connectClient, desconnectClient, updateStatusRoom, updateVote } = require('../../services/poker/socketPokerService');
const { broadcastToSession } = require('../../utils/broadcast');
const logger = require('../../services/generic/cloudWatchLoggerService');

const onConnect = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const endpoint = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;
  const { userName, userId, idSession } = event.queryStringParameters || {};

  await saveConnection(connectionId, { userName, userId, idSession, service: 'poker' });

  const start = performance.now();
  try {
    const room = await connectClient(userName, userId, idSession);
    await broadcastToSession(endpoint, idSession, 'data_room', room);
    logger.log('WEBSOCKET', 'connect', idSession, room.roomName, userId, userName, '', '', room.status, (performance.now() - start).toFixed(3), 'success', 'Connect client successfully.');
  } catch (err) {
    logger.log('WEBSOCKET', 'connect', idSession, '', userId, userName, '', '', '', (performance.now() - start).toFixed(3), 'failed', err.message);
    console.error('Erro no $connect (poker):', err);
  }
  return { statusCode: 200 };
};

const onDisconnect = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const endpoint = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;

  const conn = await getConnection(connectionId);
  if (!conn) return { statusCode: 200 };

  await deleteConnection(connectionId);

  const start = performance.now();
  try {
    const room = await desconnectClient(conn.userId, conn.idSession);
    await broadcastToSession(endpoint, conn.idSession, 'data_room', room);
    logger.log('WEBSOCKET', 'disconnect', conn.idSession, room.roomName, conn.userId, conn.userName, '', '', room.status, (performance.now() - start).toFixed(3), 'success', 'Disconnect client successfully.');
  } catch (err) {
    logger.log('WEBSOCKET', 'disconnect', conn.idSession, '', conn.userId, conn.userName, '', '', '', (performance.now() - start).toFixed(3), 'failed', err.message);
    console.error('Erro no $disconnect (poker):', err);
  }
  return { statusCode: 200 };
};

const onCommand = async (event) => {
  const body = JSON.parse(event.body);
  const endpoint = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;
  const start = performance.now();

  try {
    switch (body.comand) {
      case 'update_status_room': {
        const room = await updateStatusRoom(body.roomId, body.status);
        await broadcastToSession(endpoint, body.roomId, 'data_room', room);
        logger.log('WEBSOCKET', 'update_status_room', room._id, room.roomName, '', '', '', '', room.status, (performance.now() - start).toFixed(3), 'success', 'Update status room successfully.');
        break;
      }
      case 'votar': {
        const room = await updateVote(body.roomId, body.userId, body.vote);
        await broadcastToSession(endpoint, body.roomId, 'data_room', room);
        logger.log('WEBSOCKET', 'votar', body.roomId, room.roomName, body.userId, body.userName, '', body.vote, room.status, (performance.now() - start).toFixed(3), 'success', 'Vote successfully.');
        break;
      }
      default:
        console.error('Comando poker não previsto:', body.comand);
        return { statusCode: 400 };
    }
  } catch (err) {
    console.error('Erro ao processar comando poker:', err);
  }
  return { statusCode: 200 };
};

exports.handler = async (event) => {
  switch (event.requestContext.routeKey) {
    case '$connect':             return onConnect(event);
    case '$disconnect':          return onDisconnect(event);
    case 'comand_socket_poker':  return onCommand(event);
    default:
      return { statusCode: 400 };
  }
};
