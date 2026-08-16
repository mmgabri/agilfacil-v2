output "http_api_url" {
  description = "URL da API REST — copie para SERVER_BASE_URL em frontend/src/constants/apiConstants.js"
  value       = aws_apigatewayv2_api.http.api_endpoint
}

output "ws_board_url" {
  description = "URL do WebSocket Board — copie para WS_BOARD_URL em frontend/src/constants/apiConstants.js"
  value       = "wss://${aws_apigatewayv2_api.ws_board.id}.execute-api.${var.aws_region}.amazonaws.com/prod"
}

output "ws_poker_url" {
  description = "URL do WebSocket Poker — copie para WS_POKER_URL em frontend/src/constants/apiConstants.js"
  value       = "wss://${aws_apigatewayv2_api.ws_poker.id}.execute-api.${var.aws_region}.amazonaws.com/prod"
}

output "sns_topic_arn" {
  description = "ARN do tópico SNS de alertas"
  value       = aws_sns_topic.alerts.arn
}

output "dynamodb_board_table" {
  value = local.board_table_name
}

output "dynamodb_room_table" {
  value = aws_dynamodb_table.room.name
}

output "dynamodb_connections_table" {
  value = aws_dynamodb_table.connections.name
}

# ─── Cognito ──────────────────────────────��───────────────────────────────────

output "cognito_user_pool_id" {
  description = "ID do User Pool — copie para aws_user_pools_id em frontend/src/aws-exports.js"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_user_pool_client_id" {
  description = "Client ID do app web — copie para aws_user_pools_web_client_id em frontend/src/aws-exports.js"
  value       = aws_cognito_user_pool_client.web.id
}

output "cognito_domain" {
  description = "Domínio completo do Cognito Hosted UI"
  value       = "${aws_cognito_user_pool_domain.main.domain}.auth.${var.aws_region}.amazoncognito.com"
}
