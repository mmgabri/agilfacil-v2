// URLs por ambiente — configuráveis via variáveis REACT_APP_* (CRA só expõe
// variáveis com esse prefixo ao bundle do browser).
//
// O CRA carrega automaticamente:
//   npm start        → .env.development (+ .env.development.local)
//   npm run build     → .env.production  (+ .env.production.local)
// Arquivos .local não são versionados — use para overrides só da sua máquina.
//
// Se a variável não estiver definida em nenhum .env, cai no valor padrão abaixo
// (o mesmo que já estava em produção). Ou seja: build de produção funciona sem
// nenhum .env.production presente; crie um só quando precisar apontar para uma
// infraestrutura diferente (ex: depois de subir uma nova instância/API na AWS).
//
// Variáveis aceitas: REACT_APP_FRONT_BASE_URL, REACT_APP_SERVER_BASE_URL,
// REACT_APP_WS_BOARD_URL, REACT_APP_WS_POKER_URL.

const isProd = process.env.NODE_ENV === 'production';

export const FRONT_BASE_URL  = process.env.REACT_APP_FRONT_BASE_URL
  || (isProd ? "https://agilfacil.com.br" : "http://localhost:3000");

export const SERVER_BASE_URL = process.env.REACT_APP_SERVER_BASE_URL
  || "https://v2ffd9vlb9.execute-api.sa-east-1.amazonaws.com";

export const WS_BOARD_URL    = process.env.REACT_APP_WS_BOARD_URL
  || "wss://00vttvrn94.execute-api.sa-east-1.amazonaws.com/prod";

export const WS_POKER_URL    = process.env.REACT_APP_WS_POKER_URL
  || "wss://25ta0xokgl.execute-api.sa-east-1.amazonaws.com/prod";
