# ─────────────────────────────────────────────────────────────────────────────
# Pacote ZIP compartilhado por todas as Lambdas
#
# Pré-requisito: rodar "npm install" em backend/ antes de "terraform apply".
# ─────────────────────────────────────────────────────────────────────────────

data "archive_file" "backend" {
  type        = "zip"
  source_dir  = "${path.module}/../backend"
  output_path = "${path.module}/.builds/backend.zip"
  excludes    = [".env", ".aws-sam", ".vscode", "events", "template.yaml"]
}

locals {
  ws_board_env = {
    REGION            = var.aws_region
    TABLE_BOARD       = aws_dynamodb_table.board.name
    TABLE_CONNECTIONS = aws_dynamodb_table.connections.name
  }

  ws_poker_env = {
    REGION            = var.aws_region
    TABLE_ROOM        = aws_dynamodb_table.room.name
    TABLE_CONNECTIONS = aws_dynamodb_table.connections.name
  }

  rest_board_env = {
    REGION      = var.aws_region
    TABLE_BOARD = aws_dynamodb_table.board.name
  }

  rest_poker_env = {
    REGION      = var.aws_region
    TABLE_ROOM  = aws_dynamodb_table.room.name
    TOPIC_ARN   = aws_sns_topic.alerts.arn
  }
}

# ── agilfacil-board-ws ────────────────────────────────────────────────────────
resource "aws_lambda_function" "ws_board" {
  function_name    = "agilfacil-board-ws"
  role             = aws_iam_role.lambda_ws_board.arn
  handler          = "handlers/ws/boardIndex.handler"
  runtime          = var.lambda_runtime
  timeout          = var.lambda_timeout
  filename         = data.archive_file.backend.output_path
  source_code_hash = data.archive_file.backend.output_base64sha256
  environment { variables = local.ws_board_env }
}

# ── agilfacil-poker-ws ────────────────────────────────────────────────────────
resource "aws_lambda_function" "ws_poker" {
  function_name    = "agilfacil-poker-ws"
  role             = aws_iam_role.lambda_ws_poker.arn
  handler          = "handlers/ws/pokerIndex.handler"
  runtime          = var.lambda_runtime
  timeout          = var.lambda_timeout
  filename         = data.archive_file.backend.output_path
  source_code_hash = data.archive_file.backend.output_base64sha256
  environment { variables = local.ws_poker_env }
}

# ── agilfacil-board-rest ──────────────────────────────────────────────────────
resource "aws_lambda_function" "rest_board" {
  function_name    = "agilfacil-board-rest"
  role             = aws_iam_role.lambda_rest_board.arn
  handler          = "handlers/rest/boardIndex.handler"
  runtime          = var.lambda_runtime
  timeout          = var.lambda_timeout
  filename         = data.archive_file.backend.output_path
  source_code_hash = data.archive_file.backend.output_base64sha256
  environment { variables = local.rest_board_env }
}

# ── agilfacil-poker-rest ──────────────────────────────────────────────────────
resource "aws_lambda_function" "rest_poker" {
  function_name    = "agilfacil-poker-rest"
  role             = aws_iam_role.lambda_rest_poker.arn
  handler          = "handlers/rest/pokerIndex.handler"
  runtime          = var.lambda_runtime
  timeout          = var.lambda_timeout
  filename         = data.archive_file.backend.output_path
  source_code_hash = data.archive_file.backend.output_base64sha256
  environment { variables = local.rest_poker_env }
}
