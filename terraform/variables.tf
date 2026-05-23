variable "aws_region" {
  description = "Região AWS"
  type        = string
  default     = "sa-east-1"
}

variable "lambda_runtime" {
  description = "Runtime dos Lambdas WebSocket"
  type        = string
  default     = "nodejs18.x"
}

variable "lambda_timeout" {
  description = "Timeout dos Lambdas WebSocket em segundos"
  type        = number
  default     = 30
}

variable "health_check_url" {
  description = "URL do endpoint de health check"
  type        = string
  default     = "https://agilfacil.com.br:9000/healthcheck"
}

variable "alert_email" {
  description = "Email para receber alertas de health check via SNS"
  type        = string
  default     = "marcelomgabriel@gmail.com"
}

# ─── Cognito / Google OAuth ───────────────────────────────────────────────────

variable "google_client_id" {
  description = "Client ID do OAuth 2.0 do Google para o Cognito Identity Provider"
  type        = string
  default     = "63748523511-n957k8uppag7igta3g50e7npg0b2hhur.apps.googleusercontent.com"
}

variable "google_client_secret" {
  description = "Client Secret do OAuth 2.0 do Google para o Cognito Identity Provider"
  type        = string
  sensitive   = true
  default     = "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"
}
