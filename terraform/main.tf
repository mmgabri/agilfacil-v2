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
  # A tabela agilfacil_board não é mais gerenciada pelo Terraform (ver o
  # resource comentado em dynamodb.tf) — o nome/ARN vêm só da variável.
  # Pra voltar a deixar o Terraform criar/gerenciar a tabela do zero:
  # descomente o resource em dynamodb.tf, zere board_table_name em
  # variables.tf, e restaure aqui o fallback pra aws_dynamodb_table.board.
  board_table_name = var.board_table_name
  board_table_arn  = "arn:aws:dynamodb:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/${var.board_table_name}"
}
