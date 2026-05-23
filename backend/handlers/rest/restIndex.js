'use strict';

/**
 * Handler unificado REST — agilfacil-rest
 * Roteia todas as requisições HTTP por routeKey.
 */

const routes = {
  // ── Board ──────────────────────────────────────────────────────────────────
  'GET /healthcheck':                       require('./healthcheck'),
  'GET /board/{boardId}':                   require('./getBoard'),
  'GET /board/getBoardByUser/{creatorId}':  require('./getBoardByUser'),
  'POST /board/createBoard':                require('./createBoard'),
  'DELETE /board/{boardId}':                require('./deleteBoard'),
  // ── Poker ──────────────────────────────────────────────────────────────────
  'POST /poker/createRoom':                 require('./createRoom'),
  'GET /rooms/{id}':                        require('./getRoom'),
  'POST /suggestion':                       require('./suggestion'),
  // ── Users ──────────────────────────────────────────────────────────────────
  'GET /user':                              require('./getUser'),
  'POST /user/register':                    require('./registerUser'),
};

exports.handler = async (event) => {
  const handler = routes[event.routeKey];
  if (!handler) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Rota não encontrada' }) };
  }
  return handler.handler(event);
};
