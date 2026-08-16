'use strict';

/**
 * Handler unificado REST — agilfacil-rest
 * Roteia todas as requisições HTTP por routeKey.
 */

const log = require('../../utils/logger');

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
  'POST /support':                          require('./support'),
};

exports.handler = async (event) => {
  const routeKey = event.routeKey;

  log.debug('restIndex: request', {
    routeKey,
    queryStringParameters: event.queryStringParameters,
    body: event.body ? (() => { try { return JSON.parse(event.body); } catch { return event.body; } })() : undefined,
  });

  const handler = routes[routeKey];
  if (!handler) {
    const res = { statusCode: 404, body: JSON.stringify({ error: 'Rota não encontrada' }) };
    log.debug('restIndex: response', { routeKey, statusCode: 404 });
    return res;
  }

  try {
    const response = await handler.handler(event);
    log.debug('restIndex: response', { routeKey, statusCode: response.statusCode });
    return response;
  } catch (err) {
    log.error('restIndex: erro não tratado', { routeKey, message: err.message });
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro interno' }) };
  }
};
