const createRoom = require('./createRoom');
const getRoom    = require('./getRoom');
const suggestion = require('./suggestion');

const routes = {
  'POST /poker/createRoom': createRoom,
  'GET /rooms/{id}':        getRoom,
  'POST /suggestion':       suggestion,
};

exports.handler = async (event) => {
  const handler = routes[event.routeKey];
  if (!handler) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Rota não encontrada' }) };
  }
  return handler.handler(event);
};
