const { DateTime } = require('luxon');
const { v4: uuidv4 } = require('uuid');
const { putTable } = require('../../services/database/dynamoService');
const config = require('../../config');
const log = require('../../utils/logger');

const timeZone = 'America/Sao_Paulo';

exports.handler = async (event) => {
  log.setCorrelationId(event.requestContext.requestId);
  const body = JSON.parse(event.body);

  const roomDb = {
    roomId: uuidv4(),
    creatorId: body.userId,
    creatorName: body.userName,
    createdAt: DateTime.now().setZone(timeZone).toISO(),
    roomName: body.roomName,
    status: 'NOVA_VOTACAO',
    users: [{ userId: body.userId, nickName: body.nickName, vote: 0 }],
  };

  log.debug('Create room request', { creatorId: body.userId, userName: body.userName, roomName: body.roomName });

  try {
    const data = await putTable(config.TABLE_ROOM, roomDb);
    log.info('Room created', { roomId: roomDb.roomId, creatorId: body.userId, roomName: body.roomName });
    return { statusCode: 201, body: JSON.stringify(data) };
  } catch (err) {
    log.error('Erro ao criar sala', { creatorId: body.userId, roomName: body.roomName, error: err.message || err });
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao criar sala' }) };
  }
};
