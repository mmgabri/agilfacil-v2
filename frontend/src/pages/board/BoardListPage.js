import React, { useEffect, useMemo, useRef, useState } from 'react';
import { emitMessage, onSignOut, onGetToken } from '../../services/utils'
import { getBoard, getBoardByUser, deleteBoard } from '../../services/boardService'
import { getCurrentUser, fetchUserAttributes, fetchAuthSession } from '@aws-amplify/auth';
import { useAppUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom'
import { FaRegTrashAlt, FaRegFolderOpen, FaRegClone } from 'react-icons/fa';
import { FaPlus, FaMagnifyingGlass } from 'react-icons/fa6';
import { AiOutlineExport } from "react-icons/ai";
import { BsCalendar3 } from "react-icons/bs";
import { MdKeyboardArrowDown, MdChevronLeft, MdChevronRight, MdClose, MdSpaceDashboard } from "react-icons/md";
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import styled from 'styled-components';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CreateBoardModal from './CreateBoardModal';
import { FRONT_BASE_URL } from "../../constants/apiConstants";
import LoaderPage from '../generic/LoaderPage';
import SuggestionForm from '../components/SuggestionForm'
import SupportForm from '../components/SupportForm'
import { confirmDialog } from '../components/ConfirmDialog';
import localStorageService from "../../services/localStorageService";
import { getPaletteColor } from './columnColorPalette';

// ─── Design tokens — "Dark Premium" ───────────────────────────────────────────
// Mesmo sistema visual do Header / BoardPageMock.js / BoardListPageMock.js.

const TEXT         = 'var(--text)';
const MUTED        = 'var(--muted)';
const MUTED2       = 'var(--muted2)';
const BORDER       = 'var(--border)';
const BORDER_STRONG = 'var(--border-strong)';
const ACCENT_SOFT   = 'var(--accent-soft)';
const ACCENT_GLOW   = 'var(--accent-glow)';
const ACCENT_BORDER = 'var(--accent-border)';
const ACCENT_GRAD   = 'var(--accent-grad)';

// Vem da mesma paleta das colunas (columnColorPalette.js) — evita manter uma
// segunda lista de cores hardcoded que fica desatualizada quando a paleta muda.
const CARD_ACCENTS = ['esmeralda', 'rosa', 'ceu', 'ambar-forte', 'violeta'].map(getPaletteColor);
// Hex fixo (não variável de tema) — é concatenado com sufixo de opacidade
// (ex: `${accent}1f`) no card, então precisa ser um hex "puro". Cinza médio
// funciona razoável nos dois temas (clareia em cima de fundo escuro, escurece
// em cima de fundo claro, já que é usado sempre com opacidade baixa).
const NO_SQUAD_ACCENT = '#8a8a93';
const normalizeSquad = (s) => (s || '').trim().toLowerCase();

const tooltipStyle = { fontSize: '12px', fontWeight: 600, padding: '5px 10px', borderRadius: '8px', zIndex: 1001 };

// ─── Helpers de data ──────────────────────────────────────────────────────────

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MONTH_NAMES_FULL = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const sameDay = (a, b) => !!a && !!b && a.toDateString() === b.toDateString();
const formatShort = (d) => `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}`;
const formatDate = (d) => `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

function buildCalendarDays(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  return days;
}

function matchesRange(date, range) {
  if (!range.start || !date || isNaN(date.getTime())) return !range.start;
  const d = startOfDay(date).getTime();
  const start = startOfDay(range.start).getTime();
  const end = range.end ? startOfDay(range.end).getTime() : start;
  return d >= start && d <= end;
}

const BoardListPage = () => {
  let navigate = useNavigate();
  const { userId: contextUserId, userName: contextUserName } = useAppUser();
  const [boards, setBoards] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSupportModalOpen, setSupportModalOpen] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState({});
  const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);
  const [createModal, setCreateModal] = useState({ open: false, board: null });

  const [nameQuery, setNameQuery] = useState('');
  const [squadFilter, setSquadFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  useEffect(() => {

    const checkAuth = async () => {
      try {
        const session = await fetchAuthSession();
        if (session.tokens == undefined) {
          setUserIsAuthenticated(false)
        } else {
          setUserIsAuthenticated(true)
        }
      } catch (error) {
        setUserIsAuthenticated(false)
      }
    }

    const fetchBoards = async () => {
      try {
        const user = await getCurrentUser();
        const attributes = await fetchUserAttributes(user);
        // Usa o userId do contexto (pode ser o legado de migração) com fallback para o sub do Cognito
        const effectiveUserId = contextUserId || attributes.sub;
        const effectiveName   = contextUserName || attributes.name;
        const userData    = { userId: effectiveUserId, userName: effectiveName, isVerified: true };
        const userStorage = { userId: effectiveUserId, userName: effectiveName };
        setUserAuthenticated(userData)

        localStorageService.removeItem("AGILFACIL_USER_LOGGED");
        localStorageService.setItem("AGILFACIL_USER_LOGGED", userStorage);

        // Obtem Board do Usuário Logado
        const token = await onGetToken()

        getBoardByUser(effectiveUserId, token)
          .then(data => {
            setBoards(data);
            setIsLoading(false);
          })
          .catch((error) => {
            setIsLoading(false);
            emitMessage('error', 999, 3000)
          });
      } catch (error) {
        emitMessage('error', 999, 4000)
      }
    };

    fetchBoards();
    checkAuth();
  }, []);

  const handleDelete = async (id) => {
    const isConfirmed = await confirmDialog("Confirma exclusão do Board?", { title: 'Excluir board' });
    if (!isConfirmed) {
      return
    }
    const token = await onGetToken()
    setIsLoading(true)
    try {
      await deleteBoard(id, token)
      emitMessage('success', 1, 1500)
      setIsLoading(false)
      setBoards((prevBoards) => prevBoards.filter(board => board.boardId !== id));
    } catch (error) {
      emitMessage('error', 901, 3000)
      setIsLoading(false)
    }
  };

  const handleOpenBoard = async (boardId) => {
    try {
      setIsLoading(true)
      const boardData = await getBoard(boardId)
      setIsLoading(false)
      const userData = { ...userAuthenticated, isBoardCreator: true };
      navigate('/board', { state: { boardData, userAuthenticated: userData } });
    } catch (error) {
      setIsLoading(false)
      emitMessage('error', 902, 3000)
    }
  }

  const handleCreateBoard = () => {
    setCreateModal({ open: true, board: null });
  };

  const handleCloneBoard = async (boardId) => {
    setIsLoading(true)
    try {
      const board = await getBoard(boardId)
      setIsLoading(false)
      setCreateModal({ open: true, board });
    } catch (error) {
      emitMessage('error', 903, 3000)
      setIsLoading(false)
    }
  }

  const handleBoardCreated = (boardData) => {
    setCreateModal({ open: false, board: null });
    const userData = { ...userAuthenticated, isBoardCreator: true };
    navigate('/board', { state: { boardData, userAuthenticated: userData } });
  };

  const handleExportBoardToPDF = async (boardId) => {
    const url = `${FRONT_BASE_URL}/board/export/${boardId}`;
    window.open(url, "_blank");

  }

  const squadOptions = useMemo(() => {
    const byNormalized = new Map();
    (boards || []).forEach(b => {
      const norm = normalizeSquad(b.squadName);
      if (norm && !byNormalized.has(norm)) byNormalized.set(norm, b.squadName.trim());
    });
    return [{ label: 'Todas', value: 'all' }, ...Array.from(byNormalized, ([norm, label]) => ({ label, value: norm }))];
  }, [boards]);

  // Cor fixa por squad (não por posição na tela) — assim o board mantém a
  // mesma cor independente da ordem/filtro aplicado. Comparação normalizada
  // (trim + lowercase) pra "Squad 1" e "squad 1" caírem na mesma cor.
  const squadColorMap = useMemo(() => {
    const uniqueSquads = Array.from(new Set((boards || []).map(b => normalizeSquad(b.squadName)).filter(Boolean)));
    const map = new Map();
    uniqueSquads.forEach((squad, i) => map.set(squad, CARD_ACCENTS[i % CARD_ACCENTS.length]));
    return map;
  }, [boards]);

  const filteredBoards = useMemo(() => {
    if (!boards) return [];
    const query = nameQuery.trim().toLowerCase();
    return boards.filter(b =>
      (query === '' || (b.boardName || '').toLowerCase().includes(query)) &&
      (squadFilter === 'all' || normalizeSquad(b.squadName) === squadFilter) &&
      matchesRange(b.createdAt ? new Date(b.createdAt) : null, dateRange)
    );
  }, [boards, nameQuery, squadFilter, dateRange]);

  const hasActiveFilters = nameQuery.trim() !== '' || squadFilter !== 'all' || !!dateRange.start;

  return (
    <PageBackground>
      <AmbientGlow />

      <Header
        subText={'Meus boards'}
        badgeCount={boards ? boards.length : undefined}
        isUserLogged={userIsAuthenticated}
        signIn={() => navigate('/login')}
        signOut={onSignOut}
        goHome={() => navigate('/')}
        hasSidebar />

      <Layout>
        <Sidebar onSuggestions={() => setModalOpen(true)} onSupport={() => setSupportModalOpen(true)} />

        <Content>
          {isLoading ? (
            <LoaderPage />
          ) : !boards ? (
            <EmptyMessage>Não foi possível carregar os seus Boards.</EmptyMessage>
          ) : (
            <>
              <FilterBar>
                <SearchBox $active={nameQuery !== ''}>
                  <FaMagnifyingGlass size={11} style={{ color: nameQuery ? ACCENT_SOFT : MUTED, flexShrink: 0 }} />
                  <SearchInput
                    value={nameQuery}
                    onChange={e => setNameQuery(e.target.value)}
                    placeholder="Buscar por nome..."
                  />
                  {nameQuery && (
                    <ClearSearchBtn onClick={() => setNameQuery('')}>
                      <MdClose size={13} />
                    </ClearSearchBtn>
                  )}
                </SearchBox>

                <FilterDropdown label="Squad" value={squadFilter} options={squadOptions} onChange={setSquadFilter} />
                <DateRangeFilter range={dateRange} onChange={setDateRange} />

                {hasActiveFilters && (
                  <ClearFiltersBtn onClick={() => { setNameQuery(''); setSquadFilter('all'); setDateRange({ start: null, end: null }); }}>
                    Limpar filtros
                  </ClearFiltersBtn>
                )}

                <ResultCount>{filteredBoards.length} de {boards.length} boards</ResultCount>
              </FilterBar>

              <Grid>
                <AddTile onClick={handleCreateBoard}>
                  <AddTileIcon><FaPlus size={16} /></AddTileIcon>
                  <AddTileLabel>Adicionar board</AddTileLabel>
                </AddTile>

                {filteredBoards.map((board) => (
                  <BoardCard
                    key={board.boardId}
                    board={board}
                    accent={squadColorMap.get(normalizeSquad(board.squadName)) || NO_SQUAD_ACCENT}
                    onOpen={() => handleOpenBoard(board.boardId)}
                    onDelete={() => handleDelete(board.boardId)}
                    onClone={() => handleCloneBoard(board.boardId)}
                    onExport={() => handleExportBoardToPDF(board.boardId)}
                  />
                ))}
              </Grid>

              {filteredBoards.length === 0 && (
                <EmptyMessage>
                  {boards.length === 0 ? 'Você ainda não possui Boards.' : 'Nenhum board encontrado com esses filtros.'}
                </EmptyMessage>
              )}

              <Tooltip id="board-card-tooltip" style={tooltipStyle} />
            </>
          )}
        </Content>
      </Layout>

      {isModalOpen && <SuggestionForm onClose={() => setModalOpen(false)} />}
      {isSupportModalOpen && <SupportForm onClose={() => setSupportModalOpen(false)} />}

      <CreateBoardModal
        isOpen={createModal.open}
        initialBoard={createModal.board}
        userAuthenticated={userAuthenticated}
        onClose={() => setCreateModal({ open: false, board: null })}
        onCreated={handleBoardCreated}
      />
    </PageBackground>
  );
};

// ─── Dropdown de filtro (Squad) ────────────────────────────────────────────────

function FilterDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = options.find(o => o.value === value)?.label;

  return (
    <DropdownWrapper ref={ref}>
      <DropdownButton $active={open || value !== 'all'} onClick={() => setOpen(v => !v)}>
        <DropdownLabelPart $active={open || value !== 'all'}>{label}:</DropdownLabelPart>
        <b>{current}</b>
        <MdKeyboardArrowDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
      </DropdownButton>

      {open && (
        <DropdownPanel style={{ minWidth: 170 }}>
          {options.map(opt => (
            <DropdownItem key={opt.value} $active={opt.value === value} onClick={() => { onChange(opt.value); setOpen(false); }}>
              {opt.label}
            </DropdownItem>
          ))}
        </DropdownPanel>
      )}
    </DropdownWrapper>
  );
}

// ─── Filtro de período (calendário com seleção de data/range) ─────────────────

function DateRangeFilter({ range, onChange }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => range.start || new Date());
  const [draft, setDraft] = useState(range);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openMenu = () => {
    setDraft(range);
    setViewDate(range.start || new Date());
    setOpen(v => !v);
  };

  const handleDayClick = (day) => {
    if (!draft.start || draft.end) {
      setDraft({ start: day, end: null });
    } else if (day < draft.start) {
      setDraft({ start: day, end: draft.start });
    } else {
      setDraft({ start: draft.start, end: day });
    }
  };

  const applyPreset = (days) => {
    const end = startOfDay(new Date());
    const start = startOfDay(daysAgo(days));
    setDraft({ start, end });
    setViewDate(start);
  };

  const applyThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    setDraft({ start, end: startOfDay(now) });
    setViewDate(start);
  };

  const handleApply = () => { onChange(draft); setOpen(false); };
  const handleClear = () => { const empty = { start: null, end: null }; setDraft(empty); onChange(empty); setOpen(false); };

  const label = !range.start
    ? 'Todo período'
    : (!range.end || sameDay(range.start, range.end))
      ? formatShort(range.start)
      : `${formatShort(range.start)} – ${formatShort(range.end)}`;

  const active = !!range.start;
  const days = buildCalendarDays(viewDate);
  const today = startOfDay(new Date());

  return (
    <DropdownWrapper ref={ref}>
      <DropdownButton $active={open || active} onClick={openMenu}>
        <BsCalendar3 size={11} />
        <DropdownLabelPart $active={open || active}>Período:</DropdownLabelPart>
        <b>{label}</b>
        <MdKeyboardArrowDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
      </DropdownButton>

      {open && (
        <DropdownPanel style={{ width: 260, padding: 0 }}>
          <CalendarPresetsRow>
            <CalendarPresetBtn onClick={() => applyPreset(7)}>7 dias</CalendarPresetBtn>
            <CalendarPresetBtn onClick={() => applyPreset(30)}>30 dias</CalendarPresetBtn>
            <CalendarPresetBtn onClick={applyThisMonth}>Este mês</CalendarPresetBtn>
          </CalendarPresetsRow>

          <CalendarNav>
            <CalendarNavBtn onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>
              <MdChevronLeft size={16} />
            </CalendarNavBtn>
            <CalendarMonthLabel>{MONTH_NAMES_FULL[viewDate.getMonth()]} {viewDate.getFullYear()}</CalendarMonthLabel>
            <CalendarNavBtn onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>
              <MdChevronRight size={16} />
            </CalendarNavBtn>
          </CalendarNav>

          <WeekdaysRow>
            {WEEKDAYS.map((w, i) => <WeekdayLabel key={i}>{w}</WeekdayLabel>)}
          </WeekdaysRow>

          <DaysGrid>
            {days.map((day, i) => {
              if (!day) return <span key={i} />;
              const isStart = sameDay(day, draft.start);
              const isEnd = sameDay(day, draft.end);
              const inRange = draft.start && draft.end && day > draft.start && day < draft.end;
              const isToday = sameDay(day, today);
              return (
                <DayBtn key={i} $edge={isStart || isEnd} $inRange={inRange} $today={isToday} onClick={() => handleDayClick(day)}>
                  {day.getDate()}
                </DayBtn>
              );
            })}
          </DaysGrid>

          <CalendarFooter>
            <CalendarClearBtn onClick={handleClear}>Limpar</CalendarClearBtn>
            <CalendarApplyBtn onClick={handleApply}>Aplicar</CalendarApplyBtn>
          </CalendarFooter>
        </DropdownPanel>
      )}
    </DropdownWrapper>
  );
}

// ─── Card de board ─────────────────────────────────────────────────────────────

function BoardCard({ board, accent, onOpen, onDelete, onClone, onExport }) {
  const createdAtDate = board.createdAt ? new Date(board.createdAt) : null;

  return (
    <CardEl onClick={onOpen}>
      <AccentLine style={{ background: `linear-gradient(90deg, ${accent}, transparent 85%)` }} />

      <CardHeaderRow>
        <CardIconBadge style={{ background: `${accent}1f`, borderColor: `${accent}55` }}>
          <MdSpaceDashboard size={19} style={{ color: accent }} />
        </CardIconBadge>
        <CardTitleGroup>
          <CardTitle>{board.boardName}</CardTitle>
          {(board.squadName || board.areaName) && (
            <CardSubtitle>
              {board.squadName}{board.squadName && board.areaName && <span style={{ color: MUTED }}> · {board.areaName}</span>}
            </CardSubtitle>
          )}
        </CardTitleGroup>
      </CardHeaderRow>

      {createdAtDate && !isNaN(createdAtDate.getTime()) && (
        <CardMeta>
          <CardMetaRow>
            <BsCalendar3 size={14} style={{ color: MUTED, flexShrink: 0 }} />
            Criado em {formatDate(createdAtDate)}
          </CardMetaRow>
        </CardMeta>
      )}

      <CardActions>
        <ActionIconBtn data-tooltip-id="board-card-tooltip" data-tooltip-content="Excluir" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <FaRegTrashAlt size={14} />
        </ActionIconBtn>
        <ActionIconBtn data-tooltip-id="board-card-tooltip" data-tooltip-content="Clonar" onClick={(e) => { e.stopPropagation(); onClone(); }}>
          <FaRegClone size={14} />
        </ActionIconBtn>
        <ActionIconBtn data-tooltip-id="board-card-tooltip" data-tooltip-content="Exportar" onClick={(e) => { e.stopPropagation(); onExport(); }}>
          <AiOutlineExport size={15} />
        </ActionIconBtn>
        <ActionIconBtn data-tooltip-id="board-card-tooltip" data-tooltip-content="Abrir" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
          <FaRegFolderOpen size={14} />
        </ActionIconBtn>
      </CardActions>
    </CardEl>
  );
}

export default BoardListPage;

// ─── Estilização ────────────────────────────────────────────────────────────────

const PageBackground = styled.div`
  position: relative;
  min-height: 100vh;
  background: var(--bg);
`;

const AmbientGlow = styled.div`
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(1100px 480px at 50% -8%, ${ACCENT_GLOW}, transparent 65%);
`;

const Layout = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-start;
`;

const Content = styled.div`
  flex: 1;
  min-width: 0;
  padding: 20px 24px 32px;
`;

const EmptyMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  color: ${MUTED};
  font-size: 13px;
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background: ${({ $active }) => ($active ? ACCENT_GLOW : 'var(--surface)')};
  border: 1px solid ${({ $active }) => ($active ? ACCENT_BORDER : BORDER)};
`;

const SearchInput = styled.input`
  background: none;
  border: none;
  outline: none;
  color: ${TEXT};
  font-size: 13px;
  width: 150px;
`;

const ClearSearchBtn = styled.button`
  display: flex;
  background: none;
  border: none;
  cursor: pointer;
  color: ${MUTED};
`;

const DropdownWrapper = styled.div`
  position: relative;
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  color: ${({ $active }) => ($active ? ACCENT_SOFT : MUTED2)};
  background: ${({ $active }) => ($active ? ACCENT_GLOW : 'var(--surface)')};
  border: 1px solid ${({ $active }) => ($active ? ACCENT_BORDER : BORDER)};
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
`;

const DropdownLabelPart = styled.span`
  color: ${({ $active }) => ($active ? ACCENT_SOFT : MUTED)};
  font-weight: 400;
`;

const DropdownPanel = styled.div`
  position: absolute;
  left: 0;
  top: 100%;
  margin-top: 8px;
  border-radius: 12px;
  overflow: hidden;
  background: var(--panel);
  border: 1px solid ${BORDER_STRONG};
  z-index: 50;
  box-shadow: var(--shadow-strong);
  padding: 4px;
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 14px;
  font-size: 12.5px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: ${({ $active }) => ($active ? ACCENT_SOFT : MUTED2)};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};

  &:hover {
    background: var(--surface-hover);
  }
`;

const ClearFiltersBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${MUTED};
  font-size: 12.5px;
`;

const ResultCount = styled.span`
  margin-left: auto;
  color: ${MUTED};
  font-size: 12px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(292px, 1fr));
  gap: 20px;
`;

const AddTile = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 196px;
  border-radius: 18px;
  border: 1.5px dashed ${BORDER_STRONG};
  background: transparent;
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.2s ease;

  &:hover {
    border-color: ${ACCENT_BORDER};
    background: ${ACCENT_GLOW};
    transform: translateY(-2px);
  }
`;

const AddTileIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: ${ACCENT_GLOW};
  color: ${ACCENT_SOFT};
  transition: background 0.18s ease, color 0.18s ease;

  ${AddTile}:hover & {
    background: ${ACCENT_GRAD};
    color: var(--on-accent);
  }
`;

const AddTileLabel = styled.span`
  font-size: 13.5px;
  font-weight: 600;
  color: ${MUTED2};

  ${AddTile}:hover & {
    color: ${ACCENT_SOFT};
  }
`;

const AccentLine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
`;

const CardEl = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 196px;
  padding: 22px;
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  background: var(--surface);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border: 1px solid ${BORDER};
  box-shadow: var(--shadow-soft);
  transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    background: var(--surface-hover);
    border-color: ${BORDER_STRONG};
    box-shadow: var(--shadow-strong);
    transform: translateY(-2px);
  }
`;

const CardHeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 16px;
`;

const CardIconBadge = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid;
  flex-shrink: 0;
`;

const CardTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const CardTitle = styled.h3`
  font-size: 15.5px;
  font-weight: 700;
  line-height: 1.3;
  color: ${TEXT};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const CardSubtitle = styled.span`
  font-size: 12.5px;
  color: ${MUTED2};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

const CardMetaRow = styled.span`
  display: flex;
  align-items: center;
  gap: 7px;
  color: ${MUTED2};
  font-size: 12.5px;
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${BORDER};
`;

const ActionIconBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  border: none;
  cursor: pointer;
  background: var(--surface-hover);
  color: ${MUTED2};
  transition: background 0.15s ease, color 0.15s ease;

  &:hover {
    background: ${ACCENT_GLOW};
    color: ${ACCENT_SOFT};
  }
`;

// ─── Estilização do calendário (filtro de período) ─────────────────────────────

const CalendarPresetsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px;
  border-bottom: 1px solid ${BORDER};
`;

const CalendarPresetBtn = styled.button`
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
  background: var(--surface-hover);
  border: none;
  cursor: pointer;
  color: ${MUTED2};
`;

const CalendarNav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px 0;
`;

const CalendarNavBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${MUTED2};
`;

const CalendarMonthLabel = styled.span`
  color: ${TEXT};
  font-size: 12.5px;
  font-weight: 600;
`;

const WeekdaysRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 8px 12px 0;
`;

const WeekdayLabel = styled.span`
  text-align: center;
  font-size: 10px;
  color: ${MUTED};
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 4px;
  padding: 4px 12px 12px;
`;

const DayBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid ${({ $today, $edge }) => ($today && !$edge ? ACCENT_BORDER : 'transparent')};
  background: ${({ $edge, $inRange }) => ($edge ? ACCENT_GRAD : $inRange ? ACCENT_GLOW : 'transparent')};
  color: ${({ $edge, $inRange }) => ($edge ? 'var(--on-accent)' : $inRange ? ACCENT_SOFT : TEXT)};
  font-weight: ${({ $edge }) => ($edge ? 700 : 400)};
`;

const CalendarFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-top: 1px solid ${BORDER};
`;

const CalendarClearBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${MUTED};
  font-size: 12px;
`;

const CalendarApplyBtn = styled.button`
  background: ${ACCENT_GRAD};
  color: var(--on-accent);
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;
