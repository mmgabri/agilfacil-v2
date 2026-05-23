'use strict';

/**
 * GET /user?email=...
 *
 * Consulta o registro do usuário pelo e-mail.
 * Retorna 404 se não encontrado; 200 com { userId, userName, migrated } se encontrado.
 */

const { checkEmail } = require('../../services/user/controllerUserService');
const log = require('../../utils/logger');

exports.handler = async (event) => {
  const email = event.queryStringParameters?.email;
  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Parâmetro email é obrigatório' }) };
  }

  log.debug('getUser: checkEmail', { email });

  const result = await checkEmail(email);
  if (!result) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Usuário não encontrado' }) };
  }

  return { statusCode: 200, body: JSON.stringify(result) };
};
