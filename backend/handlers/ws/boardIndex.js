const { saveConnection, getConnection, deleteConnection } = require('../../services/connections/connectionsService');
const { getBoard, connectClientBoard, disconnectClientBoard, addCardBoard, reorderBoard, processCombine, deleteColumn, addColumn, updateTitleColumn, updateLike, deleteCard, deleteAllCard, saveCard, updatecolorCards, setIsObfuscatedBoardLevel, setIsObfuscatedColumnLevel } = require('../../services/board/socketBoardService');
const { broadcastToSession, sendToConnection } = require('../../utils/broadcast');
const log = require('../../utils/logger');

const onConnect = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const endpoint = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;
  const { userName, userId, idSession } = event.queryStringParameters || {};

  log.info('Board WS connect', { connectionId, userId, idSession, userName });
  await saveConnection(connectionId, { userName, userId, idSession, service: 'board' });

  try {
    const board = await connectClientBoard(idSession, userId);
    // Exclui a própria conexão: AWS não permite PostToConnection durante o $connect dela.
    await broadcastToSession(endpoint, idSession, 'data_board', board, connectionId);
  } catch (err) {
    log.error('Erro no $connect (board)', { connectionId, userId, idSession, error: err.message });
  }
  return { statusCode: 200 };
};

const onDisconnect = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const endpoint = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;

  const conn = await getConnection(connectionId);
  if (!conn) return { statusCode: 200 };

  log.info('Board WS disconnect', { connectionId, userId: conn.userId, idSession: conn.idSession });
  await deleteConnection(connectionId);

  try {
    const board = await disconnectClientBoard(conn.userId, conn.idSession);
    await broadcastToSession(endpoint, conn.idSession, 'data_board', board);
  } catch (err) {
    log.error('Erro no $disconnect (board)', { connectionId, userId: conn.userId, idSession: conn.idSession, error: err.message });
  }
  return { statusCode: 200 };
};

const onCommand = async (event) => {
  const body = JSON.parse(event.body);
  const endpoint = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;
  const start = performance.now();

  log.info('Board command received', { command: body.comand, boardId: body.boardId });

  try {
    if (body.comand === 'sync_board') {
      // Cliente recém-conectado: o broadcast do $connect exclui a própria
      // conexão (limitação da AWS), então ele pede o estado atual aqui,
      // já numa invocação separada onde PostToConnection para si mesmo funciona.
      const board = await getBoard(body.boardId);
      await sendToConnection(endpoint, event.requestContext.connectionId, 'data_board', board);
      log.debug('Board synced', { boardId: body.boardId, connectionId: event.requestContext.connectionId, elapsedMs: (performance.now() - start).toFixed(3) });
      return { statusCode: 200 };
    }

    let board;
    switch (body.comand) {
      case 'add_card_board':
        log.debug('Board add card', { boardId: body.boardId, indexColumn: body.indexColumn, cardId: body.newCard?.id });
        board = await addCardBoard(body.boardId, body.newCard, body.indexColumn); break;
      case 'reorder_board':
        log.debug('Board reorder', { boardId: body.boardId, source: body.source, destination: body.destination });
        board = await reorderBoard(body.boardId, body.source, body.destination); break;
      case 'combine_card':
        log.debug('Board combine card', { boardId: body.boardId, source: body.source, combine: body.combine });
        board = await processCombine(body.boardId, body.source, body.combine); break;
      case 'delete_column':              board = await deleteColumn(body.boardId, body.index); break;
      case 'add_column':                board = await addColumn(body.boardId, body.newColumn); break;
      case 'update_title_column':       board = await updateTitleColumn(body.boardId, body.content, body.index); break;
      case 'update_color_cards':        board = await updatecolorCards(body.boardId, body.colorCards, body.index); break;
      case 'update_like':               board = await updateLike(body.boardId, body.isIncrement, body.indexCard, body.indexColumn); break;
      case 'delete_card':               board = await deleteCard(body.boardId, body.indexCard, body.indexColumn); break;
      case 'delete_all_card':           board = await deleteAllCard(body.boardId, body.indexColumn); break;
      case 'save_card':                 board = await saveCard(body.boardId, body.content, body.indexCard, body.indexColumn); break;
      case 'set_is_obfuscated_board_level':  board = await setIsObfuscatedBoardLevel(body.boardId, body.isObfuscated); break;
      case 'set_is_obfuscated_column_level': board = await setIsObfuscatedColumnLevel(body.boardId, body.isObfuscated, body.index); break;
      case 'timer_control_board':
        board = { isTimerControl: true, timer: body.timer, timeInput: body.timeInput, isRunningTimer: body.isRunningTimer, userId: body.userId };
        break;
      default:
        log.warn('Comando board não previsto', { command: body.comand, boardId: body.boardId });
        return { statusCode: 400 };
    }
    await broadcastToSession(endpoint, body.boardId, 'data_board', board);
    log.debug('Board command processed', { command: body.comand, boardId: body.boardId, elapsedMs: (performance.now() - start).toFixed(3) });
  } catch (err) {
    log.error('Erro ao processar comando board', { command: body.comand, boardId: body.boardId, error: err.message });
  }
  return { statusCode: 200 };
};

exports.handler = async (event) => {
  log.setCorrelationId(event.requestContext.requestId);
  switch (event.requestContext.routeKey) {
    case '$connect':            return onConnect(event);
    case '$disconnect':         return onDisconnect(event);
    case 'comand_socket_board': return onCommand(event);
    default:
      return { statusCode: 400 };
  }
};
