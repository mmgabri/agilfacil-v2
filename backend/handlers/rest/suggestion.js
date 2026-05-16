const SnsService = require('../../services/generic/snsService');
const logger = require('../../services/generic/cloudWatchLoggerService');

const sns = new SnsService(process.env.REGION || 'sa-east-1');

exports.handler = async (event) => {
  const start = performance.now();
  const body = JSON.parse(event.body);

  try {
    await sns.suggestionNotification(body.userName, body.email, body.suggestion);
    const elapsed = (performance.now() - start).toFixed(3);
    logger.log('API', 'suggestion', '', '', '', body.userName, '', '', '', elapsed, 'success', 'Suggestion created successfully.', body.email, body.suggestion);
    return { statusCode: 200, body: JSON.stringify('success!') };
  } catch {
    const elapsed = (performance.now() - start).toFixed(3);
    logger.log('API', 'suggestion', '', '', '', body.userName, '', '', '', elapsed, 'failed', 'Error creating suggestion.');
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao enviar sugestão' }) };
  }
};
