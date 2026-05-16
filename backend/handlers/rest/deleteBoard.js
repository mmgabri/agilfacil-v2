const { getBoardDb, deleteBoardDb } = require('../../services/database/dynamoService');
const config = require('../../config');

exports.handler = async (event) => {
  const { boardId } = event.pathParameters;

  try {
    const board = await getBoardDb(config.TABLE_BOARD, boardId);
    await deleteBoardDb(config.TABLE_BOARD, boardId, board.createdAt);
    return { statusCode: 204, body: '' };
  } catch (error) {
    if (error === 'NOT_FOUND') {
      return { statusCode: 404, body: JSON.stringify({ error: 'Board não encontrado' }) };
    }
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao deletar board' }) };
  }
};
