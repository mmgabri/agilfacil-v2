const { getBoardDb, deleteBoardDb } = require('../../services/database/dynamoService');
const config = require('../../config');
const log = require('../../utils/logger');
const { getAuthenticatedUserId } = require('../../utils/auth');

exports.handler = async (event) => {
  log.setCorrelationId(event.requestContext.requestId);
  const { boardId } = event.pathParameters;
  const userId = getAuthenticatedUserId(event);

  log.debug('Delete board request', { boardId, userId });

  try {
    const board = await getBoardDb(config.TABLE_BOARD, boardId);

    if (board.creatorId !== userId) {
      log.warn('Tentativa de excluir board de outro usuário', { boardId, userId, creatorId: board.creatorId });
      return { statusCode: 403, body: JSON.stringify({ error: 'Você não tem permissão para excluir este board' }) };
    }

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
