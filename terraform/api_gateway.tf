# ── Board WebSocket API ───────────────────────────────────────────────────────
resource "aws_apigatewayv2_api" "ws_board" {
  name                       = "agilfacil-board-ws"
  protocol_type              = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
}

resource "aws_apigatewayv2_stage" "ws_board_prod" {
  api_id      = aws_apigatewayv2_api.ws_board.id
  name        = "prod"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "ws_board" {
  api_id           = aws_apigatewayv2_api.ws_board.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.ws_board.invoke_arn
}

resource "aws_apigatewayv2_route" "ws_board_connect" {
  api_id    = aws_apigatewayv2_api.ws_board.id
  route_key = "$connect"
  target    = "integrations/${aws_apigatewayv2_integration.ws_board.id}"
}

resource "aws_apigatewayv2_route" "ws_board_disconnect" {
  api_id    = aws_apigatewayv2_api.ws_board.id
  route_key = "$disconnect"
  target    = "integrations/${aws_apigatewayv2_integration.ws_board.id}"
}

resource "aws_apigatewayv2_route" "ws_board_commands" {
  api_id    = aws_apigatewayv2_api.ws_board.id
  route_key = "comand_socket_board"
  target    = "integrations/${aws_apigatewayv2_integration.ws_board.id}"
}

resource "aws_lambda_permission" "apigw_ws_board" {
  statement_id  = "AllowBoardWSAPIInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ws_board.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.ws_board.execution_arn}/*/*"
}

# ── Poker WebSocket API ───────────────────────────────────────────────────────
resource "aws_apigatewayv2_api" "ws_poker" {
  name                       = "agilfacil-poker-ws"
  protocol_type              = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
}

resource "aws_apigatewayv2_stage" "ws_poker_prod" {
  api_id      = aws_apigatewayv2_api.ws_poker.id
  name        = "prod"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "ws_poker" {
  api_id           = aws_apigatewayv2_api.ws_poker.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.ws_poker.invoke_arn
}

resource "aws_apigatewayv2_route" "ws_poker_connect" {
  api_id    = aws_apigatewayv2_api.ws_poker.id
  route_key = "$connect"
  target    = "integrations/${aws_apigatewayv2_integration.ws_poker.id}"
}

resource "aws_apigatewayv2_route" "ws_poker_disconnect" {
  api_id    = aws_apigatewayv2_api.ws_poker.id
  route_key = "$disconnect"
  target    = "integrations/${aws_apigatewayv2_integration.ws_poker.id}"
}

resource "aws_apigatewayv2_route" "ws_poker_commands" {
  api_id    = aws_apigatewayv2_api.ws_poker.id
  route_key = "comand_socket_poker"
  target    = "integrations/${aws_apigatewayv2_integration.ws_poker.id}"
}

resource "aws_lambda_permission" "apigw_ws_poker" {
  statement_id  = "AllowPokerWSAPIInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ws_poker.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.ws_poker.execution_arn}/*/*"
}
