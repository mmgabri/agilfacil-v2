const { DateTime } = require('luxon');
const { v4: uuidv4 } = require('uuid');
const { putTable } = require('../../services/database/dynamoService');
const config = require('../../config');

const timeZone = 'America/Sao_Paulo';

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const now = DateTime.now().setZone(timeZone).toISO();

  const boardDb = {
    boardId: uuidv4(),
    creatorId: body.creatorId,
    createdAt: now,
    userName: body.userName,
    boardName: body.boardName,
    squadName: body.squadName,
    areaName: body.areaName,
    columns: body.columns,
    isObfuscated: false,
    dateTimeLastUpdate: now,
    usersOnBoard: [],
    usersOnBoardHistoric: [],
    cardCreators: [],
  };

  try {
    const data = await putTable(config.TABLE_BOARD, boardDb);
    return { statusCode: 201, body: JSON.stringify(data) };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: 'Erro ao criar board' }) };
  }
};
