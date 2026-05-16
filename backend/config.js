const PORT = process.env.PORT || 9000;

const CORS_OPTIONS = {
  origin: "*",
  methods: ["GET", "POST", "DELETE"]
};

const REGION = 'sa-east-1'

const TABLE_BOARD = process.env.TABLE_BOARD || 'agilfacil_board'

const TABLE_ROOM = process.env.TABLE_ROOM || 'agilfacil_room'

const BOARD_INDEX_NAME_USER = 'gsi_board_user'

const ROOM_INDEX_NAME_USER = 'gsi_room_user'

const TABLE_CONNECTIONS = process.env.TABLE_CONNECTIONS || 'agilfacil_connections'

module.exports = { PORT, CORS_OPTIONS, TABLE_BOARD, TABLE_ROOM, BOARD_INDEX_NAME_USER, REGION, ROOM_INDEX_NAME_USER, TABLE_CONNECTIONS };