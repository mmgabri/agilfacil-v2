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
  value = aws_dynamodb_table.board.name
}

output "dynamodb_room_table" {
  value = aws_dynamodb_table.room.name
}

output "dynamodb_connections_table" {
  value = aws_dynamodb_table.connections.name
}
