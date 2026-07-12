import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';
import { MdClose, MdOutlineRemoveCircleOutline } from 'react-icons/md';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { emitMessage, onGetToken } from '../../services/utils';
import { createBoard } from '../../services/boardService';
import logger from '../../services/logger';

const CTX = 'CreateBoardModal';

// ─── Design tokens — "Dark Premium" ───────────────────────────────────────────
// Mesmo sistema visual do Header / BoardListPage.js / BoardPageMock.js.

const TEXT          = '#f5f5f7';
const MUTED         = 'rgba(245,245,247,0.42)';
const MUTED2        = 'rgba(245,245,247,0.62)';
const BORDER        = 'rgba(255,255,255,0.07)';
const BORDER_STRONG = 'rgba(255,255,255,0.14)';
const ACCENT        = '#8b7cf6';
const ACCENT_SOFT   = '#a996ff';
const ACCENT_GLOW   = 'rgba(139,124,246,0.18)';
const ACCENT_GRAD   = 'linear-gradient(135deg, #9a8bfb 0%, #7c6cf0 100%)';
const RED           = '#fb7185';

const emptyColumn = () => ({ id: uuidv4(), title: '', colorCards: '#F0E68C', isObfuscated: false, cards: [] });

const buildInitialFormData = (initialBoard) => initialBoard ? ({
  boardName: initialBoard.boardName,
  areaName: initialBoard.areaName,
  squadName: initialBoard.squadName,
  columns: initialBoard.columns.map(column => ({ ...column, cards: [] })),
}) : ({
  boardName: '',
  areaName: '',
  squadName: '',
  columns: [emptyColumn()],
});

// ─── Formulário (reutilizável no modal e na página cheia) ─────────────────────

export function CreateBoardForm({ initialBoard, userAuthenticated, onCreated, onCancel }) {
  const [formData, setFormData] = useState(() => buildInitialFormData(initialBoard));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormData(buildInitialFormData(initialBoard));
  }, [initialBoard]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColumnChange = (e, columnId) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      columns: prev.columns.map(column => column.id === columnId ? { ...column, title: value } : column),
    }));
  };

  const handleAddColumn = () => {
    setFormData(prev => ({ ...prev, columns: [...prev.columns, emptyColumn()] }));
  };

  const handleRemoveColumn = (columnId) => {
    setFormData(prev => ({ ...prev, columns: prev.columns.filter(col => col.id !== columnId) }));
  };

  const handleKeepCardsChange = (columnId, isChecked) => {
    setFormData(prev => ({
      ...prev,
      columns: prev.columns.map(column => column.id === columnId
        ? { ...column, cards: isChecked ? (initialBoard?.columns.find(c => c.id === columnId)?.cards || []) : [] }
        : column),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    logger.info(CTX, `Criando board boardName="${formData.boardName}" colunas=${formData.columns.length}`);
    setSubmitting(true);
    try {
      const token = await onGetToken();
      const boardData = await createBoard({
        creatorId: userAuthenticated.userId,
        userName: userAuthenticated.userName,
        boardName: formData.boardName,
        squadName: formData.squadName,
        areaName: formData.areaName,
        columns: formData.columns,
      }, token);
      logger.info(CTX, `Board criado boardId=${boardData?.boardId ?? '?'}`);
      onCreated(boardData);
    } catch (error) {
      logger.error(CTX, 'Erro ao criar Board', { message: error.message, status: error.response?.status });
      emitMessage('error', 906, 3000);
      setSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FieldGroup>
        <FieldLabel htmlFor="boardName">Nome do board*</FieldLabel>
        <FieldInput
          type="text" id="boardName" name="boardName"
          value={formData.boardName} onChange={handleFieldChange}
          placeholder="Digite o nome do board" required maxLength={55}
        />
      </FieldGroup>

      <FieldRow>
        <FieldGroup style={{ flex: 1 }}>
          <FieldLabel htmlFor="squadName">Squad</FieldLabel>
          <FieldInput
            type="text" id="squadName" name="squadName"
            value={formData.squadName} onChange={handleFieldChange}
            placeholder="Nome da squad" maxLength={30}
          />
        </FieldGroup>
        <FieldGroup style={{ flex: 1 }}>
          <FieldLabel htmlFor="areaName">Área</FieldLabel>
          <FieldInput
            type="text" id="areaName" name="areaName"
            value={formData.areaName} onChange={handleFieldChange}
            placeholder="Área, gerência etc" maxLength={30}
          />
        </FieldGroup>
      </FieldRow>

      <FieldGroup>
        <FieldLabel>Colunas do board*</FieldLabel>
        <ColumnList>
          {formData.columns.map((column, index) => (
            <ColumnRow key={column.id}>
              <FieldInput
                type="text"
                placeholder={`Título da coluna ${index + 1}`}
                value={column.title}
                onChange={(e) => handleColumnChange(e, column.id)}
                required
                style={{ flex: 1 }}
              />
              {initialBoard && (
                <KeepCardsLabel>
                  <input type="checkbox" onChange={(e) => handleKeepCardsChange(column.id, e.target.checked)} />
                  Manter cards
                </KeepCardsLabel>
              )}
              <RemoveColumnBtn type="button" title="Remover coluna" onClick={() => handleRemoveColumn(column.id)}>
                <MdOutlineRemoveCircleOutline size={18} />
              </RemoveColumnBtn>
            </ColumnRow>
          ))}
        </ColumnList>
        <AddColumnBtn type="button" onClick={handleAddColumn}>
          <IoIosAddCircleOutline size={16} />
          Adicionar coluna
        </AddColumnBtn>
      </FieldGroup>

      <Actions>
        {onCancel && <CancelBtn type="button" onClick={onCancel}>Cancelar</CancelBtn>}
        <SubmitBtn type="submit" disabled={submitting}>
          {submitting ? 'Criando...' : (initialBoard ? 'Clonar board' : 'Criar board')}
        </SubmitBtn>
      </Actions>
    </Form>
  );
}

// ─── Modal ──────────────────────────────────────────────────────────────────────

export default function CreateBoardModal({ isOpen, initialBoard, userAuthenticated, onClose, onCreated }) {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Panel onClick={(e) => e.stopPropagation()}>
        <PanelHeader>
          <PanelTitle>{initialBoard ? 'Clonar board' : 'Criar novo board'}</PanelTitle>
          <CloseBtn onClick={onClose}><MdClose size={16} /></CloseBtn>
        </PanelHeader>
        <PanelBody>
          <CreateBoardForm
            initialBoard={initialBoard}
            userAuthenticated={userAuthenticated}
            onCreated={onCreated}
            onCancel={onClose}
          />
        </PanelBody>
      </Panel>
    </Overlay>
  );
}

// ─── Estilização ────────────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
`;

const Panel = styled.div`
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: #141418;
  border: 1px solid ${BORDER_STRONG};
  border-radius: 20px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.55);
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid ${BORDER};
  flex-shrink: 0;
`;

const PanelTitle = styled.h2`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: ${TEXT};
`;

const CloseBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.06);
  color: ${MUTED2};
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.11);
  }
`;

const PanelBody = styled.div`
  padding: 20px;
  overflow-y: auto;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FieldRow = styled.div`
  display: flex;
  gap: 12px;
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const FieldLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${MUTED2};
`;

export const FieldInput = styled.input`
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid ${BORDER};
  border-radius: 10px;
  padding: 9px 12px;
  color: ${TEXT};
  font-size: 13.5px;
  outline: none;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;

  &::placeholder {
    color: ${MUTED};
  }

  &:focus {
    border-color: ${ACCENT}70;
    box-shadow: 0 0 0 3px ${ACCENT_GLOW};
  }
`;

const ColumnList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
`;

const ColumnRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const KeepCardsLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: ${MUTED2};
  white-space: nowrap;
`;

const RemoveColumnBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.06);
  color: ${MUTED2};
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: rgba(251, 113, 133, 0.16);
    color: ${RED};
  }
`;

const AddColumnBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  align-self: flex-start;
  background: none;
  border: none;
  cursor: pointer;
  color: ${ACCENT_SOFT};
  font-size: 12.5px;
  font-weight: 600;
  padding: 4px 0;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
`;

const CancelBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${MUTED};
  font-size: 13px;
  padding: 10px 4px;
`;

const SubmitBtn = styled.button`
  background: ${ACCENT_GRAD};
  color: #0a0a0d;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 18px ${ACCENT_GLOW};

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;
