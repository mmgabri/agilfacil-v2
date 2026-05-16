// Substituir os valores <...> pelos outputs do "terraform apply"
// output "http_api_url"  → SERVER_BASE_URL
// output "ws_board_url"  → WS_BOARD_URL
// output "ws_poker_url"  → WS_POKER_URL

//DEV
//export const SERVER_BASE_URL = "https://<HTTP_API_ID>.execute-api.ap-south-1.amazonaws.com";
//export const FRONT_BASE_URL  = "http://localhost:3000";
//export const WS_BOARD_URL    = "wss://<WS_BOARD_API_ID>.execute-api.ap-south-1.amazonaws.com/prod";
//export const WS_POKER_URL    = "wss://<WS_POKER_API_ID>.execute-api.ap-south-1.amazonaws.com/prod";

//PROD
//export const FRONT_BASE_URL  = "https://agilfacil.com.br";
export const FRONT_BASE_URL  = "http://localhost:3000";
export const SERVER_BASE_URL = "https://v2ffd9vlb9.execute-api.sa-east-1.amazonaws.com";
export const WS_BOARD_URL    = "wss://00vttvrn94.execute-api.sa-east-1.amazonaws.com/prod";
export const WS_POKER_URL    = "wss://25ta0xokgl.execute-api.sa-east-1.amazonaws.com/prod";
