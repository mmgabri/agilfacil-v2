import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styled from 'styled-components';
import { MdClose, MdOutlineRemoveCircleOutline, MdKeyboardArrowDown } from 'react-icons/md';
import { IoIosAddCircleOutline } from 'react-icons/io';
import { emitMessage, onGetToken } from '../../services/utils';
import { createBoard } from '../../services/boardService';
import logger from '../../services/logger';
import { COLUMN_COLOR_PALETTE } from './columnColorPalette';

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

const DEFAULT_COLUMN_COLOR = '#F0E68C';

// ─── Cor automática por título da coluna ──────────────────────────────────────
// Heurística por palavra-chave (sem IA): cobre os templates de retro mais comuns
// (Start/Stop/Continue, Mad/Sad/Glad, 4Ls, PDCA). Enquanto a coluna estiver no
// modo "auto" (padrão), a cor é recalculada a cada letra digitada no título.
// O usuário pode escolher uma cor manualmente no menu de cores — a partir daí
// ela fica travada, mesmo que o título mude.

const normalize = (s) => (s || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase();

const TITLE_COLOR_RULES = [
  {
    color: '#3B82F6', // azul-royal — elogios, aprendizados
    keywords: ['elogio', 'aprendizado', 'licao aprendida', 'licoes aprendidas', 'reconhecimento', 'agradecimento', 'parabens', 'gostaria de elogiar'],
  },
  {
    color: '#38BDF8', // céu — o que foi bem
    keywords: ['o que foi bom', 'o que foi bem', 'pontos positivos', 'positivo', 'funcionou bem', 'glad', 'continuar fazendo', 'manter', 'keep'],
  },
  {
    color: '#F3E5AB', // vanila — o que não foi bem
    keywords: ['o que nao foi bom', 'o que nao foi bem', 'o que pode melhorar', 'pontos negativos', 'negativo', 'nao funcionou', 'sad', 'mad', 'parar de fazer', 'dificuldades', 'problemas', 'stop'],
  },
  {
    color: '#8B7CF6', // roxo — plano de ação / PDCA / melhoria contínua
    keywords: ['plano de acao', 'pdca', 'melhoria continua', 'acao', 'proximos passos', 'action items', 'tarefas', 'to-do', 'todo'],
  },
];

const inferColumnColor = (title) => {
  const norm = normalize(title);
  if (!norm.trim()) return null;
  const rule = TITLE_COLOR_RULES.find(r => r.keywords.some(kw => norm.includes(kw)));
  return rule?.color || null;
};

// Cor fixa por posição de coluna — vale tanto pra board novo quanto pra
// clonagem, enquanto a regra estiver "ativa" (hoje, 09/08/2026, ou antes).
// A partir de 10/08/2026: board novo volta a usar a cor padrão/automática
// por título; clonagem passa a manter a cor que já vem do banco.
const LEGACY_COLUMN_COLORS = ['#3B82F6', '#60A5FA', '#81A1C1', '#8B7CF6', '#38BDF8', '#A1A1AA'];
const LEGACY_COLOR_CUTOFF = new Date('2026-08-10T00:00:00');

const isLegacyColorRuleActive = () => new Date() < LEGACY_COLOR_CUTOFF;

const colorForColumnIndex = (index) =>
  (isLegacyColorRuleActive() && index < LEGACY_COLUMN_COLORS.length)
    ? LEGACY_COLUMN_COLORS[index]
    : DEFAULT_COLUMN_COLOR;

const resolveClonedColumnColor = (column, index, isLegacyBoard) =>
  (isLegacyBoard && index < LEGACY_COLUMN_COLORS.length)
    ? LEGACY_COLUMN_COLORS[index]
    : column.colorCards;

const emptyColumn = (index = 0) => ({
  id: uuidv4(), title: '', colorCards: colorForColumnIndex(index), columnType: 'auto', isObfuscated: false, cards: [],
});

// Ao clonar um board existente, define a cor inicial de cada coluna pela
// regra acima. Fica em modo "auto": se o usuário editar o título depois,
// a cor pode ser recalculada por palavra-chave normalmente, e o usuário
// sempre pode trocar a cor manualmente no menu.
const buildInitialFormData = (initialBoard) => {
  if (!initialBoard) {
    return {
      boardName: '',
      areaName: '',
      squadName: '',
      columns: [emptyColumn()],
    };
  }

  const isLegacyBoard = !!initialBoard.createdAt && new Date(initialBoard.createdAt) < LEGACY_COLOR_CUTOFF;

  return {
    boardName: initialBoard.boardName,
    areaName: initialBoard.areaName,
    squadName: initialBoard.squadName,
    columns: initialBoard.columns.map((column, index) => ({
      ...column,
      cards: [],
      columnType: 'auto',
      colorCards: resolveClonedColumnColor(column, index, isLegacyBoard),
    })),
  };
};

// ─── Formulário (reutilizável no modal e na página cheia) ─────────────────────

// ─── Menu de cores da coluna (dot clicável + popover com a paleta) ────────────

function ColumnColorPicker({ color, isAuto, onSelect, onAuto }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <ColorPickerWrapper ref={ref}>
      <ColorPickerTrigger
        type="button"
        $open={open}
        title={isAuto ? 'Cor automática — clique pra escolher manualmente' : 'Cor da coluna — clique pra trocar'}
        onClick={() => setOpen(v => !v)}
      >
        <ColumnColorDot style={{ background: color }} />
        <MdKeyboardArrowDown size={13} />
      </ColorPickerTrigger>
      {open && (
        <ColorPickerPanel>
          <ColorPickerAutoBtn $active={isAuto} onClick={() => { onAuto(); setOpen(false); }}>
            Automático (pelo título)
          </ColorPickerAutoBtn>
          <ColorSwatchGrid>
            {COLUMN_COLOR_PALETTE.map(swatch => (
              <ColorSwatch
                key={swatch.color}
                type="button"
                title={swatch.name}
                $selected={!isAuto && swatch.color === color}
                style={{ background: swatch.color }}
                onClick={() => { onSelect(swatch.color); setOpen(false); }}
              />
            ))}
          </ColorSwatchGrid>
        </ColorPickerPanel>
      )}
    </ColorPickerWrapper>
  );
}

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
      columns: prev.columns.map(column => {
        if (column.id !== columnId) return column;
        // Só recalcula a cor automaticamente se a coluna ainda estiver no
        // modo "auto" — se o usuário já escolheu uma cor manualmente, o
        // título pode mudar à vontade sem mexer na cor.
        if (column.columnType !== 'auto') return { ...column, title: value };
        const inferredColor = inferColumnColor(value);
        return { ...column, title: value, colorCards: inferredColor || column.colorCards };
      }),
    }));
  };

  // Escolha manual de cor no menu de cores — trava a cor até o usuário voltar
  // pro modo "Automático".
  const handleColumnColorSelect = (columnId, color) => {
    setFormData(prev => ({
      ...prev,
      columns: prev.columns.map(column =>
        column.id === columnId ? { ...column, columnType: 'manual', colorCards: color } : column),
    }));
  };

  const handleColumnColorAuto = (columnId) => {
    setFormData(prev => ({
      ...prev,
      columns: prev.columns.map(column => {
        if (column.id !== columnId) return column;
        const inferredColor = inferColumnColor(column.title);
        return { ...column, columnType: 'auto', colorCards: inferredColor || column.colorCards };
      }),
    }));
  };

  const handleAddColumn = () => {
    setFormData(prev => ({ ...prev, columns: [...prev.columns, emptyColumn(prev.columns.length)] }));
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
        // columnType é só um controle de UI (auto vs. tipo fixo) — não faz
        // parte do modelo persistido do board.
        columns: formData.columns.map(({ columnType, ...column }) => column),
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
              <ColumnColorPicker
                color={column.colorCards}
                isAuto={column.columnType === 'auto'}
                onSelect={(color) => handleColumnColorSelect(column.id, color)}
                onAuto={() => handleColumnColorAuto(column.id)}
              />
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

const ColorPickerTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  padding: 5px 6px;
  border-radius: 20px;
  cursor: pointer;
  background: ${({ $open }) => ($open ? 'rgba(139,124,246,0.14)' : 'rgba(255,255,255,0.045)')};
  border: 1px solid ${({ $open }) => ($open ? `${ACCENT}50` : BORDER)};
  color: ${MUTED2};
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: rgba(139, 124, 246, 0.14);
    border-color: ${ACCENT}50;
  }
`;

const ColumnColorDot = styled.span`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1.5px solid ${BORDER_STRONG};
  transition: background 0.2s ease;
`;

const ColorPickerWrapper = styled.div`
  position: relative;
  flex-shrink: 0;
`;

const ColorPickerPanel = styled.div`
  position: absolute;
  left: 0;
  top: 100%;
  margin-top: 8px;
  width: 240px;
  padding: 8px;
  border-radius: 12px;
  background: #141418;
  border: 1px solid ${BORDER_STRONG};
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.55);
  z-index: 50;
`;

const ColorPickerAutoBtn = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 7px 8px;
  margin-bottom: 6px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid ${({ $active }) => ($active ? `${ACCENT}50` : 'transparent')};
  background: ${({ $active }) => ($active ? ACCENT_GLOW : 'rgba(255,255,255,0.05)')};
  color: ${({ $active }) => ($active ? ACCENT_SOFT : MUTED2)};
`;

const ColorSwatchGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 160px;
  overflow-y: auto;
  padding: 2px;
`;

const ColorSwatch = styled.button`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  cursor: pointer;
  border: ${({ $selected }) => ($selected ? '2px solid #fff' : `1px solid ${BORDER_STRONG}`)};
  box-shadow: ${({ $selected }) => ($selected ? `0 0 0 2px ${ACCENT_GLOW}` : 'none')};
  transition: transform 0.15s ease;

  &:hover {
    transform: scale(1.15);
  }
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
