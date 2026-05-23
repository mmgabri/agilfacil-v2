# ─────────────────────────────────────────────────────────────────────────────
# Cognito User Pool
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_cognito_user_pool" "main" {
  name = "agilfacil"

  # Login via e-mail
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  # Política de senha — mesma da conta anterior
  password_policy {
    minimum_length                   = 8
    require_uppercase                = false
    require_lowercase                = false
    require_numbers                  = false
    require_symbols                  = false
    temporary_password_validity_days = 7
  }

  # Exige verificação de e-mail antes de alterar o atributo
  user_attribute_update_settings {
    attributes_require_verification_before_update = ["email"]
  }

  # Verificação por código (não por link mágico)
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_message        = "Your verification code is {####}"
    email_subject        = "Your verification code"
  }

  username_configuration {
    case_sensitive = false
  }

  mfa_configuration = "OFF"

  # Recuperação de conta
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
    recovery_mechanism {
      name     = "verified_phone_number"
      priority = 2
    }
  }

  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  # Trigger: auto-confirma o usuário no cadastro (sem enviar código por e-mail)
  lambda_config {
    pre_sign_up = aws_lambda_function.cognito_pre_signup.arn
  }

  deletion_protection = "INACTIVE"

  tags = {
    Application = "agilfacil"
    Environment = "prod"
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# Domínio do Cognito
# (deve bater com o redirect_uri configurado no Google Console)
# https://agilfacil-prod-1779048899.auth.sa-east-1.amazoncognito.com
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "agilfacil-prod-1779048899"
  user_pool_id = aws_cognito_user_pool.main.id
}

# ─────────────────────────────────────────────────────────────────────────────
# Identity Provider — Google
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    client_id                     = var.google_client_id
    client_secret                 = var.google_client_secret
    authorize_scopes              = "email openid profile"
    authorize_url                 = "https://accounts.google.com/o/oauth2/v2/auth"
    token_url                     = "https://www.googleapis.com/oauth2/v4/token"
    token_request_method          = "POST"
    oidc_issuer                   = "https://accounts.google.com"
    attributes_url                = "https://people.googleapis.com/v1/people/me?personFields="
    attributes_url_add_attributes = "true"
  }

  attribute_mapping = {
    email          = "email"
    email_verified = "email_verified"
    name           = "name"
    username       = "sub"
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# User Pool App Client (web)
# ─────────────────────────────────────────────────────────────────────────────

resource "aws_cognito_user_pool_client" "web" {
  name         = "agilfacil-web-client"
  user_pool_id = aws_cognito_user_pool.main.id

  # Validade dos tokens — mesma configuração anterior
  refresh_token_validity = 525660 # minutos ≈ 1 ano
  access_token_validity  = 1      # dias
  id_token_validity      = 5      # minutos

  token_validity_units {
    access_token  = "days"
    id_token      = "minutes"
    refresh_token = "minutes"
  }

  explicit_auth_flows = [
    "ALLOW_CUSTOM_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
  ]

  supported_identity_providers = [
    "COGNITO",
    "Google",
  ]

  callback_urls = [
    "https://agilfacil.com.br/boards",
    "https://agilfacil.com.br/create/board",
    "http://localhost:3000/boards",
    "http://localhost:3000/create/board",
  ]

  logout_urls = [
    "https://agilfacil.com.br/",
    "http://localhost:3000/",
  ]

  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["aws.cognito.signin.user.admin", "email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true

  enable_token_revocation                       = true
  prevent_user_existence_errors                 = "ENABLED"
  enable_propagate_additional_user_context_data = false
  auth_session_validity                         = 3

  # O cliente só pode ser criado após o IdP existir
  depends_on = [aws_cognito_identity_provider.google]
}
