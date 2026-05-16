# ── HTTP API ──────────────────────────────────────────────────────────────────
resource "aws_apigatewayv2_api" "http" {
  name          = "agilfacil-http"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "DELETE", "OPTIONS"]
    allow_headers = ["content-type", "authorization"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "http_default" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "$default"
  auto_deploy = true
}

# ── Integração Board ──────────────────────────────────────────────────────────
resource "aws_apigatewayv2_integration" "rest_board" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.rest_board.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "healthcheck" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /healthcheck"
  target    = "integrations/${aws_apigatewayv2_integration.rest_board.id}"
}

resource "aws_apigatewayv2_route" "get_board" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /board/{boardId}"
  target    = "integrations/${aws_apigatewayv2_integration.rest_board.id}"
}

resource "aws_apigatewayv2_route" "get_board_by_user" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /board/getBoardByUser/{creatorId}"
  target    = "integrations/${aws_apigatewayv2_integration.rest_board.id}"
}

resource "aws_apigatewayv2_route" "create_board" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "POST /board/createBoard"
  target    = "integrations/${aws_apigatewayv2_integration.rest_board.id}"
}

resource "aws_apigatewayv2_route" "delete_board" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "DELETE /board/{boardId}"
  target    = "integrations/${aws_apigatewayv2_integration.rest_board.id}"
}

resource "aws_lambda_permission" "http_rest_board" {
  statement_id  = "AllowHTTPAPIBoardInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.rest_board.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}

# ── Integração Poker ──────────────────────────────────────────────────────────
resource "aws_apigatewayv2_integration" "rest_poker" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.rest_poker.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "create_room" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "POST /poker/createRoom"
  target    = "integrations/${aws_apigatewayv2_integration.rest_poker.id}"
}

resource "aws_apigatewayv2_route" "get_room" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /rooms/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.rest_poker.id}"
}

resource "aws_apigatewayv2_route" "suggestion" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "POST /suggestion"
  target    = "integrations/${aws_apigatewayv2_integration.rest_poker.id}"
}

resource "aws_lambda_permission" "http_rest_poker" {
  statement_id  = "AllowHTTPAPIPokerInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.rest_poker.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}
