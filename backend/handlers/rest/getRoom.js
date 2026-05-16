const { getRoomDb } = require('../../services/database/dynamoService');
const config = require('../../config');
const log = require('../../utils/logger');

exports.handler = async (event) => {
  const { id } = event.pathParameters;

  log.debug('Get room request', { roomId: id });

  try {
    const data = await getRoomDb(config.TABLE_ROOM, id);
    log.debug('Get room success', { roomId: id, roomName: data.roomName });
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (error) {
    if (error === 'NOT_FOUND') {
      log.warn('Sala não encontrada', { roomId: id });
      return { statusCode: 404, body: JSON.stringify({ error: 'Sala não encontrada' }) };
    }
    log.error('Erro ao obter sala', { roomId: id, error: error.message || error });
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao obter sala' }) };
  }
};
