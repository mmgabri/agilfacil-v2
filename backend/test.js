const { DateTime } = require('luxon');

// Obtém o horário atual de Brasília
const brasiliaTime = DateTime.now().setZone('America/Sao_Paulo');

// Formata a data
const formattedTime = brasiliaTime.toFormat("dd/MM/yyyy HH:mm:ss");

console.log(formattedTime);
