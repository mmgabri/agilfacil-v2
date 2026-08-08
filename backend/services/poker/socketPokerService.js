const { putTable, getRoomDb } = require('./../database/dynamoService');
const config = require('../../config');

const getRoom = async (roomId) => {
  return getRoomDb(config.TABLE_ROOM, roomId);
};

const connectClient = async (nickName, userId, roomId) => {
  const roomData = await getRoomDb(config.TABLE_ROOM, roomId);

  const userData = { userId: userId, nickName: nickName, vote: 0 };

  const updatedRoomData = { ...roomData };

  const userExists = updatedRoomData.users.some(user => user.userId === userData.userId);

  if (!userExists) {
    updatedRoomData.users.push(userData);
    await putTable(config.TABLE_ROOM, updatedRoomData);
    return updatedRoomData
  } else {
    const userIndex = updatedRoomData.users.findIndex(user => user.userId === userData.userId);
    updatedRoomData.users[userIndex].nickName = userData.nickName;
    await putTable(config.TABLE_ROOM, updatedRoomData);
    return updatedRoomData;
  }
};


const desconnectClient = async (userId, roomId) => {
  const roomData = await getRoomDb(config.TABLE_ROOM, roomId);

  const updatedRoomData = { ...roomData };
  updatedRoomData.users = updatedRoomData.users.filter(user => user.userId !== userId);
  await putTable(config.TABLE_ROOM, updatedRoomData);
  return updatedRoomData
};


const updateStatusRoom = async (roomId, status) => {
  const roomData = await getRoomDb(config.TABLE_ROOM, roomId);

  const updatedRoomData = { ...roomData };

  if (status == 'VOTACAO_ENCERRADA') {
    for (const key in updatedRoomData.users) {
      updatedRoomData.users[key].vote = 0
    }
  }

  updatedRoomData.status = status;

  await putTable(config.TABLE_ROOM, updatedRoomData);
  return updatedRoomData
};

const updateVote = async (roomId, userId, vote) => {
  const roomData = await getRoomDb(config.TABLE_ROOM, roomId);

  const updatedRoomData = { ...roomData };

  const index = updatedRoomData.users.findIndex(item => item.userId === userId);

  if (index !== -1) {
    updatedRoomData.users[index].vote = vote
    await putTable(config.TABLE_ROOM, updatedRoomData);
    return updatedRoomData
  } else {
    console.error('Usuário inexistente - userId: ', userId)
    throw new Error("Usuário inexistente!");
  }
};

module.exports = { getRoom, connectClient, desconnectClient, updateStatusRoom, updateVote };