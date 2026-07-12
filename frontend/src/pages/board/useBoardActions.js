import { v4 as uuidv4 } from 'uuid';
import {
  saveCard, deleteCard, updateLike, updateTitleColumn,
  deleteColumn, addCard, updatecolorCards, deleteAllCards,
  addColumn, setIsObfuscatedBoardLevel, setIsObfuscatedColumnLevel,
} from './FunctionsBoard';

export function useBoardActions({ boardData, setBoardData, socket }) {
  const {
    addCardSocket, updateTitleColumnSocket, updateLikeSocket,
    deleteCardSocket, saveCardSocket, deleteColumnSocket, addColumnSocket,
    updatecolorCardsSocket, deleteAllCardSocket,
    setIsObfuscatedBoardLevelSocket, setIsObfuscatedColumnLevelSocket,
  } = socket;

  const onSaveCard = (content, indexCard, indexColumn) => {
    setBoardData(prev => ({ ...prev, ...saveCard(prev, content, indexCard, indexColumn) }));
    saveCardSocket({ content, indexCard, indexColumn });
  };

  const onDeleteCard = (indexCard, indexColumn) => {
    if (!window.confirm("Confirma exclusão do Card?")) return;
    setBoardData(prev => ({ ...prev, ...deleteCard(prev, indexCard, indexColumn) }));
    deleteCardSocket({ indexCard, indexColumn });
  };

  const onDeleteAllCard = (indexColumn) => {
    if (!window.confirm("Confirma exclusão de todos os Cards da Coluna?")) return;
    setBoardData(prev => ({ ...prev, ...deleteAllCards(prev, indexColumn) }));
    deleteAllCardSocket({ indexColumn });
  };

  const onUpdateLike = (isIncrement, indexCard, indexColumn) => {
    setBoardData(prev => ({ ...prev, ...updateLike(prev, isIncrement, indexCard, indexColumn) }));
    updateLikeSocket({ isIncrement, indexCard, indexColumn });
  };

  const onUpdateTitleColumn = (content, index) => {
    setBoardData(prev => ({ ...prev, ...updateTitleColumn(prev, content, index) }));
    updateTitleColumnSocket({ content, index });
  };

  const onUpdatecolorCards = (colorCards, index) => {
    setBoardData(prev => ({ ...prev, ...updatecolorCards(prev, colorCards, index) }));
    updatecolorCardsSocket({ colorCards, index });
  };

  const onDeleteColumn = (index) => {
    if (!window.confirm("Confirma exclusão da Coluna?")) return;
    setBoardData(prev => ({ ...prev, ...deleteColumn(prev, index) }));
    deleteColumnSocket({ index });
  };

  const onAddCard = (newCard, indexColumn) => {
    setBoardData(prev => ({ ...prev, ...addCard(prev, newCard, indexColumn) }));
    addCardSocket({ newCard, indexColumn });
  };

  const handleAddColumn = (columnName) => {
    const newColumn = { id: uuidv4(), title: columnName, colorCards: "#F0E68C", isObfuscated: false, cards: [] };
    setBoardData(prev => ({ ...prev, ...addColumn(prev, newColumn) }));
    addColumnSocket({ newColumn });
  };

  const handleSetIsObfuscatedBoardLevel = (value) => {
    setBoardData(prev => setIsObfuscatedBoardLevel(prev, value));
    setIsObfuscatedBoardLevelSocket({ isObfuscated: value });
  };

  const handleSetIsObfuscatedColumnLevel = (value, index) => {
    setBoardData(prev => setIsObfuscatedColumnLevel(prev, value, index));
    setIsObfuscatedColumnLevelSocket({ isObfuscated: value, index });
  };

  return {
    onSaveCard, onDeleteCard, onDeleteAllCard, onUpdateLike,
    onUpdateTitleColumn, onUpdatecolorCards, onDeleteColumn,
    onAddCard, handleAddColumn, handleSetIsObfuscatedBoardLevel,
    handleSetIsObfuscatedColumnLevel,
  };
}
