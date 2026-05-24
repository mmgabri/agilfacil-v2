terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Usado para construir ARNs da tabela board quando o nome é sobrescrito via variável
data "aws_caller_identity" "current" {}

locals {
  # Se board_table_name for definido, usa esse nome; senão usa a tabela criada pelo Terraform.
  # Permite apontar para uma tabela migrada (ex: "teste2_board") sem recriar recursos.
  board_table_name = var.board_table_name != "" ? var.board_table_name : aws_dynamodb_table.board.name
  board_table_arn  = var.board_table_name != "" ? "arn:aws:dynamodb:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/${var.board_table_name}" : aws_dynamodb_table.board.arn
}
