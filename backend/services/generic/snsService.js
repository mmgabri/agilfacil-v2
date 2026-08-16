const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

class SnsService {
    region = process.env.NODE_ENV
    topicArn = process.env.TOPIC_ARN
    supportTopicArn = process.env.TOPIC_ARN_SUPPORT

    constructor(region) {
        this.snsClient = new SNSClient({ region });
    }

    formatMessage = (userName, email, suggestion) => {
        return `
      User Name: ${userName}
      Email: ${email}
      Suggestion: ${suggestion}
      `.trim();
      };

    formatSupportMessage = (userName, email, message) => {
        return `
      User Name: ${userName}
      Email: ${email}
      Message: ${message}
      `.trim();
      };

    async publishToTopic(message, subject, topicArn = this.topicArn) {

        const params = {
            TopicArn: topicArn,
            Message: message,
            Subject: subject,
        };

        try {
            const data = await this.snsClient.send(new PublishCommand(params));
            console.log('Mensagem enviada com sucesso:', data.MessageId);
            return data;
        } catch (error) {
            console.error('Erro ao enviar a mensagem:', error);
            throw error;
        }
    }

    async suggestionNotification (userName, email, suggestion ) {
        const subject = 'Notificação AgilFacil - Sugestão Publicada '
        const message = this.formatMessage(userName, email, suggestion)
        this.publishToTopic(message, subject)

    }

    async supportNotification (userName, email, message ) {
        const subject = 'Notificação AgilFacil - Solicitação de Suporte'
        const formattedMessage = this.formatSupportMessage(userName, email, message)
        this.publishToTopic(formattedMessage, subject, this.supportTopicArn)

    }
}

module.exports = SnsService;