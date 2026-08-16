const { getBoardByUserDb } = require('../../services/database/dynamoService');
const config = require('../../config');
const log = require('../../utils/logger');
const { getAuthenticatedUserId } = require('../../utils/auth');

exports.handler = async (event) => {
  log.setCorrelationId(event.requestContext.requestId);
  const { creatorId } = event.pathParameters;
  const userId = getAuthenticatedUserId(event);

  if (creatorId !== userId) {
    log.warn('Tentativa de listar boards de outro usuário', { creatorId, userId });
    return { statusCode: 403, body: JSON.stringify({ error: 'Você não tem permissão para acessar estes boards' }) };
  }

  log.debug('Get boards by user request', { creatorId });

  try {
    const data = await getBoardByUserDb(config.TABLE_BOARD, config.BOARD_INDEX_NAME_USER, creatorId);
    log.debug('Get boards by user success', { creatorId, count: data.length });
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (err) {
    log.error('Erro ao buscar boards do usuário', { creatorId, error: err.message || err });
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao buscar boards do usuário' }) };
  }
};
