const {
  CloudWatchLogsClient,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  PutLogEventsCommand,
} = require('@aws-sdk/client-cloudwatch-logs');

require('dotenv').config();

class CloudWatchLogger {
  logger_ativ = false;
  region = process.env.REGION
  env = process.env.NODE_ENV

  constructor(logGroupName, logStreamName) {
    if (!logGroupName || !logStreamName) {
      throw new Error('Both logGroupName and logStreamName are required.');
    }

    if (this.env === 'dev') {
      console.log('Logger ativo')
      this.logger_ativ = true
    }

    this.logGroupName = logGroupName;
    this.logStreamName = logStreamName;
    this.client = new CloudWatchLogsClient({region: this.region});

    this.init();
  }

  async init() {
    try {
      await this.createLogGroup();
      await this.createLogStream();
    } catch (error) {
      console.error('Initialization failed:', error);
    }
  }

  // Cria o grupo de logs se ele não existir
  async createLogGroup() {
    try {
      const createGroupParams = {
        logGroupName: this.logGroupName,
      };
      await this.client.send(new CreateLogGroupCommand(createGroupParams));
      console.log('Log group created:', this.logGroupName);
    } catch (error) {
      if (error.name !== 'ResourceAlreadyExistsException') {
        console.error('Error creating log group:', error);
        throw error;
      }
    }
  }

  // Cria o fluxo de logs se ele não existir
  async createLogStream() {
    try {
      const createStreamParams = {
        logGroupName: this.logGroupName,
        logStreamName: this.logStreamName,
      };
      await this.client.send(new CreateLogStreamCommand(createStreamParams));
      console.log('Log stream created:', this.logStreamName);
    } catch (error) {
      if (error.name !== 'ResourceAlreadyExistsException') {
        console.error('Error creating log stream:', error);
        throw error;
      }
    }
  }

  // Envia logs para o CloudWatch

  async log(type, interacao, roomId, roomName, userId, userName, vote, statusRoom, elapsedTime, executionStatus, msg, email, suggestion) {
    const message = this.createLogObject(type, interacao, roomId, roomName, userId, userName, vote, statusRoom, elapsedTime, executionStatus, msg, email, suggestion);
    const timestamp = Date.now();
    const params = {
      logGroupName: this.logGroupName,
      logStreamName: this.logStreamName,
      logEvents: [
        {
          message: JSON.stringify({ message, timestamp }),
          timestamp,
        },
      ],
    };

    try {
      await this.client.send(new PutLogEventsCommand(params));
      if (this.logger_ativ) { console.log('Log sent to CloudWatch:', message); }
    } catch (error) {
      console.error('Error logging to CloudWatch:', error);
    }
  }

  createLogObject(type, interacao, roomId, roomName, userId, userName, vote, statusRoom, elapsedTime, executionStatus, message, email, suggestion) {
    return {
      timestamp: new Date().toLocaleString(),
      type,
      interacao,
      roomId,
      roomName,
      userId,
      userName,
      vote,
      statusRoom,
      elapsedTime,
      executionStatus,
      message,
      email,
      suggestion
    };
  }
}

module.exports = new CloudWatchLogger('agilfacil-log-group', 'agilfacil-log-stream');