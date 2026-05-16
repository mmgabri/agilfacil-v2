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

# ── agilfacil-board-ws ────────────────────────────────────────────────────────
resource "aws_iam_role" "lambda_ws_board" {
  name               = "agilfacil-lambda-ws-board-role"
  assume_role_policy = local.lambda_assume_role_policy
}

resource "aws_iam_role_policy_attachment" "lambda_ws_board_basic" {
  role       = aws_iam_role.lambda_ws_board.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_ws_board_policy" {
  name = "agilfacil-ws-board-policy"
  role = aws_iam_role.lambda_ws_board.id

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
        ]
      },
      {
        Effect   = "Allow"
        Action   = "execute-api:ManageConnections"
        Resource = "${aws_apigatewayv2_api.ws_board.execution_arn}/*"
      },
    ]
  })
}

# ── agilfacil-poker-ws ────────────────────────────────────────────────────────
resource "aws_iam_role" "lambda_ws_poker" {
  name               = "agilfacil-lambda-ws-poker-role"
  assume_role_policy = local.lambda_assume_role_policy
}

resource "aws_iam_role_policy_attachment" "lambda_ws_poker_basic" {
  role       = aws_iam_role.lambda_ws_poker.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_ws_poker_policy" {
  name = "agilfacil-ws-poker-policy"
  role = aws_iam_role.lambda_ws_poker.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:DeleteItem", "dynamodb:Query"]
        Resource = [
          aws_dynamodb_table.connections.arn,
          "${aws_dynamodb_table.connections.arn}/index/*",
          aws_dynamodb_table.room.arn,
          "${aws_dynamodb_table.room.arn}/index/*",
        ]
      },
      {
        Effect   = "Allow"
        Action   = "execute-api:ManageConnections"
        Resource = "${aws_apigatewayv2_api.ws_poker.execution_arn}/*"
      },
    ]
  })
}

# ── agilfacil-board-rest ──────────────────────────────────────────────────────
resource "aws_iam_role" "lambda_rest_board" {
  name               = "agilfacil-lambda-rest-board-role"
  assume_role_policy = local.lambda_assume_role_policy
}

resource "aws_iam_role_policy_attachment" "lambda_rest_board_basic" {
  role       = aws_iam_role.lambda_rest_board.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_rest_board_policy" {
  name = "agilfacil-rest-board-policy"
  role = aws_iam_role.lambda_rest_board.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:DeleteItem", "dynamodb:Query"]
        Resource = [
          aws_dynamodb_table.board.arn,
          "${aws_dynamodb_table.board.arn}/index/*",
        ]
      },
    ]
  })
}

# ── agilfacil-poker-rest ──────────────────────────────────────────────────────
resource "aws_iam_role" "lambda_rest_poker" {
  name               = "agilfacil-lambda-rest-poker-role"
  assume_role_policy = local.lambda_assume_role_policy
}

resource "aws_iam_role_policy_attachment" "lambda_rest_poker_basic" {
  role       = aws_iam_role.lambda_rest_poker.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_rest_poker_policy" {
  name = "agilfacil-rest-poker-policy"
  role = aws_iam_role.lambda_rest_poker.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:DeleteItem", "dynamodb:Query"]
        Resource = [
          aws_dynamodb_table.room.arn,
          "${aws_dynamodb_table.room.arn}/index/*",
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
