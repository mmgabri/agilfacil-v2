const healthcheck    = require('./healthcheck');
const getBoard       = require('./getBoard');
const getBoardByUser = require('./getBoardByUser');
const createBoard    = require('./createBoard');
const deleteBoard    = require('./deleteBoard');

const routes = {
  'GET /healthcheck':                      healthcheck,
  'GET /board/{boardId}':                  getBoard,
  'GET /board/getBoardByUser/{creatorId}': getBoardByUser,
  'POST /board/createBoard':               createBoard,
  'DELETE /board/{boardId}':               deleteBoard,
};

exports.handler = async (event) => {
  const handler = routes[event.routeKey];
  if (!handler) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Rota não encontrada' }) };
  }
  return handler.handler(event);
};
