'use strict';

/**
 * Handler unificado AUTH — agilfacil-auth
 *
 * Rotas:
 *   GET  /auth/status      → consulta status do usuário no Cognito
 *   POST /auth/set-password → conclui o desafio NEW_PASSWORD_REQUIRED
 */

const { getAuthStatus, setPassword } = require('../../services/auth/controllerAuthService');
const log = require('../../utils/logger');

const routes = {
  'GET /auth/status': async (event) => {
    const email = event.queryStringParameters?.email;
    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Parâmetro email é obrigatório' }) };
    }
    const result = await getAuthStatus(email);
    return { statusCode: 200, body: JSON.stringify(result) };
  },

  'POST /auth/set-password': async (event) => {
    const body = JSON.parse(event.body || '{}');
    const { email, password } = body;
    if (!email || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: 'email e password são obrigatórios' }) };
    }
    await setPassword(email, password);
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  },
};

// Omite campos sensíveis do body no log
const sanitizeBody = (raw) => {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw);
    const { password, ...safe } = parsed;  // nunca loga senha
    return password !== undefined ? { ...safe, password: '***' } : safe;
  } catch {
    return raw;
  }
};

exports.handler = async (event) => {
  const routeKey = event.routeKey;

  log.debug('authIndex: request', {
    routeKey,
    queryStringParameters: event.queryStringParameters,
    body: sanitizeBody(event.body),
  });

  const handler = routes[routeKey];
  if (!handler) {
    log.debug('authIndex: response', { routeKey, statusCode: 404 });
    return { statusCode: 404, body: JSON.stringify({ error: 'Rota não encontrada' }) };
  }
  try {
    const response = await handler(event);
    log.debug('authIndex: response', { routeKey, statusCode: response.statusCode });
    return response;
  } catch (err) {
    log.error('authIndex: erro não tratado', { routeKey, message: err.message });
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
