# ── agilfacil_board ───────────────────────────────────────────────────────────
# MASCARADO DE PROPÓSITO — a tabela agilfacil_board foi recriada manualmente
# (import de dados de outra conta AWS) e não corresponde mais exatamente a
# esta declaração (ex.: o GSI gsi_board_user ficou com projection_type ALL
# em vez de INCLUDE). Deixar este resource ativo faria o Terraform tentar
# "corrigir" a tabela real a cada apply, arriscando recriar o índice.
# A tabela agora é referenciada só pelo nome, via var.board_table_name
# (default "agilfacil_board" em variables.tf) e os locals em main.tf — o
# Terraform não gerencia mais o ciclo de vida dela. Removida do state via
# `terraform state rm aws_dynamodb_table.board`.
#
# resource "aws_dynamodb_table" "board" {
#   name         = "agilfacil_board"
#   billing_mode = "PAY_PER_REQUEST"
#   hash_key     = "boardId"
#   range_key    = "createdAt"
#
#   attribute {
#     name = "boardId"
#     type = "S"
#   }
#   attribute {
#     name = "createdAt"
#     type = "S"
#   }
#   attribute {
#     name = "creatorId"
#     type = "S"
#   }
#
#   global_secondary_index {
#     name            = "gsi_board_user"
#     hash_key        = "creatorId"
#     range_key       = "createdAt"
#     projection_type = "INCLUDE"
#     non_key_attributes = [
#       "boardId", "boardName", "userName", "squadName", "areaName"
#     ]
#   }
# }

# ── agilfacil_room ────────────────────────────────────────────────────────────
resource "aws_dynamodb_table" "room" {
  name         = "agilfacil_room"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "roomId"
  range_key    = "createdAt"

  attribute {
    name = "roomId"
    type = "S"
  }
  attribute {
    name = "createdAt"
    type = "S"
  }
  attribute {
    name = "creatorId"
    type = "S"
  }

  global_secondary_index {
    name            = "gsi_room_user"
    hash_key        = "creatorId"
    range_key       = "createdAt"
    projection_type = "INCLUDE"
    non_key_attributes = [
      "roomId", "roomName", "userName"
    ]
  }
}

# ── agilfacil_connections (sessões WebSocket ativas) ─────────────────────────
resource "aws_dynamodb_table" "connections" {
  name         = "agilfacil_connections"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "connectionId"

  attribute {
    name = "connectionId"
    type = "S"
  }
  attribute {
    name = "idSession"
    type = "S"
  }

  global_secondary_index {
    name            = "idSessionIndex"
    hash_key        = "idSession"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }
}
