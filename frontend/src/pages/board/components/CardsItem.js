import React, { useState, useRef, forwardRef, useEffect, memo } from "react";
import styled from "styled-components";
import { Dropdown } from "react-bootstrap";
import { MdMoreVert, MdEdit, MdCheck } from 'react-icons/md';
import { CiTrash } from "react-icons/ci";
import { FaHeart } from 'react-icons/fa6';
import ModalAddCard from '../modals/ModalAddCard';
import { resolveColumnAccent } from '../columnColorPalette';

// ─── Design tokens — "Dark Premium" ───────────────────────────────────────────

const TEXT   = 'var(--text)';
const MUTED  = 'var(--muted)';
const MUTED2 = 'var(--muted2)';
const BORDER_STRONG = 'var(--border-strong)';
const ACCENT_SOFT = 'var(--accent-soft)';

function CardItem({ card, isDragging, provided, index, isGroupedOver, indexColumn, onSaveCard, onDeleteCard, onUpdateLike, colorCards, userLoggedData, isObfuscatedBoardLevel, isObfuscatedColumnLevel }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalEditCardOpen, setModalEditCardOpen] = useState(false);
  const [content, setContent] = useState(card.content);
  const [likeCount, setLikeCount] = useState(0);
  const [hovered, setHovered] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    setContent(card.content);
  }, [card.content]);

  const CustomToggle = forwardRef((props, ref) => (
    <div
      ref={ref}
      {...props}
      style={{ cursor: "pointer" }}
    >
      <StyledMdMoreVert />
    </div>
  ));

  const handleOutsideClick = (e) => {
    if (menuRef.current && !menuRef.current.contains(e.target)) {
      setIsMenuOpen(false);
    }
  };

  const handleEdit = () => {
    setModalEditCardOpen(true)
  };

  const handleSave = (value) => {
    setIsEditing(false);
    setIsMenuOpen(false);
    onSaveCard(value, index, indexColumn);
  };

  const handleDelete = () => {
    setIsEditing(false);
    onDeleteCard(index, indexColumn);
  };

  const handleLikeClick = () => {
    if (likeCount === 0) {
      onUpdateLike(true, index, indexColumn)
    } else {
      onUpdateLike(false, index, indexColumn)
    }
    setLikeCount(likeCount === 0 ? 1 : 0);
  };

  const accent = resolveColumnAccent(colorCards);

    return (
    <Container
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      $isDragging={isDragging}
      $isGroupedOver={isGroupedOver}
      $accent={accent}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-is-dragging={isDragging}
      data-testid={card.id}
      data-index={index}
    >
      <ModalAddCard
        isOpen={isModalEditCardOpen}
        onClose={() => setModalEditCardOpen(false)}
        onSubmit={handleSave}
        title={"Atualização de Card"}
        isUpdateCard={true}
        content={card.content}
      />


      {(() => {
        const isOwner = userLoggedData.userId === card.userId || userLoggedData.isBoardCreator;
        const isBlurred = !isOwner && (isObfuscatedBoardLevel || isObfuscatedColumnLevel);
        const CardContent = isBlurred ? ContentBlur : Content;
        return (
          <CardContent>
            {isEditing ? (
              <StyledTextarea
                value={content}
                rows={4}
                onChange={(e) => setContent(e.target.value)}
                onBlur={handleSave}
                autoFocus
              />
            ) : (
              <div style={{ whiteSpace: 'pre-wrap' }}>{card.content}</div>
            )}
          </CardContent>
        );
      })()}

      {(card.userId === userLoggedData.userId || userLoggedData.isBoardCreator) &&
        <IconContainer ref={menuRef} $visible={hovered || isMenuOpen}>
          {isEditing ? (
            <StyledMdCheck onClick={handleSave} style={{ cursor: "pointer" }} />
          ) : (
            <Dropdown show={isMenuOpen} onToggle={() => setIsMenuOpen((prev) => !prev)}>
              <Dropdown.Toggle as={CustomToggle} id="dropdown-basic" />
              <Dropdown.Menu style={dropdownMenuStyle}>
                <Dropdown.Item style={dropdownItemStyle} onClick={handleEdit}>
                  <MdEdit style={{ marginRight: 8 }} />
                  Editar Card
                </Dropdown.Item>
                <Dropdown.Item style={dropdownItemStyle} onClick={handleDelete}>
                  <CiTrash style={{ marginRight: 8, color: 'var(--red)' }} />
                  Excluir Card
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </IconContainer>
      }
      <ContainerLike>
        <LikeIconContainer onClick={handleLikeClick}>
          <StyledHeart $liked={likeCount > 0} $accent={accent} />
          <Count>{card.likeCount}</Count>
        </LikeIconContainer>
      </ContainerLike>
    </Container >
  );
}

export default memo(CardItem);

const getBackground = (isDragging, isGroupedOver, accent) => {
  if (isGroupedOver) return 'color-mix(in srgb, var(--green) 18%, transparent)';
  return `color-mix(in srgb, ${accent} var(${isDragging ? '--card-tint-dragging' : '--card-tint'}), transparent)`;
};

const getBorderColor = (isDragging, accent) => (isDragging ? `${accent}70` : 'transparent');

const imageSize = 40;

const Container = styled.div`
  position: relative;
  border-radius: 12px;
  border: 1px solid ${(props) => getBorderColor(props.$isDragging, props.$accent)};
  border-left: 3px solid ${(props) => props.$accent};
  background-color: ${(props) => getBackground(props.$isDragging, props.$isGroupedOver, props.$accent)};
  box-shadow: ${(props) =>
    props.$isDragging
      ? `var(--shadow-strong), 0 0 0 1px ${props.$accent}40`
      : "none"};
  box-sizing: border-box;
  padding: 10px 12px;
  min-height: ${imageSize}px;
  margin: 0 8px 8px;
  user-select: none;
  cursor: ${(props) => (props.$isDragging ? "grabbing" : "grab")};
  color: ${TEXT};
  text-decoration: none;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: background-color 0.16s ease, border-color 0.16s ease, box-shadow 0.2s ease;

  &:hover,
  &:active {
    color: ${TEXT};
    text-decoration: none;
  }

  &:focus {
    outline: none;
    box-shadow: none;
  }
`;
const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 22px;
  font-size: 13.5px;
  line-height: 1.5;
`;

const ContentBlur = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  filter: blur(5px);
  pointer-events: none;
  font-size: 13.5px;
`;



// Like
const ContainerLike = styled.div`
  background-color: transparent;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 6px;
`;

const LikeIconContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
`;

const StyledHeart = styled(FaHeart)`
  color: ${({ $liked, $accent }) => ($liked ? $accent : MUTED)};
  transition: color 0.15s ease, transform 0.15s ease;
  font-size: 11px;

  ${LikeIconContainer}:hover & {
    transform: scale(1.15);
  }
`;

const Count = styled.span`
  font-size: 12px;
  color: ${MUTED2};
`;

//Menu
const IconContainer = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.15s ease;
`;

const StyledMdMoreVert = styled(MdMoreVert)`
  color: ${MUTED2};
  cursor: pointer;
  transition: color 0.15s ease;
  font-size: 16px;

  &:hover {
    color: ${TEXT};
  }
`;

const StyledTextarea = styled.textarea`
  flex-grow: 1;
  width: 100%;
  resize: none;
  padding: 8px;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 13.5px;
  color: ${TEXT};
  background-color: var(--surface-hover);
  border: 1px solid ${BORDER_STRONG};
  border-radius: 8px;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${ACCENT_SOFT};
    outline: none;
  }
`;

const dropdownMenuStyle = {
  backgroundColor: 'var(--panel)',
  border: `1px solid ${BORDER_STRONG}`,
  borderRadius: '12px',
  padding: '6px',
  boxShadow: 'var(--shadow-strong)',
};

const dropdownItemStyle = {
  fontSize: '12.5px',
  color: MUTED2,
  borderRadius: '8px',
  padding: '8px 10px',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
};

const StyledMdCheck = styled(MdCheck)`
  color: var(--on-accent);
  cursor: pointer;
  transition: transform 0.15s ease;
  font-size: 26px;
  background-color: var(--green);
  border-radius: 50%;
  padding: 6px;
  display: inline-flex;
  justify-content: center;
  align-items: center;

  &:hover {
    transform: scale(1.08);
  }
`;
