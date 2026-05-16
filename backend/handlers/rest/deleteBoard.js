const { getBoardDb, deleteBoardDb } = require('../../services/database/dynamoService');
const config = require('../../config');
const log = require('../../utils/logger');

exports.handler = async (event) => {
  const { boardId } = event.pathParameters;

  log.debug('Delete board request', { boardId });

  try {
    const board = await getBoardDb(config.TABLE_BOARD, boardId);
    await deleteBoardDb(config.TABLE_BOARD, boardId, board.createdAt);
    log.info('Board deleted', { boardId, boardName: board.boardName, creatorId: board.creatorId });
    return { statusCode: 204, body: '' };
  } catch (error) {
    if (error === 'NOT_FOUND') {
      log.warn('Board não encontrado para deletar', { boardId });
      return { statusCode: 404, body: JSON.stringify({ error: 'Board não encontrado' }) };
    }
    log.error('Erro ao deletar board', { boardId, error: error.message || error });
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao deletar board' }) };
  }
};
