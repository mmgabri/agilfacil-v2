const { DateTime } = require('luxon');
const { v4: uuidv4 } = require('uuid');
const { putTable } = require('../../services/database/dynamoService');
const config = require('../../config');

const timeZone = 'America/Sao_Paulo';

exports.handler = async (event) => {
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

  try {
    const data = await putTable(config.TABLE_ROOM, roomDb);
    return { statusCode: 201, body: JSON.stringify(data) };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao criar sala' }) };
  }
};
