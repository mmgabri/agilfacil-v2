const config = require('../../config');
const { putTable, getBoardDb } = require('../database/dynamoService');


const connectClientBoard = async (boardId, userId) => {

  const boardData = await getBoardDb(config.TABLE_BOARD, boardId);

  if (!boardData) {
    throw new Error("Board não encontrado.");
  }

  const updatedBoardData = { ...boardData };
  const userData = { userId: userId }
  const userExists = updatedBoardData.usersOnBoard.some(user => user.userId === userData.userId);
  const userExistsHistoric = updatedBoardData.usersOnBoardHistoric.some(user => user.userId === userData.userId);

  if (userExists && userExistsHistoric) {
    return boardData
  }

  if (!userExists) {
    updatedBoardData.usersOnBoard.push(userData);
  };

  if (!userExistsHistoric) {
    updatedBoardData.usersOnBoardHistoric.push(userData);
  };

  await putTable(config.TABLE_BOARD, updatedBoardData);

  return updatedBoardData;
};


const disconnectClientBoard = async (userIdToRemove, boardId) => {

  const boardData = await getBoardDb(config.TABLE_BOARD, boardId);

  if (!boardData) {
    throw new Error("Board não encontrado.");
  }

  // Remove usuário da lista de logado
  const updatedBoardData = { ...boardData };
  updatedBoardData.usersOnBoard = updatedBoardData.usersOnBoard.filter(user => user.userId !== userIdToRemove);

  await putTable(config.TABLE_BOARD, updatedBoardData);

  return updatedBoardData;
};


const addCardBoard = async (boardId, newCard, indexColumn) => {

  const boardData = await getBoardDb(config.TABLE_BOARD, boardId);

  //inclui card
  const updatedBoard = { ...boardData };
  const column = updatedBoard.columns[indexColumn];
  column.cards.push(newCard);

  //Adiciona usuario a lista de usuários que criacaram card
  const userData = { userId: newCard.userId }
  const userExists = updatedBoard.cardCreators.some(user => user.userId === userData.userId);
  if (!userExists) updatedBoard.cardCreators.push(userData);

  await putTable(config.TABLE_BOARD, updatedBoard);
  return updatedBoard
}

const reorderBoard = async (boardId, source, destination) => {

  const boardData = await getBoardDb(config.TABLE_BOARD, boardId);

  const sourceColumn = boardData.columns.find(col => col.id === source.droppableId);
  const destinationColumn = boardData.columns.find(col => col.id === destination.droppableId);

  const currentCards = [...sourceColumn.cards];
  const targetCard = currentCards[source.index];

  if (source.droppableId === destination.droppableId) {
    // Reordenação dentro da mesma coluna
    const reorderedCards = reorder(currentCards, source.index, destination.index);

    const updatedColumns = boardData.columns.map(column =>
      column.id === source.droppableId ? { ...column, cards: reorderedCards } : column
    );

    const updatedBoard = {
      ...boardData, // Inclui todos os campos existentes no board
      columns: updatedColumns, // Atualiza apenas as colunas
    };

    // Salva os dados no banco
    await putTable(config.TABLE_BOARD, updatedBoard);
    return updatedBoard;
  } else {
    // Movendo entre colunas diferentes
    const sourceCards = [...sourceColumn.cards];
    const destinationCards = [...destinationColumn.cards];

    // Remove o card da coluna de origem
    sourceCards.splice(source.index, 1);
    // Adiciona o card à coluna de destino
    destinationCards.splice(destination.index, 0, targetCard);

    const updatedColumns = boardData.columns.map(column => {
      if (column.id === source.droppableId) {
        return { ...column, cards: sourceCards };
      } else if (column.id === destination.droppableId) {
        return { ...column, cards: destinationCards };
      } else {
        return column;
      }
    });

    const updatedBoard = {
      ...boardData,
      columns: updatedColumns,
    };

    await putTable(config.TABLE_BOARD, updatedBoard);
    return updatedBoard;
  }
};

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};


const processCombine = async (boardId, source, combine) => {

  const boardData = await getBoardDb(config.TABLE_BOARD, boardId);

  if (!boardData) {
    throw new Error("Board não encontrado.");
  }

  let result;
  if (combine.droppableId === source.droppableId) {
    result = processCombineSameColumn(boardData, source, combine);
  } else {
    result = processCombineDifferentColumn(boardData, source, combine);
  }

  const updatedBoard = { ...boardData, columns: result };

  await putTable(config.TABLE_BOARD, updatedBoard);

  return updatedBoard;
};


const processCombineDifferentColumn = (boardData, source, combine) => {
  const sourceCards = [...boardData.columns.find(col => col.id === source.droppableId).cards];
  const combineCards = [...boardData.columns.find(col => col.id === combine.droppableId).cards];

  // Obtém o card movido
  const sourceCard = sourceCards[source.index];

  // Remove o item da origem
  sourceCards.splice(source.index, 1);

  // Localiza e atualiza o card combinado
  const combineCardIndex = combineCards.findIndex(x => x.id === combine.draggableId);
  const combineCard = combineCards[combineCardIndex];
  combineCards[combineCardIndex] = {
    ...combineCard,
    content: `${combineCard.content}\n+\n${sourceCard.content}`
  };

  // Atualiza as colunas
  const updatedColumns = boardData.columns.map(column => {
    if (column.id === combine.droppableId) {
      return { ...column, cards: combineCards };
    }
    if (column.id === source.droppableId) {
      return { ...column, cards: sourceCards };
    }
    return column;
  });

  return updatedColumns;
};

const processCombineSameColumn = (boardData, source, combine) => {
  const combineCards = [...boardData.columns.find(col => col.id === combine.droppableId).cards];

  // Obtém o card movido
  const sourceCard = combineCards[source.index];

  // Remove o item da origem
  combineCards.splice(source.index, 1);

  // Localiza e atualiza o card combinado
  const combineCardIndex = combineCards.findIndex(x => x.id === combine.draggableId);
  const combineCard = combineCards[combineCardIndex];
  combineCards[combineCardIndex] = {
    ...combineCard,
    content: `${combineCard.content}\n+\n${sourceCard.content}`
  };

  // Atualiza as colunas
  const updatedColumns = boardData.columns.map(column =>
    column.id === combine.droppableId ? { ...column, cards: combineCards } : column
  );

  return updatedColumns;
};

const deleteColumn = async (boardId, index) => {

  const boardData = await getBoardDb(config.TABLE_BOARD, boardId);

  if (!boardData) {
    throw new Error("Board não encontrado.");
  }

  // Remove a coluna pelo índice
  const updatedBoardData = { ...boardData };
  if (index < 0 || index >= updatedBoardData.columns.length) {
    throw new Error("Índice inválido para deletar a coluna.");
  }

  updatedBoardData.columns.splice(index, 1);


  await putTable(config.TABLE_BOARD, updatedBoardData);
  return updatedBoardData;
};


const addColumn = async (boardId, newColumn) => {

  const boardData = await getBoardDb(config.TABLE_BOARD, boardId);

  if (!boardData) {
    throw new Error("Board não encontrado.");
  }

  // Adiciona a coluna pelo índice
  const updatedBoardData = { ...boardData };
  updatedBoardData.columns.push(newColumn);


  await putTable(config.TABLE_BOARD, updatedBoardData);
  return updatedBoardData;
};


const updateTitleColumn = async (boardId, content, index) => {

  const boardData = await getBoardDb(config.TABLE_BOARD, boardId);

  if (!boardData) {
    throw new Error("Board não encontrado.");
  }

  if (index < 0 || index >= boardData.columns.length) {
    throw new Error('Índice inválido para atualizar o título da coluna.');
  }

  // Atualiza o título da coluna
  const updatedBoardData = { ...boardData };
  updatedBoardData.columns[index].title = content;


  await putTable(config.TABLE_BOARD, updatedBoardData);
  return updatedBoardData;
};

const setIsObfuscatedBoardLevel = async (boardId, isObfuscated) => {

  const boardData = await getBoardDb(config.TABLE_BOARD, boardId);

  if (!boardData) {
    throw new Error("Board não encontrado.");
  }

  // Atualiza isObfuscated
  const updatedBoardData = { ...boardData };
  updatedBoardData.isObfuscated = isObfuscated


  await putTable(config.TABLE_BOARD, updatedBoardData);
  return updatedBoardData;
};

const setIsObfuscatedColumnLevel = async (boardId, isObfuscated, index) => {

  const boardData = await getBoardDb(config.TABLE_BOARD, boardId);

  if (!boardData) {
    throw new Error("Board não encontrado.");
  }

  if (index < 0 || index >= boardData.columns.length) {
    throw new Error("Índice inválido para atualizar o título da coluna.");
  }

  // Atualiza coluna
  const updatedBoardData = { ...boardData };
  updatedBoardData.columns[index].isObfuscated = isObfuscated;

  await putTable(config.TABLE_BOARD, updatedBoardData);
  return updatedBoardData;
};

const updatecolorCards = async (boardId, colorCards, index) => {

  const boardData = await getBoardDb(config.TABLE_BOARD, boardId);

  if (!boardData) {
    throw new Error("Board não encontrado.");
  }

  if (index < 0 || index >= boardData.columns.length) {
    throw new Error("Índice inválido para atualizar o título da coluna.");
  }

  // Atualiza o título da coluna
  const updatedBoardData = { ...boardData };
  updatedBoardData.columns[index].colorCards = colorCards;

  await putTable(config.TABLE_BOARD, updatedBoardData);
  return updatedBoardData;
};

const updateLike = async (boardId, isIncrement, indexCard, indexColumn) => {

  const boardData = await getBoardDb(config.TABLE_BOARD, boardId);

  if (!boardData) {
    throw new Error("Board não encontrado.");
  }

  if (indexColumn < 0 || indexColumn >= boardData.columns.length) {
    throw new Error("Índice de coluna inválido.");
  }

  if (indexCard < 0 || indexCard >= boardData.columns[indexColumn].cards.length) {
    throw new Error("Índice de card inválido.");
  }

  // Atualiza a contagem de likes do card
  const updatedBoardData = { ...boardData };
  const columnToUpdate = updatedBoardData.columns[indexColumn];
  const countLike = columnToUpdate.cards[indexCard].likeCount;
  const countLikeUpdate = isIncrement ? countLike + 1 : countLike - 1;

  columnToUpdate.cards[indexCard].likeCount = countLikeUpdate;

  await putTable(config.TABLE_BOARD, updatedBoardData);
  return updatedBoardData;
};


const deleteCard = async (boardId, indexCard, indexColumn) => {

  const boardData = await getBoardDb(config.TABLE_BOARD, boardId);

  if (!boardData) {
    throw new Error("Board não encontrado.");
  }

  if (indexColumn < 0 || indexColumn >= boardData.columns.length) {
    throw new Error("Índice de coluna inválido.");
  }

  if (indexCard < 0 || indexCard >= boardData.columns[indexColumn].cards.length) {
    throw new Error("Índice de card inválido.");
  }

  // Atualiza a estrutura de dados para remover o card
  const updatedBoardData = { ...boardData };
  const columnToUpdate = updatedBoardData.columns[indexColumn];
  columnToUpdate.cards.splice(indexCard, 1);

  await putTable(config.TABLE_BOARD, updatedBoardData);
  return updatedBoardData;
};

const deleteAllCard = async (boardId, indexColumn) => {

  const boardData = await getBoardDb(config.TABLE_BOARD, boardId);

  if (!boardData) {
    throw new Error("Board não encontrado.");
  }

  if (indexColumn < 0 || indexColumn >= boardData.columns.length) {
    throw new Error("Índice de coluna inválido.");
  }

  // Atualiza a estrutura de dados para remover o card
  const updatedBoardData = { ...boardData };
  const columnToUpdate = updatedBoardData.columns[indexColumn];
  columnToUpdate.cards = [];


  await putTable(config.TABLE_BOARD, updatedBoardData);
  return updatedBoardData;
};

const saveCard = async (boardId, content, indexCard, indexColumn) => {

  const boardData = await getBoardDb(config.TABLE_BOARD, boardId);

  if (!boardData) {
    throw new Error("Board não encontrado.");
  }

  if (indexColumn < 0 || indexColumn >= boardData.columns.length) {
    throw new Error("Índice de coluna inválido.");
  }

  if (indexCard < 0 || indexCard >= boardData.columns[indexColumn].cards.length) {
    throw new Error("Índice de card inválido.");
  }

  // Atualiza o conteúdo do card
  const updatedBoardData = { ...boardData };
  const columnToUpdate = updatedBoardData.columns[indexColumn];
  columnToUpdate.cards[indexCard].content = content;

  await putTable(config.TABLE_BOARD, updatedBoardData);
  return updatedBoardData;
};

module.exports = { connectClientBoard, addCardBoard, reorderBoard, processCombine, deleteColumn, addColumn, updateTitleColumn, updateLike, deleteCard, deleteAllCard, saveCard, updatecolorCards, setIsObfuscatedBoardLevel, setIsObfuscatedColumnLevel, disconnectClientBoard };