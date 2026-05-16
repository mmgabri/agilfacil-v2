const { getBoardDb } = require('../../services/database/dynamoService');
const config = require('../../config');

exports.handler = async (event) => {
  const { boardId } = event.pathParameters;

  try {
    const data = await getBoardDb(config.TABLE_BOARD, boardId);
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch (error) {
    if (error === 'NOT_FOUND') {
      return { statusCode: 404, body: JSON.stringify({ error: 'Board não encontrado' }) };
    }
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao obter board' }) };
  }
};
