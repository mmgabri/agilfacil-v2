'use strict';

/**
 * POST /user/register
 *
 * Cria ou atualiza o registro do usuário após signup/login no Cognito.
 * Retorna { userId } — o identificador efetivo usado pela aplicação.
 */

const { registerUser } = require('../../services/user/controllerUserService');
const log = require('../../utils/logger');

exports.handler = async (event) => {
  const body = JSON.parse(event.body || '{}');
  const { email, cognitoSub, userName } = body;

  if (!email || !cognitoSub) {
    return { statusCode: 400, body: JSON.stringify({ error: 'email e cognitoSub são obrigatórios' }) };
  }

  log.debug('registerUser request', { email, cognitoSub });

  const result = await registerUser({ email, cognitoSub, userName });
  return { statusCode: 200, body: JSON.stringify(result) };
};
