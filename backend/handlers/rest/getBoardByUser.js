const { getBoardByUserDb } = require('../../services/database/dynamoService');
const config = require('../../config');
const log = require('../../utils/logger');

exports.handler = async (event) => {
  const { creatorId } = event.pathParameters;

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
