const config = require('../../config');
const { getBoardDb, mutateItem } = require('../database/dynamoService');

// Toda alteração passa por mutateBoard: lê o board, aplica `fn` e grava com
// controle de versão. Em caso de escrita concorrente, relê e reaplica `fn`.
// `fn` recebe uma cópia nova do board a cada tentativa e deve retornar o board
// alterado, ou null quando não há nada a gravar.
const mutateBoard = (boardId, fn) => mutateItem({
  tableName: config.TABLE_BOARD,
  keyName: 'boardId',
  id: boardId,
  load: async () => {
    const board = await getBoardDb(config.TABLE_BOARD, boardId);
    if (!board) throw new Error("Board não encontrado.");
    return board;
  },
  mutate: fn,
});

// Resolve a posição atual da coluna/card. Quando o cliente envia ids
// (comandos reenviados após reconexão podem ter índices desatualizados),
// localiza pelo id; sem ids, mantém o comportamento antigo por índice.
const resolveColumnIndex = (boardData, indexColumn, columnId) => {
  if (columnId) {
    const idx = boardData.columns.findIndex(col => col.id === columnId);
    if (idx === -1) throw new Error("Coluna não encontrada.");
    return idx;
  }
  if (indexColumn < 0 || indexColumn >= boardData.columns.length) {
    throw new Error("Índice de coluna inválido.");
  }
  return indexColumn;
};

const resolveCardIndex = (column, indexCard, cardId) => {
  if (cardId) {
    const idx = column.cards.findIndex(card => card.id === cardId);
    if (idx === -1) throw new Error("Card não encontrado.");
    return idx;
  }
  if (indexCard < 0 || indexCard >= column.cards.length) {
    throw new Error("Índice de card inválido.");
  }
  return indexCard;
};

const validateColumnIndex = (board, index, message) => {
  if (index < 0 || index >= board.columns.length) throw new Error(message);
};

const getBoard = async (boardId) => {
  return getBoardDb(config.TABLE_BOARD, boardId);
};

const connectClientBoard = (boardId, userId) => mutateBoard(boardId, (board) => {
  const userExists = board.usersOnBoard.some(user => user.userId === userId);
  const userExistsHistoric = board.usersOnBoardHistoric.some(user => user.userId === userId);
  if (userExists && userExistsHistoric) return null;

  if (!userExists) board.usersOnBoard.push({ userId });
  if (!userExistsHistoric) board.usersOnBoardHistoric.push({ userId });
  return board;
});

const disconnectClientBoard = (userIdToRemove, boardId) => mutateBoard(boardId, (board) => {
  // Remove usuário da lista de logado
  if (!board.usersOnBoard.some(user => user.userId === userIdToRemove)) return null;
  board.usersOnBoard = board.usersOnBoard.filter(user => user.userId !== userIdToRemove);
  return board;
});

const addCardBoard = (boardId, newCard, indexColumn, columnId) => mutateBoard(boardId, (board) => {
  // Idempotência: um comando reenviado após reconexão não pode duplicar o card.
  const alreadyExists = board.columns.some(col => col.cards.some(card => card.id === newCard.id));
  if (alreadyExists) return null;

  board.columns[resolveColumnIndex(board, indexColumn, columnId)].cards.push(newCard);

  // Adiciona usuario a lista de usuários que criaram card
  if (!board.cardCreators.some(user => user.userId === newCard.userId)) {
    board.cardCreators.push({ userId: newCard.userId });
  }
  return board;
});

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const reorderBoard = (boardId, source, destination) => mutateBoard(boardId, (board) => {
  const sourceColumn = board.columns.find(col => col.id === source.droppableId);
  const destinationColumn = board.columns.find(col => col.id === destination.droppableId);
  if (!sourceColumn || !destinationColumn) throw new Error("Coluna não encontrada.");

  const currentCards = [...sourceColumn.cards];
  const targetCard = currentCards[source.index];
  if (!targetCard) throw new Error("Índice de card inválido.");

  if (source.droppableId === destination.droppableId) {
    // Reordenação dentro da mesma coluna
    const reorderedCards = reorder(currentCards, source.index, destination.index);
    board.columns = board.columns.map(column =>
      column.id === source.droppableId ? { ...column, cards: reorderedCards } : column
    );
  } else {
    // Movendo entre colunas diferentes
    const sourceCards = [...sourceColumn.cards];
    const destinationCards = [...destinationColumn.cards];
    sourceCards.splice(source.index, 1);
    destinationCards.splice(destination.index, 0, targetCard);

    board.columns = board.columns.map(column => {
      if (column.id === source.droppableId) return { ...column, cards: sourceCards };
      if (column.id === destination.droppableId) return { ...column, cards: destinationCards };
      return column;
    });
  }
  return board;
});

const processCombine = (boardId, source, combine) => mutateBoard(boardId, (board) => {
  board.columns = combine.droppableId === source.droppableId
    ? processCombineSameColumn(board, source, combine)
    : processCombineDifferentColumn(board, source, combine);
  return board;
});

const processCombineDifferentColumn = (boardData, source, combine) => {
  const sourceCards = [...boardData.columns.find(col => col.id === source.droppableId).cards];
  const combineCards = [...boardData.columns.find(col => col.id === combine.droppableId).cards];

  // Obtém o card movido e remove da origem
  const sourceCard = sourceCards[source.index];
  sourceCards.splice(source.index, 1);

  // Localiza e atualiza o card combinado
  const combineCardIndex = combineCards.findIndex(x => x.id === combine.draggableId);
  const combineCard = combineCards[combineCardIndex];
  combineCards[combineCardIndex] = {
    ...combineCard,
    content: `${combineCard.content}\n+\n${sourceCard.content}`
  };

  return boardData.columns.map(column => {
    if (column.id === combine.droppableId) return { ...column, cards: combineCards };
    if (column.id === source.droppableId) return { ...column, cards: sourceCards };
    return column;
  });
};

const processCombineSameColumn = (boardData, source, combine) => {
  const combineCards = [...boardData.columns.find(col => col.id === combine.droppableId).cards];

  // Obtém o card movido e remove da origem
  const sourceCard = combineCards[source.index];
  combineCards.splice(source.index, 1);

  // Localiza e atualiza o card combinado
  const combineCardIndex = combineCards.findIndex(x => x.id === combine.draggableId);
  const combineCard = combineCards[combineCardIndex];
  combineCards[combineCardIndex] = {
    ...combineCard,
    content: `${combineCard.content}\n+\n${sourceCard.content}`
  };

  return boardData.columns.map(column =>
    column.id === combine.droppableId ? { ...column, cards: combineCards } : column
  );
};

const deleteColumn = (boardId, index) => mutateBoard(boardId, (board) => {
  validateColumnIndex(board, index, "Índice inválido para deletar a coluna.");
  board.columns.splice(index, 1);
  return board;
});

const addColumn = (boardId, newColumn) => mutateBoard(boardId, (board) => {
  if (newColumn?.id && board.columns.some(col => col.id === newColumn.id)) return null;
  board.columns.push(newColumn);
  return board;
});

const updateTitleColumn = (boardId, content, index) => mutateBoard(boardId, (board) => {
  validateColumnIndex(board, index, 'Índice inválido para atualizar o título da coluna.');
  board.columns[index].title = content;
  return board;
});

const setIsObfuscatedBoardLevel = (boardId, isObfuscated) => mutateBoard(boardId, (board) => {
  board.isObfuscated = isObfuscated;
  return board;
});

const setIsObfuscatedColumnLevel = (boardId, isObfuscated, index) => mutateBoard(boardId, (board) => {
  validateColumnIndex(board, index, "Índice inválido para atualizar o título da coluna.");
  board.columns[index].isObfuscated = isObfuscated;
  return board;
});

const updatecolorCards = (boardId, colorCards, index) => mutateBoard(boardId, (board) => {
  validateColumnIndex(board, index, "Índice inválido para atualizar o título da coluna.");
  board.columns[index].colorCards = colorCards;
  return board;
});

const updateLike = (boardId, isIncrement, indexCard, indexColumn, columnId, cardId) => mutateBoard(boardId, (board) => {
  const iCol = resolveColumnIndex(board, indexColumn, columnId);
  const iCard = resolveCardIndex(board.columns[iCol], indexCard, cardId);
  const card = board.columns[iCol].cards[iCard];
  card.likeCount = isIncrement ? card.likeCount + 1 : card.likeCount - 1;
  return board;
});

const deleteCard = (boardId, indexCard, indexColumn, columnId, cardId) => mutateBoard(boardId, (board) => {
  const iCol = resolveColumnIndex(board, indexColumn, columnId);
  const iCard = resolveCardIndex(board.columns[iCol], indexCard, cardId);
  board.columns[iCol].cards.splice(iCard, 1);
  return board;
});

const deleteAllCard = (boardId, indexColumn) => mutateBoard(boardId, (board) => {
  validateColumnIndex(board, indexColumn, "Índice de coluna inválido.");
  board.columns[indexColumn].cards = [];
  return board;
});

const saveCard = (boardId, content, indexCard, indexColumn, columnId, cardId) => mutateBoard(boardId, (board) => {
  const iCol = resolveColumnIndex(board, indexColumn, columnId);
  const iCard = resolveCardIndex(board.columns[iCol], indexCard, cardId);
  board.columns[iCol].cards[iCard].content = content;
  return board;
});

module.exports = { getBoard, connectClientBoard, addCardBoard, reorderBoard, processCombine, deleteColumn, addColumn, updateTitleColumn, updateLike, deleteCard, deleteAllCard, saveCard, updatecolorCards, setIsObfuscatedBoardLevel, setIsObfuscatedColumnLevel, disconnectClientBoard };
