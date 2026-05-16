const { saveConnection, getConnection, deleteConnection } = require('../../services/connections/connectionsService');
const { connectClientBoard, disconnectClientBoard, addCardBoard, reorderBoard, processCombine, deleteColumn, addColumn, updateTitleColumn, updateLike, deleteCard, deleteAllCard, saveCard, updatecolorCards, setIsObfuscatedBoardLevel, setIsObfuscatedColumnLevel } = require('../../services/board/socketBoardService');
const { broadcastToSession } = require('../../utils/broadcast');

const onConnect = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const endpoint = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;
  const { userName, userId, idSession } = event.queryStringParameters || {};

  await saveConnection(connectionId, { userName, userId, idSession, service: 'board' });

  try {
    const board = await connectClientBoard(idSession, userId);
    await broadcastToSession(endpoint, idSession, 'data_board', board);
  } catch (err) {
    console.error('Erro no $connect (board):', err);
  }
  return { statusCode: 200 };
};

const onDisconnect = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const endpoint = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;

  const conn = await getConnection(connectionId);
  if (!conn) return { statusCode: 200 };

  await deleteConnection(connectionId);

  try {
    const board = await disconnectClientBoard(conn.userId, conn.idSession);
    await broadcastToSession(endpoint, conn.idSession, 'data_board', board);
  } catch (err) {
    console.error('Erro no $disconnect (board):', err);
  }
  return { statusCode: 200 };
};

const onCommand = async (event) => {
  const body = JSON.parse(event.body);
  const endpoint = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;

  try {
    let board;
    switch (body.comand) {
      case 'add_card_board':              board = await addCardBoard(body.boardId, body.newCard, body.indexColumn); break;
      case 'reorder_board':              board = await reorderBoard(body.boardId, body.source, body.destination); break;
      case 'combine_card':              board = await processCombine(body.boardId, body.source, body.combine); break;
      case 'delete_column':              board = await deleteColumn(body.boardId, body.index); break;
      case 'add_collumn':               board = await addColumn(body.boardId, body.newCollumn); break;
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
        console.error('Comando board não previsto:', body.comand);
        return { statusCode: 400 };
    }
    await broadcastToSession(endpoint, body.boardId, 'data_board', board);
  } catch (err) {
    console.error('Erro ao processar comando board:', err);
  }
  return { statusCode: 200 };
};

exports.handler = async (event) => {
  switch (event.requestContext.routeKey) {
    case '$connect':            return onConnect(event);
    case '$disconnect':         return onDisconnect(event);
    case 'comand_socket_board': return onCommand(event);
    default:
      return { statusCode: 400 };
  }
};
