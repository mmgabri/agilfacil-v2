const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const currentLevel = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.debug;

// Mapeia cada nível ao console method correto para que o Lambda
// rotule corretamente no CloudWatch (@level = DEBUG/INFO/WARN/ERROR).
const CONSOLE = {
  debug: console.debug,
  info:  console.info,
  warn:  console.warn,
  error: console.error,
};

// Correlation ID da invocação corrente. Resetado a cada request via setCorrelationId().
let _correlationId = null;

function log(level, message, context = {}) {
  if (LEVELS[level] < currentLevel) return;
  CONSOLE[level](JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    correlationId: _correlationId,
    message,
    ...context,
  }));
}

module.exports = {
  debug: (msg, ctx = {}) => log('debug', msg, ctx),
  info:  (msg, ctx = {}) => log('info',  msg, ctx),
  warn:  (msg, ctx = {}) => log('warn',  msg, ctx),
  error: (msg, ctx = {}) => log('error', msg, ctx),
  setCorrelationId: (id) => { _correlationId = id; },
};
