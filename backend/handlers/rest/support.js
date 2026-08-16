const SnsService = require('../../services/generic/snsService');
const cloudWatch = require('../../services/generic/cloudWatchLoggerService');
const log = require('../../utils/logger');

const sns = new SnsService(process.env.REGION || 'sa-east-1');

exports.handler = async (event) => {
  log.setCorrelationId(event.requestContext.requestId);
  const start = performance.now();
  const body = JSON.parse(event.body);

  log.debug('Support request', { userName: body.userName, email: body.email });

  try {
    await sns.supportNotification(body.userName, body.email, body.message);
    const elapsed = (performance.now() - start).toFixed(3);
    log.info('Support request sent', { userName: body.userName, email: body.email, elapsedMs: elapsed });
    cloudWatch.log('API', 'support', '', '', '', body.userName, '', '', '', elapsed, 'success', 'Support request created successfully.', body.email, body.message);
    return { statusCode: 200, body: JSON.stringify('success!') };
  } catch (err) {
    const elapsed = (performance.now() - start).toFixed(3);
    log.error('Erro ao enviar solicitação de suporte', { userName: body.userName, error: err.message || err, elapsedMs: elapsed });
    cloudWatch.log('API', 'support', '', '', '', body.userName, '', '', '', elapsed, 'failed', 'Error creating support request.');
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao enviar solicitação de suporte' }) };
  }
};
