resource "aws_sns_topic" "alerts" {
  name         = "notificacao-agilfacil"
  display_name = "Agil Facil - Sugestões"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

# ── Suporte ──────────────────────────────────────────────────────────────────
# Tópico segregado do "alerts" para não misturar solicitações de suporte com
# alertas de health check / sugestões de produto.
resource "aws_sns_topic" "support" {
  name         = "support-agilfacil"
  display_name = "Agil Facil - Suporte"
}

resource "aws_sns_topic_subscription" "support_email" {
  topic_arn = aws_sns_topic.support.arn
  protocol  = "email"
  endpoint  = var.alert_email
}
