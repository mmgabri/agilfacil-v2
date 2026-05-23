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

# ── agilfacil-rest ────────────────────────────────────────────────────────────
resource "aws_lambda_function" "rest" {
  function_name    = "agilfacil-rest"
  role             = aws_iam_role.lambda_rest.arn
  handler          = "handlers/rest/restIndex.handler"
  runtime          = var.lambda_runtime
  timeout          = var.lambda_timeout
  filename         = data.archive_file.backend.output_path
  source_code_hash = data.archive_file.backend.output_base64sha256

  environment {
    variables = {
      REGION      = var.aws_region
      TABLE_BOARD = aws_dynamodb_table.board.name
      TABLE_ROOM  = aws_dynamodb_table.room.name
      TABLE_USERS = aws_dynamodb_table.users.name
      TOPIC_ARN   = aws_sns_topic.alerts.arn
    }
  }
}

# ── agilfacil-ws ──────────────────────────────────────────────────────────────
resource "aws_lambda_function" "ws" {
  function_name    = "agilfacil-ws"
  role             = aws_iam_role.lambda_ws.arn
  handler          = "handlers/ws/wsIndex.handler"
  runtime          = var.lambda_runtime
  timeout          = var.lambda_timeout
  filename         = data.archive_file.backend.output_path
  source_code_hash = data.archive_file.backend.output_base64sha256

  environment {
    variables = {
      REGION            = var.aws_region
      #TABLE_BOARD       = aws_dynamodb_table.board.name
      TABLE_BOARD       = "teste2_board"
      TABLE_ROOM        = aws_dynamodb_table.room.name
      TABLE_CONNECTIONS = aws_dynamodb_table.connections.name
    }
  }
}

# ── agilfacil-cognito-pre-signup ──────────────────────────────────────────────
resource "aws_lambda_function" "cognito_pre_signup" {
  function_name    = "agilfacil-cognito-pre-signup"
  role             = aws_iam_role.lambda_cognito_pre_signup.arn
  handler          = "handlers/cognito/preSignUp.handler"
  runtime          = var.lambda_runtime
  filename         = data.archive_file.backend.output_path
  source_code_hash = data.archive_file.backend.output_base64sha256
}

# Permite que o Cognito invoque esta Lambda
resource "aws_lambda_permission" "cognito_pre_signup" {
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.cognito_pre_signup.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.main.arn
}
