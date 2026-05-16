const { getRoomDb } = require('../../services/database/dynamoService');
const config = require('../../config');

exports.handler = async (event) => {
  const { id } = event.pathParameters;

  try {
    const data = await getRoomDb(config.TABLE_ROOM, id);
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (error) {
    if (error === 'NOT_FOUND') {
      return { statusCode: 404, body: JSON.stringify({ error: 'Sala não encontrada' }) };
    }
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao obter sala' }) };
  }
};
