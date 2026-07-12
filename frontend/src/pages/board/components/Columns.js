import React, { memo, useState } from "react";
import styled from "@emotion/styled";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { v4 as uuidv4 } from 'uuid';
import CardsItem from "./CardsItem";
import ColumnHeader from "./ColumnHeader";

const grid = 8;
const scrollContainerHeight = 250;

const TEXT   = '#f5f5f7';
const MUTED2 = 'rgba(245,245,247,0.62)';
const BORDER = 'rgba(255,255,255,0.07)';

// Campo de adição rápida de card — sempre visível no topo da coluna
const QuickAddCard = ({ accent, indexColumn, onAddCard, userLoggedData }) => {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSave = () => {
    if (!text.trim()) return;
    const newCard = {
      id: uuidv4(),
      content: text.trim(),
      createdBy: "",
      userId: userLoggedData.userId,
      likeCount: 0,
    };
    onAddCard(newCard, indexColumn);
    setText("");
    setFocused(false);
  };

  return (
    <QuickAddWrapper>
      <QuickAddTextarea
        rows={focused ? 3 : 1}
        placeholder="Escreva algo..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => { if (!text) setFocused(false); }}
        $accent={accent}
      />
      {focused && (
        <QuickAddActions>
          <QuickAddSaveBtn style={{ background: accent }} onClick={handleSave}>Salvar</QuickAddSaveBtn>
          <QuickAddCancelBtn onClick={() => { setText(""); setFocused(false); }}>Cancelar</QuickAddCancelBtn>
        </QuickAddActions>
      )}
    </QuickAddWrapper>
  );
};

// Componente para montar as Colunas
const ColumnContent = ({ cards, title, countCards, colorCards, dropProvided, indexColumn, onSaveCard, onDeleteCard, onDeleteAllCard, onUpdateLike, onUpdateTitleColumn, onDeleteColumn, onAddCard, onUpdatecolorCards, userLoggedData, isObfuscatedBoardLevel, isObfuscatedColumnLevel }) => {
  const accent = colorCards || '#8b7cf6';
  return (
    <InnerContainer>
      <ColumnHeader columnTitle={title} countCards={countCards} colorCards={colorCards} index={indexColumn} onUpdateTitleColumn={onUpdateTitleColumn} onDeleteColumn={onDeleteColumn} onDeleteAllCard={onDeleteAllCard} onUpdatecolorCards={onUpdatecolorCards}></ColumnHeader>
      <QuickAddCard accent={accent} indexColumn={indexColumn} onAddCard={onAddCard} userLoggedData={userLoggedData} />
      <DropZone ref={dropProvided.innerRef}>
        <DraggableCardList cards={cards} indexColumn={indexColumn} onSaveCard={onSaveCard} onDeleteCard={onDeleteCard}  onUpdateLike={onUpdateLike} colorCards={colorCards} userLoggedData={userLoggedData} isObfuscatedBoardLevel={isObfuscatedBoardLevel} isObfuscatedColumnLevel={isObfuscatedColumnLevel}/>
        {dropProvided.placeholder}
      </DropZone>
    </InnerContainer>
  );
};

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
  const {isCombineEnabled, listId = "LIST", listType, cards, title, colorCards, onSaveCard, onDeleteCard, onDeleteAllCard,  onUpdateLike, onUpdateTitleColumn, onDeleteColumn, onAddCard, onUpdatecolorCards, indexColumn, userLoggedData, isObfuscatedBoardLevel, isObfuscatedColumnLevel } = props;

  const accent = colorCards || '#8b7cf6';

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
            $accent={accent}
            {...dropProvided.droppableProps}
          >
            <GlassLayer
              isDraggingOver={dropSnapshot.isDraggingOver}
              isDraggingFrom={Boolean(dropSnapshot.draggingFromThisWith)}
              $accent={accent}
            />
            <AccentLine style={{ background: `linear-gradient(90deg, ${accent}, transparent 85%)` }} />
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
            />
          </ColumnWrapper>
        </ColumnsContainer>
      )}
    </Droppable>
  );
}


// Estilizações — "Dark Premium"

const BORDER_STRONG = 'rgba(255,255,255,0.14)';

// Função utilitária para definir o background dinamicamente — usa a cor de
// acento da própria coluna como indicador de "solte aqui" durante o arrasto.
const getBackgroundColor = (isDraggingOver, isDraggingFrom, accent) => {
  if (isDraggingOver) return `${accent}1a`;
  if (isDraggingFrom) return "rgba(255,255,255,0.045)";
  return "rgba(255,255,255,0.028)";
};

// IMPORTANTE: este wrapper NÃO pode ter backdrop-filter/overflow:hidden —
// qualquer ancestral com backdrop-filter vira "containing block" pra
// elementos position:fixed, e é assim que a lib de drag-and-drop posiciona
// o card durante o arrasto. Com blur+overflow aqui, o card arrastado era
// posicionado relativo à coluna (não à tela) e cortado ao sair da caixa.
// O efeito de vidro fica só na <GlassLayer>, que é irmã do conteúdo, não
// ancestral — assim não interfere no posicionamento do drag.
const ColumnWrapper = styled.div`
  position: relative;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  opacity: ${({ isDropDisabled }) => (isDropDisabled ? 0.5 : "inherit")};
  padding-bottom: 0;
  user-select: none;
  flex: 1;
  height: 100%;
  min-width: 200px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    min-width: 150px;
    max-width: 200px;
  }

  @media (max-width: 480px) {
    min-width: 120px;
    max-width: 180px;
  }
`;

const GlassLayer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  border-radius: 16px;
  overflow: hidden;
  background-color: ${(props) =>
    getBackgroundColor(props.isDraggingOver, props.isDraggingFrom, props.$accent)};
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid ${(props) => (props.isDraggingOver ? `${props.$accent}80` : BORDER)};
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.35);
  transition: background-color 0.2s ease, border-color 0.2s ease;
`;

const AccentLine = styled.div`
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
`;

const ColumnsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const DropZone = styled.div`
  min-height: ${scrollContainerHeight}px;
  padding: ${grid}px ${grid}px 0;
  flex: 1;
`;

const InnerContainer = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const QuickAddWrapper = styled.div`
  padding: ${grid}px ${grid}px 0;
  flex-shrink: 0;
`;

const QuickAddTextarea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  resize: none;
  padding: 8px 10px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  color: ${TEXT};
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid ${(props) => (props.value || props.autoFocus ? `${props.$accent}70` : BORDER)};
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;

  &:focus {
    border-color: ${(props) => `${props.$accent}70`};
    box-shadow: 0 0 0 3px ${(props) => `${props.$accent}18`};
  }

  &::placeholder {
    color: ${MUTED2};
  }
`;

const QuickAddActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const QuickAddSaveBtn = styled.button`
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  color: #0a0a0d;
  cursor: pointer;
`;

const QuickAddCancelBtn = styled.button`
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: ${MUTED2};
  cursor: pointer;
`;
