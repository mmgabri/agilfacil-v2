import axios from 'axios';

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };

const isDev = process.env.NODE_ENV !== 'production';

const resolveMinLevel = () => {
  const envOverride = process.env.REACT_APP_LOG_LEVEL;
  if (envOverride && LEVELS[envOverride] !== undefined) return LEVELS[envOverride];
  return isDev ? LEVELS.debug : LEVELS.info;
};

const minLevel = resolveMinLevel();

const COLORS = {
  debug: 'color:#9E9E9E',
  info:  'color:#2196F3;font-weight:bold',
  warn:  'color:#FF9800;font-weight:bold',
  error: 'color:#F44336;font-weight:bold',
};

function log(level, ctx, msg, data) {
  if ((LEVELS[level] ?? 0) < minLevel) return;

  const ts = new Date().toISOString();

  if (isDev) {
    const fn = level === 'error' ? console.error
             : level === 'warn'  ? console.warn
             : console.log;
    const prefix = `[${ts}] [${level.toUpperCase()}] [${ctx}]`;
    if (data !== undefined) {
      fn(`%c${prefix} ${msg}`, COLORS[level], data);
    } else {
      fn(`%c${prefix} ${msg}`, COLORS[level]);
    }
  } else {
    const entry = { ts, level, ctx, msg, ...(data !== undefined && { data }) };
    const fn = level === 'error' ? console.error
             : level === 'warn'  ? console.warn
             : console.log;
    fn(JSON.stringify(entry));
  }
}

const logger = {
  debug: (ctx, msg, data) => log('debug', ctx, msg, data),
  info:  (ctx, msg, data) => log('info',  ctx, msg, data),
  warn:  (ctx, msg, data) => log('warn',  ctx, msg, data),
  error: (ctx, msg, data) => log('error', ctx, msg, data),
};

// Registra interceptors no axios global (chamar uma vez em index.js)
export function setupAxiosLogger() {
  axios.interceptors.request.use((config) => {
    config._logT0 = Date.now();
    logger.debug('HTTP', `→ ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });

  axios.interceptors.response.use(
    (res) => {
      const ms = Date.now() - (res.config._logT0 ?? Date.now());
      logger.info('HTTP', `← ${res.status} ${res.config.method?.toUpperCase()} ${res.config.url} (${ms}ms)`);
      return res;
    },
    (err) => {
      const ms = err.config ? Date.now() - (err.config._logT0 ?? Date.now()) : 0;
      const status = err.response?.status ?? 'ERR';
      const method = err.config?.method?.toUpperCase() ?? '?';
      const url = err.config?.url ?? '?';
      logger.error('HTTP', `← ${status} ${method} ${url} (${ms}ms)`, { message: err.message });
      return Promise.reject(err);
    }
  );
}

export default logger;
