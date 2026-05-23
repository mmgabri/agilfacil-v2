# ── agilfacil_board ───────────────────────────────────────────────────────────
resource "aws_dynamodb_table" "board" {
  name         = "agilfacil_board"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "boardId"
  range_key    = "createdAt"

  attribute {
    name = "boardId"
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
    name            = "gsi_board_user"
    hash_key        = "creatorId"
    range_key       = "createdAt"
    projection_type = "INCLUDE"
    non_key_attributes = [
      "boardId", "boardName", "userName", "squadName", "areaName"
    ]
  }
}

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

# ── agilfacil_users ──────────────────────────────────────────────────────────
resource "aws_dynamodb_table" "users" {
  name         = "agilfacil_users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "email"

  attribute {
    name = "email"
    type = "S"
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
