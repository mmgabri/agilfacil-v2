const { getRoomDb, mutateItem } = require('./../database/dynamoService');
const config = require('../../config');

// Toda alteração passa por mutateRoom: lê a sala, aplica `fn` e grava com
// controle de versão. Em caso de escrita concorrente (ex.: vários votos no
// mesmo instante), relê e reaplica `fn`. `fn` retorna a sala alterada ou null.
const mutateRoom = (roomId, fn) => mutateItem({
  tableName: config.TABLE_ROOM,
  keyName: 'roomId',
  id: roomId,
  load: () => getRoomDb(config.TABLE_ROOM, roomId),
  mutate: fn,
});

const getRoom = async (roomId) => {
  return getRoomDb(config.TABLE_ROOM, roomId);
};

const connectClient = (nickName, userId, roomId) => mutateRoom(roomId, (room) => {
  const user = room.users.find(u => u.userId === userId);
  if (!user) {
    room.users.push({ userId, nickName, vote: 0 });
  } else {
    if (user.nickName === nickName) return null;
    user.nickName = nickName;
  }
  return room;
});

const desconnectClient = (userId, roomId) => mutateRoom(roomId, (room) => {
  if (!room.users.some(u => u.userId === userId)) return null;
  room.users = room.users.filter(user => user.userId !== userId);
  return room;
});

const updateStatusRoom = (roomId, status) => mutateRoom(roomId, (room) => {
  if (status == 'VOTACAO_ENCERRADA') {
    for (const key in room.users) {
      room.users[key].vote = 0;
    }
  }
  room.status = status;
  return room;
});

const updateVote = (roomId, userId, vote) => mutateRoom(roomId, (room) => {
  const user = room.users.find(item => item.userId === userId);
  if (!user) {
    console.error('Usuário inexistente - userId: ', userId);
    throw new Error("Usuário inexistente!");
  }
  user.vote = vote;
  return room;
});

module.exports = { getRoom, connectClient, desconnectClient, updateStatusRoom, updateVote };
