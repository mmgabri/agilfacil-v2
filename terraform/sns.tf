resource "aws_sns_topic" "alerts" {
  name         = "alert-agilfacil"
  display_name = "AlertInstanceEC2"
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}
