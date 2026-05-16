const { getBoardByUserDb } = require('../../services/database/dynamoService');
const config = require('../../config');

exports.handler = async (event) => {
  const { creatorId } = event.pathParameters;

  try {
    const data = await getBoardByUserDb(config.TABLE_BOARD, config.BOARD_INDEX_NAME_USER, creatorId);
    return { statusCode: 200, body: JSON.stringify(data) };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao buscar boards do usuário' }) };
  }
};
