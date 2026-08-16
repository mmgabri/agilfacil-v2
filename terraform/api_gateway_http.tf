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

# ── Integração unificada REST ─────────────────────────────────────────────────
resource "aws_apigatewayv2_integration" "rest" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.rest.invoke_arn
  payload_format_version = "2.0"
}

# ── Authorizer JWT (Cognito) ────────────────────────────────────────────────────
# Valida o id_token do Cognito enviado no header Authorization (Bearer) antes
# de invocar a Lambda. Usado nas rotas de board que exigem usuário logado —
# rotas de convite/guest (GET /board/{boardId}, GET /rooms/{id}) continuam
# públicas de propósito.
resource "aws_apigatewayv2_authorizer" "cognito_jwt" {
  api_id           = aws_apigatewayv2_api.http.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cognito-jwt-authorizer"

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.web.id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.main.id}"
  }
}

# ── Board routes ──────────────────────────────────────────────────────────────
resource "aws_apigatewayv2_route" "healthcheck" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /healthcheck"
  target    = "integrations/${aws_apigatewayv2_integration.rest.id}"
}

resource "aws_apigatewayv2_route" "get_board" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /board/{boardId}"
  target    = "integrations/${aws_apigatewayv2_integration.rest.id}"
}

resource "aws_apigatewayv2_route" "get_board_by_user" {
  api_id             = aws_apigatewayv2_api.http.id
  route_key          = "GET /board/getBoardByUser/{creatorId}"
  target             = "integrations/${aws_apigatewayv2_integration.rest.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito_jwt.id
}

resource "aws_apigatewayv2_route" "create_board" {
  api_id             = aws_apigatewayv2_api.http.id
  route_key          = "POST /board/createBoard"
  target             = "integrations/${aws_apigatewayv2_integration.rest.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito_jwt.id
}

resource "aws_apigatewayv2_route" "delete_board" {
  api_id             = aws_apigatewayv2_api.http.id
  route_key          = "DELETE /board/{boardId}"
  target             = "integrations/${aws_apigatewayv2_integration.rest.id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito_jwt.id
}

# ── Poker routes ──────────────────────────────────────────────────────────────
resource "aws_apigatewayv2_route" "create_room" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "POST /poker/createRoom"
  target    = "integrations/${aws_apigatewayv2_integration.rest.id}"
}

resource "aws_apigatewayv2_route" "get_room" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /rooms/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.rest.id}"
}

resource "aws_apigatewayv2_route" "suggestion" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "POST /suggestion"
  target    = "integrations/${aws_apigatewayv2_integration.rest.id}"
}

resource "aws_apigatewayv2_route" "support" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "POST /support"
  target    = "integrations/${aws_apigatewayv2_integration.rest.id}"
}

# ── Auth routes ───────────────────────────────────────────────────────────────
resource "aws_apigatewayv2_integration" "auth" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.auth.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "get_auth_status" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /auth/status"
  target    = "integrations/${aws_apigatewayv2_integration.auth.id}"
}

resource "aws_apigatewayv2_route" "post_auth_set_password" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "POST /auth/set-password"
  target    = "integrations/${aws_apigatewayv2_integration.auth.id}"
}

# ── Lambda permissions ────────────────────────────────────────────────────────
resource "aws_lambda_permission" "http_rest" {
  statement_id  = "AllowHTTPAPIInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.rest.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}

resource "aws_lambda_permission" "http_auth" {
  statement_id  = "AllowHTTPAPIInvokeAuth"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.auth.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}
