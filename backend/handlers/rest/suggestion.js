const SnsService = require('../../services/generic/snsService');
const cloudWatch = require('../../services/generic/cloudWatchLoggerService');
const log = require('../../utils/logger');

const sns = new SnsService(process.env.REGION || 'sa-east-1');

exports.handler = async (event) => {
  log.setCorrelationId(event.requestContext.requestId);
  const start = performance.now();
  const body = JSON.parse(event.body);

  log.debug('Suggestion request', { userName: body.userName, email: body.email });

  try {
    await sns.suggestionNotification(body.userName, body.email, body.suggestion);
    const elapsed = (performance.now() - start).toFixed(3);
    log.info('Suggestion sent', { userName: body.userName, email: body.email, elapsedMs: elapsed });
    cloudWatch.log('API', 'suggestion', '', '', '', body.userName, '', '', '', elapsed, 'success', 'Suggestion created successfully.', body.email, body.suggestion);
    return { statusCode: 200, body: JSON.stringify('success!') };
  } catch (err) {
    const elapsed = (performance.now() - start).toFixed(3);
    log.error('Erro ao enviar sugestão', { userName: body.userName, error: err.message || err, elapsedMs: elapsed });
    cloudWatch.log('API', 'suggestion', '', '', '', body.userName, '', '', '', elapsed, 'failed', 'Error creating suggestion.');
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao enviar sugestão' }) };
  }
};
