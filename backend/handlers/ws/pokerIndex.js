const { saveConnection, getConnection, deleteConnection } = require('../../services/connections/connectionsService');
const { getRoom, connectClient, desconnectClient, updateStatusRoom, updateVote } = require('../../services/poker/socketPokerService');
const { broadcastToSession, sendToConnection } = require('../../utils/broadcast');
const cloudWatch = require('../../services/generic/cloudWatchLoggerService');
const log = require('../../utils/logger');

const onConnect = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const endpoint = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;
  const { userName, userId, idSession } = event.queryStringParameters || {};

  log.info('Poker WS connect', { connectionId, userId, idSession, userName });
  await saveConnection(connectionId, { userName, userId, idSession, service: 'poker' });

  const start = performance.now();
  try {
    const room = await connectClient(userName, userId, idSession);
    // Exclui a própria conexão: AWS não permite PostToConnection durante o $connect dela.
    await broadcastToSession(endpoint, idSession, 'data_room', room, connectionId);
    const elapsed = (performance.now() - start).toFixed(3);
    log.debug('Poker connect success', { userId, idSession, roomName: room.roomName, elapsedMs: elapsed });
    cloudWatch.log('WEBSOCKET', 'connect', idSession, room.roomName, userId, userName, '', '', room.status, elapsed, 'success', 'Connect client successfully.');
  } catch (err) {
    const elapsed = (performance.now() - start).toFixed(3);
    log.error('Erro no $connect (poker)', { connectionId, userId, idSession, error: err.message });
    cloudWatch.log('WEBSOCKET', 'connect', idSession, '', userId, userName, '', '', '', elapsed, 'failed', err.message);
  }
  return { statusCode: 200 };
};

const onDisconnect = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const endpoint = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;

  const conn = await getConnection(connectionId);
  if (!conn) return { statusCode: 200 };

  log.info('Poker WS disconnect', { connectionId, userId: conn.userId, idSession: conn.idSession });
  await deleteConnection(connectionId);

  const start = performance.now();
  try {
    const room = await desconnectClient(conn.userId, conn.idSession);
    await broadcastToSession(endpoint, conn.idSession, 'data_room', room);
    const elapsed = (performance.now() - start).toFixed(3);
    log.debug('Poker disconnect success', { userId: conn.userId, idSession: conn.idSession, elapsedMs: elapsed });
    cloudWatch.log('WEBSOCKET', 'disconnect', conn.idSession, room.roomName, conn.userId, conn.userName, '', '', room.status, elapsed, 'success', 'Disconnect client successfully.');
  } catch (err) {
    const elapsed = (performance.now() - start).toFixed(3);
    log.error('Erro no $disconnect (poker)', { connectionId, userId: conn.userId, idSession: conn.idSession, error: err.message });
    cloudWatch.log('WEBSOCKET', 'disconnect', conn.idSession, '', conn.userId, conn.userName, '', '', '', elapsed, 'failed', err.message);
  }
  return { statusCode: 200 };
};

const onCommand = async (event) => {
  const body = JSON.parse(event.body);
  const endpoint = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;
  const start = performance.now();

  log.info('Poker command received', { command: body.comand, roomId: body.roomId });

  try {
    switch (body.comand) {
      case 'sync_room': {
        // Cliente recém-conectado: o broadcast do $connect exclui a própria
        // conexão (limitação da AWS), então ele pede o estado atual aqui,
        // já numa invocação separada onde PostToConnection para si mesmo funciona.
        const room = await getRoom(body.roomId);
        await sendToConnection(endpoint, event.requestContext.connectionId, 'data_room', room);
        const elapsed = (performance.now() - start).toFixed(3);
        log.debug('Poker room synced', { roomId: body.roomId, connectionId: event.requestContext.connectionId, elapsedMs: elapsed });
        break;
      }
      case 'update_status_room': {
        const room = await updateStatusRoom(body.roomId, body.status);
        await broadcastToSession(endpoint, body.roomId, 'data_room', room);
        const elapsed = (performance.now() - start).toFixed(3);
        log.info('Poker status updated', { roomId: room._id, roomName: room.roomName, status: room.status, elapsedMs: elapsed });
        cloudWatch.log('WEBSOCKET', 'update_status_room', room._id, room.roomName, '', '', '', '', room.status, elapsed, 'success', 'Update status room successfully.');
        break;
      }
      case 'votar': {
        const room = await updateVote(body.roomId, body.userId, body.vote);
        await broadcastToSession(endpoint, body.roomId, 'data_room', room);
        const elapsed = (performance.now() - start).toFixed(3);
        log.info('Poker vote registered', { roomId: body.roomId, userId: body.userId, vote: body.vote, elapsedMs: elapsed });
        cloudWatch.log('WEBSOCKET', 'votar', body.roomId, room.roomName, body.userId, body.userName, '', body.vote, room.status, elapsed, 'success', 'Vote successfully.');
        break;
      }
      default:
        log.warn('Comando poker não previsto', { command: body.comand, roomId: body.roomId });
        return { statusCode: 400 };
    }
  } catch (err) {
    log.error('Erro ao processar comando poker', { command: body.comand, roomId: body.roomId, error: err.message });
  }
  return { statusCode: 200 };
};

exports.handler = async (event) => {
  log.setCorrelationId(event.requestContext.requestId);
  switch (event.requestContext.routeKey) {
    case '$connect':             return onConnect(event);
    case '$disconnect':          return onDisconnect(event);
    case 'comand_socket_poker':  return onCommand(event);
    default:
      return { statusCode: 400 };
  }
};
