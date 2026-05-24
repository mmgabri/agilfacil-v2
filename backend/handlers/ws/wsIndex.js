'use strict';

/**
 * Handler unificado WebSocket — agilfacil-ws
 *
 * Roteia eventos do API Gateway WebSocket para os handlers de domínio
 * (board ou poker) com base no routeKey e no parâmetro `service`.
 *
 * Board WS API  → routeKeys: $connect, $disconnect, comand_socket_board
 * Poker WS API  → routeKeys: $connect, $disconnect, comand_socket_poker
 */

const boardHandler = require('./boardIndex');
const pokerHandler = require('./pokerIndex');
const { getConnection } = require('../../services/connections/connectionsService');
const log = require('../../utils/logger');

exports.handler = async (event) => {
  const routeKey    = event.requestContext.routeKey;
  const connectionId = event.requestContext.connectionId;

  log.debug('wsIndex: request', {
    routeKey,
    connectionId,
    service: event.queryStringParameters?.service,
    body: event.body ? (() => { try { return JSON.parse(event.body); } catch { return event.body; } })() : undefined,
  });

  // ── Comandos de domínio: roteamento direto ─────────────────────────────────
  if (routeKey === 'comand_socket_board') return boardHandler.handler(event);
  if (routeKey === 'comand_socket_poker') return pokerHandler.handler(event);

  // ── $connect: usa query param `service` ───────────────────────────────────
  if (routeKey === '$connect') {
    const service = event.queryStringParameters?.service;
    if (service === 'poker') return pokerHandler.handler(event);
    return boardHandler.handler(event); // padrão: board
  }

  // ── $disconnect: consulta a tabela de conexões para descobrir o serviço ───
  if (routeKey === '$disconnect') {
    const connectionId = event.requestContext.connectionId;
    try {
      const conn = await getConnection(connectionId);
      if (conn?.service === 'poker') return pokerHandler.handler(event);
    } catch (err) {
      log.warn('wsIndex: erro ao buscar conexão para $disconnect', { connectionId, error: err.message });
    }
    return boardHandler.handler(event); // padrão: board
  }

  log.warn('wsIndex: routeKey não reconhecido', { routeKey });
  return { statusCode: 400 };
};
