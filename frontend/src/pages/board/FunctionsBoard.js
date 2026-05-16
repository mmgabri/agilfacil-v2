const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export default reorder;

export const reorderboardData = (boardData, source, destination) => {
  const current = [...boardData.columns.find(col => col.id === source.droppableId).cards];
  const next = [...boardData.columns.find(col => col.id === destination.droppableId).cards];
  const target = current[source.index];

  if (source.droppableId === destination.droppableId) {
    const reordered = reorder(current, source.index, destination.index);

    const result = boardData.columns.map(column =>
      column.id === source.droppableId ? { ...column, cards: reordered } : column
    );

    return result;
  }

  // moving to different list

  // remove from original
  current.splice(source.index, 1);
  // insert into next
  next.splice(destination.index, 0, target);

  const result = boardData.columns.map(column => {
    if (column.id === source.droppableId) {
      return { ...column, cards: current };
    }
    if (column.id === destination.droppableId) {
      return { ...column, cards: next };
    }
    return column; // Retorna as colunas não alteradas
  });

  return result;
};

export const processCombine = (boardData, source, combine) => {
  if (combine.droppableId === source.droppableId) {
    const result = processCombineSameColumn(boardData, source, combine)
    return result
  } else {
    const result = processCombineDifferentColumn(boardData, source, combine)
    return result
  }
}

const processCombineDifferentColumn = (boardData, source, combine) => {
  const sourceCards = [...boardData.columns.find(col => col.id === source.droppableId).cards];
  const combineCards = [...boardData.columns.find(col => col.id === combine.droppableId).cards];

  //Obtem card movido
  const sourceCard = sourceCards[source.index];

  // Remove o item da origem e destino
  sourceCards.splice(source.index, 1);

  const combineCardIndex = combineCards.findIndex(
    (x) => x.id === combine.draggableId
  );
  const combineCard = combineCards[combineCardIndex];
  combineCards[combineCardIndex] = {
    ...combineCard,
    content: `${combineCard.content}\n+\n${sourceCard.content}`
  };

  const updatedColumns = boardData.columns.map(column => {
    if (column.id === combine.droppableId) {
      // Atualiza os cards da coluna que combinou
      return { ...column, cards: combineCards };
    }
    if (column.id === source.droppableId) {
      // Atualiza os cards da coluna de origem
      return { ...column, cards: sourceCards };
    }
    return column; // Retorna as colunas não alteradas
  });

  return updatedColumns;

}

const processCombineSameColumn = (boardData, source, combine) => {
  const combineCards = [...boardData.columns.find(col => col.id === combine.droppableId).cards];

  //Obtem card movido
  const sourceCard = combineCards[source.index];

  // Remove o item da origem e destino
  combineCards.splice(source.index, 1);
  //sourceCards.splice(source.index, 1);

  // Obtem o card com o qual foi combinado
  const combineCardIndex = combineCards.findIndex(
    (x) => x.id === combine.draggableId
  );
  const combineCard = combineCards[combineCardIndex];

  // Atualiza o conteúdo do item combinado, concatenando os textos
  combineCards[combineCardIndex] = {
    ...combineCard,
    content: `${combineCard.content}\n+\n${sourceCard.content}`
  };

  //Atualiza estado
  const updatedboardData = boardData.columns.map(column =>
    column.id === combine.droppableId ? { ...column, cards: combineCards } : column
  );

  return updatedboardData;

}

export const saveCard = (boardData, content, indexCard, indexColumn) => {
  const updatedBoardData = { ...boardData };
  const columnToUpdate = updatedBoardData.columns[indexColumn];
  columnToUpdate.cards[indexCard].content = content;
  return updatedBoardData;
}

export const deleteCard = (boardData, indexCard, indexColumn) => {
  const updatedBoardData = { ...boardData };
  const columnToUpdate = updatedBoardData.columns[indexColumn];
  columnToUpdate.cards.splice(indexCard, 1);
  return updatedBoardData;
}

export const deleteAllCards = (boardData, indexColumn) => {
  const updatedBoardData = { ...boardData };
  const columnToUpdate = updatedBoardData.columns[indexColumn];
  columnToUpdate.cards = [];
  return updatedBoardData;
};


export const updateLike = (boardData, isIncrement, indexCard, indexColumn) => {
  const updatedBoardData = { ...boardData };
  const columnToUpdate = updatedBoardData.columns[indexColumn];
  const countLike = updatedBoardData.columns[indexColumn].cards[indexCard].likeCount;
  const countLikeUpdate = isIncrement ? countLike + 1 : countLike - 1
  columnToUpdate.cards[indexCard].likeCount = countLikeUpdate;
  return updatedBoardData;
}

export const updateTitleColumn = (boardData, content, index) => {
  const updatedBoardData = { ...boardData };
  const columnToUpdate = updatedBoardData.columns[index];
  columnToUpdate.title = content;
  return updatedBoardData;
}

export const setIsObfuscatedBoardLevel = (boardData, isObfuscated) => {
  const updatedBoardData = { ...boardData };
  updatedBoardData.isObfuscated = isObfuscated; // Atualiza isObfuscated
  return updatedBoardData;
}

export const setIsObfuscatedColumnLevel = (boardData, isObfuscated, index) => {
  const updatedBoardData = { ...boardData };
  const columnToUpdate = updatedBoardData.columns[index];
  columnToUpdate.isObfuscated = isObfuscated;
  return updatedBoardData;
}

export const updatecolorCards = (boardData, colorCards, index) => {
  const updatedBoardData = { ...boardData };
  const columnToUpdate = updatedBoardData.columns[index];
  columnToUpdate.colorCards = colorCards;
  return updatedBoardData;
}

export const deleteColumn = (boardData, index) => {
  const updatedBoardData = { ...boardData };
  updatedBoardData.columns.splice(index, 1);
  return updatedBoardData;
}

export const addCard = (boardData, newCard, indexColumn) => {
  const updatedBoardData = { ...boardData };
  const columnToUpdate = updatedBoardData.columns[indexColumn];
  columnToUpdate.cards.push(newCard);
  return updatedBoardData;
}

export const addCollumn = (boardData, newCollumn) => {
  const updatedBoardData = { ...boardData };
  updatedBoardData.columns.push(newCollumn);
  return updatedBoardData;
}