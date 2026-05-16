const { getBoardDb } = require('../../services/database/dynamoService');
const config = require('../../config');
const log = require('../../utils/logger');

exports.handler = async (event) => {
  const { boardId } = event.pathParameters;

  log.debug('Get board request', { boardId });

  try {
    const data = await getBoardDb(config.TABLE_BOARD, boardId);
    log.debug('Get board success', { boardId });
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (error) {
    if (error === 'NOT_FOUND') {
      log.warn('Board não encontrado', { boardId });
      return { statusCode: 404, body: JSON.stringify({ error: 'Board não encontrado' }) };
    }
    log.error('Erro ao obter board', { boardId, error: error.message || error });
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao obter board' }) };
  }
};
