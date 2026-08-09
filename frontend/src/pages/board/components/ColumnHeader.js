import React, { useState, useEffect } from 'react';
import styled from "styled-components";
import { Dropdown } from 'react-bootstrap';
import { MdMoreVert, MdEdit, MdCheck } from 'react-icons/md';
import { FaRegTrashAlt, FaPalette } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import './../../../styles/board.css';
import { COLUMN_COLOR_PALETTE } from '../columnColorPalette';

// ─── Design tokens — "Dark Premium" ───────────────────────────────────────────

const TEXT = '#f5f5f7';
const MUTED = 'rgba(245,245,247,0.42)';
const MUTED2 = 'rgba(245,245,247,0.62)';
const BORDER = 'rgba(255,255,255,0.07)';
const BORDER_STRONG = 'rgba(255,255,255,0.14)';
const ACCENT = '#8b7cf6';
const ACCENT_SOFT = '#a996ff';
const RED = '#fb7185';

const ColumnHeader = ({ columnTitle, countCards, index, onUpdateTitleColumn, onDeleteColumn, onDeleteAllCard, onUpdatecolorCards, colorCards }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(columnTitle || 'Título da Coluna');
  const [showColorOptions, setShowColorOptions] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setTitle(columnTitle);
  }, [columnTitle]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleSaveTitle = () => {
    setIsEditing(false);
    onUpdateTitleColumn(title, index)
  };

  const handleDeleteColumn = () => {
    onDeleteColumn(index)
  };

  const handleDeleteAllCards = () => {
    onDeleteAllCard(index)
  };

  const handleColorSelect = (color) => {
    setShowColorOptions(false);
    setIsDropdownOpen(false);
    onUpdatecolorCards(color, index)
  };

  const accent = colorCards || '#8b7cf6';

  return (
    <ColumnHeaderContainer>
      <TitleRow>
        <TitleGroup>
          <AccentDot style={{ background: accent, boxShadow: `0 0 8px ${accent}80` }} />
          {isEditing ? (
            <TitleInput
              type="text"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleSaveTitle}
              autoFocus
            />
          ) : (
            <Title>{title}</Title>
          )}
          <CountBadge style={{ background: `${accent}22`, color: accent }}>{countCards}</CountBadge>
        </TitleGroup>

        <HeaderActions>
          <Dropdown
            align="end"
            show={isDropdownOpen}
            onToggle={(isOpen) => setIsDropdownOpen(isOpen)}
          >
            <Dropdown.Toggle
              variant="link"
              id="dropdown-custom-components"
              as="div"
              style={dropdownToggleStyle}
            >
              <IconGhostBtn as="div" $active={isDropdownOpen}>
                {isEditing ? <MdCheck size={16} /> : <MdMoreVert size={16} />}
              </IconGhostBtn>
            </Dropdown.Toggle>

            <Dropdown.Menu style={dropdownMenuStyle}>
              <Dropdown.Item onClick={() => setIsEditing(true)} style={dropdownItemStyle}>
                <MdEdit style={iconMarginStyle} />
                Editar Título
              </Dropdown.Item>
              <Dropdown.Item onClick={handleDeleteColumn} style={dropdownItemStyle}>
                <FaRegTrashAlt style={iconMarginStyle} color={RED} />
                Excluir coluna
              </Dropdown.Item>
              <Dropdown.Item onClick={handleDeleteAllCards} style={dropdownItemStyle}>
                <FaTrashAlt style={iconMarginStyle} color={RED} />
                Excluir todos os Cards
              </Dropdown.Item>
              <Dropdown.Item
                onClick={(e) => {
                  e.stopPropagation();
                  setShowColorOptions(!showColorOptions);
                }}
                style={dropdownItemStyle}
              >
                <FaPalette style={iconMarginStyle} />
                Cor dos Cards
              </Dropdown.Item>

              {showColorOptions && (
                <ColorGroupsWrapper>
                  <ColorSwatchRow>
                    {COLUMN_COLOR_PALETTE.map((colorItem) => (
                      <ColorSwatch
                        key={colorItem.color}
                        title={colorItem.name}
                        $selected={colorItem.color === colorCards}
                        style={{ background: colorItem.color }}
                        onClick={() => handleColorSelect(colorItem.color)}
                      />
                    ))}
                  </ColorSwatchRow>
                </ColorGroupsWrapper>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </HeaderActions>
      </TitleRow>
    </ColumnHeaderContainer>
  );
};

export default ColumnHeader;


// Estilizações
const ColumnHeaderContainer = styled.div`
  width: 100%;
  padding: 10px 12px;
  border-bottom: 1px solid ${BORDER};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`;

const AccentDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const Title = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${TEXT};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TitleInput = styled.input`
  font-size: 14px;
  font-weight: 600;
  color: ${TEXT};
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid ${ACCENT}60;
  border-radius: 6px;
  padding: 2px 6px;
  outline: none;
  min-width: 0;
`;

const CountBadge = styled.span`
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 999px;
  flex-shrink: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
`;

const IconGhostBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background: ${({ $active }) => ($active ? 'rgba(139,124,246,0.18)' : 'transparent')};
  color: ${({ $active }) => ($active ? ACCENT_SOFT : MUTED)};
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${({ $active }) => ($active ? 'rgba(139,124,246,0.18)' : 'rgba(255,255,255,0.06)')};
    color: ${({ $active }) => ($active ? ACCENT_SOFT : TEXT)};
  }
`;

const ColorGroupsWrapper = styled.div`
  padding: 8px 4px 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ColorSwatchRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  align-items: center;
`;

const ColorSwatch = styled.button`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: ${({ $selected }) => ($selected ? '2px solid #fff' : `1px solid ${BORDER_STRONG}`)};
  box-shadow: ${({ $selected }) => ($selected ? '0 0 0 2px rgba(139,124,246,0.5)' : 'none')};
  cursor: pointer;
  transition: transform 0.15s ease;
  flex-shrink: 0;

  &:hover {
    transform: scale(1.15);
  }
`;

const dropdownToggleStyle = {
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  border: 'none',
  boxShadow: 'none',
};

const dropdownMenuStyle = {
  backgroundColor: '#141418',
  border: `1px solid ${BORDER_STRONG}`,
  borderRadius: '12px',
  padding: '6px',
  boxShadow: '0 20px 48px rgba(0,0,0,0.55)',
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

const iconMarginStyle = {
  marginRight: 8,
};
