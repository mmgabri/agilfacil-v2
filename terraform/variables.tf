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
