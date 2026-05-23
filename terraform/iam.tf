locals {
  lambda_assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

# ── agilfacil-rest ────────────────────────────────────────────────────────────
resource "aws_iam_role" "lambda_rest" {
  name               = "agilfacil-lambda-rest-role"
  assume_role_policy = local.lambda_assume_role_policy
}

resource "aws_iam_role_policy_attachment" "lambda_rest_basic" {
  role       = aws_iam_role.lambda_rest.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_rest_policy" {
  name = "agilfacil-rest-policy"
  role = aws_iam_role.lambda_rest.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:DeleteItem", "dynamodb:Query"]
        Resource = [
          aws_dynamodb_table.board.arn,
          "${aws_dynamodb_table.board.arn}/index/*",
          aws_dynamodb_table.room.arn,
          "${aws_dynamodb_table.room.arn}/index/*",
          aws_dynamodb_table.users.arn,
        ]
      },
      {
        Effect   = "Allow"
        Action   = "sns:Publish"
        Resource = aws_sns_topic.alerts.arn
      },
    ]
  })
}

# ── agilfacil-ws ──────────────────────────────────────────────────────────────
resource "aws_iam_role" "lambda_ws" {
  name               = "agilfacil-lambda-ws-role"
  assume_role_policy = local.lambda_assume_role_policy
}

resource "aws_iam_role_policy_attachment" "lambda_ws_basic" {
  role       = aws_iam_role.lambda_ws.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_ws_policy" {
  name = "agilfacil-ws-policy"
  role = aws_iam_role.lambda_ws.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:DeleteItem", "dynamodb:Query"]
        Resource = [
          aws_dynamodb_table.connections.arn,
          "${aws_dynamodb_table.connections.arn}/index/*",
          aws_dynamodb_table.board.arn,
          "${aws_dynamodb_table.board.arn}/index/*",
          aws_dynamodb_table.room.arn,
          "${aws_dynamodb_table.room.arn}/index/*",
        ]
      },
      {
        Effect = "Allow"
        Action = "execute-api:ManageConnections"
        Resource = [
          "${aws_apigatewayv2_api.ws_board.execution_arn}/*",
          "${aws_apigatewayv2_api.ws_poker.execution_arn}/*",
        ]
      },
    ]
  })
}

# ── agilfacil-cognito-pre-signup ──────────────────────────────────────────────
resource "aws_iam_role" "lambda_cognito_pre_signup" {
  name               = "agilfacil-lambda-cognito-pre-signup-role"
  assume_role_policy = local.lambda_assume_role_policy
}

resource "aws_iam_role_policy_attachment" "lambda_cognito_pre_signup_basic" {
  role       = aws_iam_role.lambda_cognito_pre_signup.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}
