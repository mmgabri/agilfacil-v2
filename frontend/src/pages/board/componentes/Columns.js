import React, { memo, useState } from "react";
import styled from "@emotion/styled";
import { Droppable, Draggable } from "react-beautiful-dnd";
import CardsItem from "./CardsItem";
import ColumnHeader from "./ColumnHeader";

const grid = 8;
const scrollContainerHeight = 250;

// Componente para montar as Colunas
const ColumnContent = ({ cards, title, countCards, colorCards, dropProvided, indexColumn, onSaveCard, onDeleteCard, onDeleteAllCard, onUpdateLike, onUpdateTitleColumn, onDeleteColumn, onAddCard, onUpdatecolorCards, userLoggedData, isObfuscatedBoardLevel, isObfuscatedColumnLevel, handleSetIsObfuscatedColumnLevel }) => (
  <InnerContainer>
    <ColumnHeader columnTitle={title} countCards={countCards} index={indexColumn} onUpdateTitleColumn={onUpdateTitleColumn} onDeleteColumn={onDeleteColumn} onDeleteAllCard={onDeleteAllCard} onAddCard={onAddCard} onUpdatecolorCards={onUpdatecolorCards} userLoggedData={userLoggedData} isObfuscatedColumnLevel={isObfuscatedColumnLevel} handleSetIsObfuscatedColumnLevel={handleSetIsObfuscatedColumnLevel}></ColumnHeader>
    <DropZone ref={dropProvided.innerRef}>
      <DraggableCardList cards={cards} indexColumn={indexColumn} onSaveCard={onSaveCard} onDeleteCard={onDeleteCard}  onUpdateLike={onUpdateLike} colorCards={colorCards} userLoggedData={userLoggedData} isObfuscatedBoardLevel={isObfuscatedBoardLevel} isObfuscatedColumnLevel={isObfuscatedColumnLevel}/>
      {dropProvided.placeholder}
    </DropZone>
  </InnerContainer>
);

// Componente para montar os Cards
const DraggableCardList = memo(({ cards, indexColumn, onSaveCard, onDeleteCard, onUpdateLike, colorCards, userLoggedData, isObfuscatedBoardLevel, isObfuscatedColumnLevel}) =>
  cards.map((card, index) => {
    return (
      <Draggable key={card.id} draggableId={card.id} index={index} indexColumn={indexColumn} >
        {(dragProvided, dragSnapshot) => (
          <CardsItem
            card={card}
            isDragging={dragSnapshot.isDragging}
            isGroupedOver={Boolean(dragSnapshot.combineTargetFor)}
            provided={dragProvided}
            onSaveCard={onSaveCard}
            onDeleteCard={onDeleteCard}
            onUpdateLike={onUpdateLike}
            index={index}
            indexColumn={indexColumn}
            colorCards={colorCards}
            userLoggedData={userLoggedData}
            isObfuscatedBoardLevel={isObfuscatedBoardLevel}
            isObfuscatedColumnLevel={isObfuscatedColumnLevel}
          />
        )}
      </Draggable>
    );
  })
);


// Componente principal
export default function Column(props) {
  const {isCombineEnabled, listId = "LIST", listType, cards, title, colorCards, onSaveCard, onDeleteCard, onDeleteAllCard,  onUpdateLike, onUpdateTitleColumn, onDeleteColumn, onAddCard, onUpdatecolorCards, indexColumn, userLoggedData, isObfuscatedBoardLevel, isObfuscatedColumnLevel, handleSetIsObfuscatedColumnLevel } = props;

  return (
    <Droppable
      droppableId={listId}
      type={listType}
      isCombineEnabled={isCombineEnabled}
    >
      {(dropProvided, dropSnapshot) => (
        <ColumnsContainer>
          <ColumnWrapper
            isDraggingOver={dropSnapshot.isDraggingOver}
            isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
            {...dropProvided.droppableProps}
          >
            <ColumnContent
              cards={cards}
              title={title}
              countCards={cards.length}
              dropProvided={dropProvided}
              indexColumn={indexColumn}
              onSaveCard={onSaveCard}
              onDeleteCard={onDeleteCard}
              onDeleteAllCard={onDeleteAllCard}
              onUpdateLike={onUpdateLike}
              onUpdateTitleColumn={onUpdateTitleColumn}
              onUpdatecolorCards={onUpdatecolorCards}
              onDeleteColumn={onDeleteColumn}
              onAddCard={onAddCard}
              colorCards={colorCards}
              userLoggedData={userLoggedData}
              isObfuscatedBoardLevel={isObfuscatedBoardLevel}
              isObfuscatedColumnLevel={isObfuscatedColumnLevel}
              handleSetIsObfuscatedColumnLevel={handleSetIsObfuscatedColumnLevel}
            />
          </ColumnWrapper>
        </ColumnsContainer>
      )}
    </Droppable>
  );
}


// Estilizações

// Função utilitária para definir o background dinamicamente
const getBackgroundColor = (isDraggingOver, isDraggingFrom) => {
  if (isDraggingOver) return "#404040";
  if (isDraggingFrom) return "#585858";
  return  "#2c2c2c";  // #backgound_coluna2
};

const ColumnWrapper = styled.div`
  background-color: ${(props) =>
    getBackgroundColor(props.isDraggingOver, props.isDraggingFrom)};
  display: flex;
  flex-direction: column;
  opacity: ${({ isDropDisabled }) => (isDropDisabled ? 0.5 : "inherit")};
  border: ${grid}px;
  padding-bottom: 0;
  transition: background-color 0.2s ease, opacity 0.1s ease;
  user-select: none;
  flex: 1; /* Faz a coluna ocupar o mesmo espaço disponível, mas sem exceder o espaço total */
  min-width: 200px; /* Tamanho mínimo da coluna para telas menores */
  box-sizing: border-box;

  @media (max-width: 768px) {
    min-width: 150px; /* Reduz o tamanho mínimo em telas menores */
    max-width: 200px;
  }

  @media (max-width: 480px) {
    min-width: 120px;
    max-width: 180px;
  }
`;

const ColumnsContainer = styled.div`
  display: flex;
  flex-wrap: wrap; /* Permite quebrar as colunas para a próxima linha em telas menores */
  justify-content: center; /* Centraliza as colunas */
  width: 100%; /* A largura total deve ocupar 100% do espaço */
  gap: 10px; /* Adiciona um pequeno espaço entre as colunas */
`;

const DropZone = styled.div`
  min-height: ${scrollContainerHeight}px;
  padding-bottom: ${grid}px;
`;

const InnerContainer = styled.div``;