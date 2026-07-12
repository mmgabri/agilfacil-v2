import React, { useState, useRef, useEffect, useMemo } from "react";
import { FaPlus, FaMagnifyingGlass } from "react-icons/fa6";
import { FaRegTrashAlt, FaRegFolderOpen, FaRegClone } from "react-icons/fa";
import { AiOutlineExport } from "react-icons/ai";
import { MdSpaceDashboard, MdSettings, MdHome, MdStyle, MdLogin, MdLogout, MdKeyboardArrowDown, MdChevronLeft, MdChevronRight, MdClose } from "react-icons/md";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { BsCalendar3 } from "react-icons/bs";
import Logo from '../../images/favicon.ico';

// ─── Design tokens — "Dark Premium" ───────────────────────────────────────────
// Mesmo sistema visual do BoardPageMock.js — mantém a identidade entre telas.

const BG          = "#0a0a0d";
const SIDEBAR_BG  = "rgba(255,255,255,0.025)";
const HEADER_BG   = "rgba(20,20,24,0.75)";

const BORDER        = "rgba(255,255,255,0.07)";
const BORDER_STRONG = "rgba(255,255,255,0.14)";

const TEXT   = "#f5f5f7";
const MUTED  = "rgba(245,245,247,0.42)";
const MUTED2 = "rgba(245,245,247,0.62)";

const ACCENT       = "#8b7cf6";
const ACCENT_SOFT  = "#a996ff";
const ACCENT_GLOW  = "rgba(139,124,246,0.18)";
const ACCENT_GRAD  = "linear-gradient(135deg, #9a8bfb 0%, #7c6cf0 100%)";

const GREEN = "#34d399";
const RED   = "#fb7185";

// ─── Dados fictícios ──────────────────────────────────────────────────────────

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const formatDate = (d) => `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

const MOCK_BOARDS = [
  { id: "b1", name: "Retrospectiva Q3 2025",      squad: "Squad Falcão", area: "Engenharia", createdAt: daysAgo(1),  accent: "#34d399" },
  { id: "b2", name: "Planning Sprint 42",         squad: "Squad Aurora", area: "Produto",    createdAt: daysAgo(5),  accent: "#fb7185" },
  { id: "b3", name: "Brainstorm Onboarding",      squad: "Squad Nimbus", area: "Design",     createdAt: daysAgo(12), accent: "#38bdf8" },
  { id: "b4", name: "Retro Time — Junho",         squad: "Squad Falcão", area: "Engenharia", createdAt: daysAgo(20), accent: "#fbbf24" },
  { id: "b5", name: "Health Check do Time",       squad: "Squad Aurora", area: "Produto",    createdAt: daysAgo(45), accent: "#a78bfa" },
  { id: "b6", name: "Kickoff Projeto Horizonte",  squad: "Squad Nimbus", area: "Design",     createdAt: daysAgo(90), accent: "#34d399" },
];

const SQUAD_OPTIONS = [
  { label: "Todas", value: "all" },
  ...Array.from(new Set(MOCK_BOARDS.map(b => b.squad))).map(s => ({ label: s, value: s })),
];

const MONTH_NAMES_FULL = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const sameDay = (a, b) => !!a && !!b && a.toDateString() === b.toDateString();
const formatShort = (d) => `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]}`;

function buildCalendarDays(viewDate) {
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth   = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
  return days;
}

function matchesRange(date, range) {
  if (!range.start) return true;
  const d     = startOfDay(date).getTime();
  const start = startOfDay(range.start).getTime();
  const end   = range.end ? startOfDay(range.end).getTime() : start;
  return d >= start && d <= end;
}

const MOCK_USER = { name: "Marcelo Gabriel", initials: "MG" };

// ─── Glow ambiente de fundo ─────────────────────────────────────────────────────

function AmbientGlow() {
  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{
        zIndex: 0,
        background: `radial-gradient(1100px 480px at 50% -8%, ${ACCENT_GLOW}, transparent 65%)`,
      }}
    />
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { icon: MdHome,           label: "Início" },
  { icon: MdSpaceDashboard, label: "Boards" },
  { icon: MdStyle,          label: "Poker"  },
];

function Sidebar() {
  const [active, setActive] = useState("Boards");

  return (
    <aside
      className="relative flex flex-col items-center py-3 gap-1 flex-shrink-0 h-full"
      style={{ width: 64, background: SIDEBAR_BG, borderRight: `1px solid ${BORDER}`, zIndex: 10 }}
    >
      {NAV_ITEMS.map(({ icon: Icon, label }) => {
        const isActive = active === label;
        return (
          <button
            key={label}
            onClick={() => setActive(label)}
            title={label}
            className="relative flex flex-col items-center justify-center rounded-2xl w-11 h-11 gap-0.5"
            style={{
              background: isActive ? ACCENT_GLOW : "transparent",
              color:      isActive ? ACCENT_SOFT : MUTED,
              transition: "background 0.18s ease, color 0.18s ease",
            }}
          >
            {isActive && (
              <span
                className="absolute rounded-r-full"
                style={{ left: -13, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, background: ACCENT_GRAD }}
              />
            )}
            <Icon size={17} />
            <span style={{ fontSize: 9, letterSpacing: 0.3, fontWeight: isActive ? 600 : 400 }}>{label}</span>
          </button>
        );
      })}

      <div className="flex-1" />

      <button
        title="Configurações"
        className="flex flex-col items-center justify-center rounded-2xl w-11 h-11 gap-0.5"
        style={{ color: MUTED, transition: "color 0.18s ease" }}
      >
        <MdSettings size={17} />
        <span style={{ fontSize: 9 }}>Config</span>
      </button>
    </aside>
  );
}

// ─── Top bar ──────────────────────────────────────────────────────────────────

function ListTopBar({ boardCount }) {
  const [loggedIn,     setLoggedIn]     = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header
      className="flex items-center justify-between pl-3 pr-4 flex-shrink-0 gap-3"
      style={{
        height: 56,
        background: HEADER_BG,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: `1px solid ${BORDER}`,
        boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset",
        position: "relative",
        zIndex: 100,
      }}
    >
      {/* Esquerda: identidade + título da página */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <img
            src={Logo}
            alt="AgilFácil"
            style={{ width: 22, height: 22, flexShrink: 0, filter: "hue-rotate(30deg) saturate(1.2)" }}
          />
          <span style={{ color: "#ffffff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>AgilFácil</span>
        </div>
        <span style={{ color: MUTED, fontSize: 13, flexShrink: 0 }}>/</span>
        <span className="truncate" style={{ color: TEXT, fontWeight: 700, fontSize: 14.5, letterSpacing: -0.1 }}>
          Meus Boards
        </span>
        <span style={{ color: MUTED, fontSize: 12.5, flexShrink: 0 }}>({boardCount})</span>
      </div>

      {/* Direita: avatar */}
      <div className="flex items-center gap-3.5 flex-shrink-0">

        {loggedIn ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(m => !m)}
              className="relative flex items-center justify-center rounded-full"
              style={{
                width: 32, height: 32,
                background: "rgba(139,124,246,0.20)",
                border: `1.5px solid ${showUserMenu ? ACCENT_SOFT : ACCENT + "55"}`,
                color: ACCENT_SOFT,
                fontWeight: 700,
                fontSize: 11,
                transition: "border-color 0.18s ease",
              }}
            >
              {MOCK_USER.initials}
              <span
                className="absolute bottom-0 right-0 w-2 h-2 rounded-full"
                style={{ background: GREEN, border: "1.5px solid #0a0a0d" }}
              />
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden"
                style={{
                  background: "#141418",
                  border: `1px solid ${BORDER_STRONG}`,
                  minWidth: 180,
                  zIndex: 50,
                  boxShadow: "0 20px 48px rgba(0,0,0,0.55)",
                }}
              >
                <div className="px-4 py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ color: TEXT, fontSize: 13, fontWeight: 600 }}>{MOCK_USER.name}</div>
                  <div style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>marcelomgabriel@gmail.com</div>
                </div>
                <button
                  onClick={() => { setLoggedIn(false); setShowUserMenu(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 hover:bg-white/5"
                  style={{ color: RED, fontSize: 13, transition: "background 0.15s ease" }}
                >
                  <MdLogout size={15} />
                  Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setLoggedIn(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, color: TEXT }}
          >
            <MdLogin size={14} />
            Entrar
          </button>
        )}
      </div>
    </header>
  );
}

// ─── Filtro (dropdown reutilizável) ────────────────────────────────────────────

function FilterDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = options.find(o => o.value === value)?.label;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
        style={{
          background: open || value !== "all" ? ACCENT_GLOW : "rgba(255,255,255,0.035)",
          border:     `1px solid ${open || value !== "all" ? ACCENT + "50" : BORDER}`,
          color:      open || value !== "all" ? ACCENT_SOFT : MUTED2,
          transition: "background 0.15s ease, border-color 0.15s ease, color 0.15s ease",
        }}
      >
        <span style={{ color: open || value !== "all" ? ACCENT_SOFT : MUTED, fontWeight: 400 }}>{label}:</span>
        <b style={{ fontWeight: 600 }}>{current}</b>
        <MdKeyboardArrowDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s ease" }} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-2 rounded-xl overflow-hidden py-1"
          style={{ background: "#141418", border: `1px solid ${BORDER_STRONG}`, minWidth: 170, zIndex: 50, boxShadow: "0 20px 48px rgba(0,0,0,0.55)" }}
        >
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="flex items-center w-full px-3.5 py-2 text-xs hover:bg-white/5"
              style={{ color: opt.value === value ? ACCENT_SOFT : MUTED2, fontWeight: opt.value === value ? 600 : 400 }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Filtro de período (calendário com seleção de data/range) ─────────────────

function DateRangeFilter({ range, onChange }) {
  const [open, setOpen]         = useState(false);
  const [viewDate, setViewDate] = useState(() => range.start || new Date());
  const [draft, setDraft]       = useState(range);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    const end   = startOfDay(new Date());
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
    ? "Todo período"
    : (!range.end || sameDay(range.start, range.end))
      ? formatShort(range.start)
      : `${formatShort(range.start)} – ${formatShort(range.end)}`;

  const active = !!range.start;
  const days = buildCalendarDays(viewDate);
  const today = startOfDay(new Date());

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={openMenu}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
        style={{
          background: open || active ? ACCENT_GLOW : "rgba(255,255,255,0.035)",
          border:     `1px solid ${open || active ? ACCENT + "50" : BORDER}`,
          color:      open || active ? ACCENT_SOFT : MUTED2,
          transition: "background 0.15s ease, border-color 0.15s ease, color 0.15s ease",
        }}
      >
        <BsCalendar3 size={11} />
        <span style={{ color: open || active ? ACCENT_SOFT : MUTED, fontWeight: 400 }}>Período:</span>
        <b style={{ fontWeight: 600 }}>{label}</b>
        <MdKeyboardArrowDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s ease" }} />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full mt-2 rounded-xl overflow-hidden"
          style={{ background: "#141418", border: `1px solid ${BORDER_STRONG}`, width: 260, zIndex: 50, boxShadow: "0 20px 48px rgba(0,0,0,0.55)" }}
        >
          {/* Atalhos rápidos */}
          <div className="flex items-center gap-1.5 p-2.5" style={{ borderBottom: `1px solid ${BORDER}` }}>
            {[["7 dias", 7], ["30 dias", 30]].map(([lbl, n]) => (
              <button
                key={lbl}
                onClick={() => applyPreset(n)}
                className="text-[11px] px-2.5 py-1 rounded-full"
                style={{ color: MUTED2, background: "rgba(255,255,255,0.05)" }}
              >
                {lbl}
              </button>
            ))}
            <button
              onClick={applyThisMonth}
              className="text-[11px] px-2.5 py-1 rounded-full"
              style={{ color: MUTED2, background: "rgba(255,255,255,0.05)" }}
            >
              Este mês
            </button>
          </div>

          {/* Navegação de mês */}
          <div className="flex items-center justify-between px-3 pt-2.5">
            <button
              onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              className="flex items-center justify-center w-6 h-6 rounded-md"
              style={{ color: MUTED2 }}
            >
              <MdChevronLeft size={16} />
            </button>
            <span style={{ color: TEXT, fontSize: 12.5, fontWeight: 600 }}>
              {MONTH_NAMES_FULL[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              className="flex items-center justify-center w-6 h-6 rounded-md"
              style={{ color: MUTED2 }}
            >
              <MdChevronRight size={16} />
            </button>
          </div>

          {/* Dias da semana */}
          <div className="grid grid-cols-7 px-3 pt-2">
            {WEEKDAYS.map((w, i) => (
              <span key={i} className="text-center" style={{ fontSize: 10, color: MUTED }}>{w}</span>
            ))}
          </div>

          {/* Grade de dias */}
          <div className="grid grid-cols-7 gap-y-1 px-3 pb-3 pt-1">
            {days.map((day, i) => {
              if (!day) return <span key={i} />;
              const isStart  = sameDay(day, draft.start);
              const isEnd    = sameDay(day, draft.end);
              const inRange  = draft.start && draft.end && day > draft.start && day < draft.end;
              const isToday  = sameDay(day, today);
              return (
                <button
                  key={i}
                  onClick={() => handleDayClick(day)}
                  className="flex items-center justify-center rounded-lg text-xs"
                  style={{
                    height: 24,
                    background: isStart || isEnd ? ACCENT_GRAD : inRange ? ACCENT_GLOW : "transparent",
                    color:      isStart || isEnd ? "#0a0a0d" : inRange ? ACCENT_SOFT : TEXT,
                    fontWeight: isStart || isEnd ? 700 : 400,
                    border:     isToday && !isStart && !isEnd ? `1px solid ${ACCENT}60` : "1px solid transparent",
                  }}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {/* Ações */}
          <div className="flex items-center justify-between px-3 py-2.5" style={{ borderTop: `1px solid ${BORDER}` }}>
            <button onClick={handleClear} className="text-xs" style={{ color: MUTED }}>Limpar</button>
            <button
              onClick={handleApply}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: ACCENT_GRAD, color: "#0a0a0d" }}
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tile "Adicionar board" ────────────────────────────────────────────────────

function AddBoardTile({ onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl"
      style={{
        minHeight: 148,
        border:     `1.5px dashed ${hovered ? ACCENT + "70" : BORDER_STRONG}`,
        background: hovered ? ACCENT_GLOW : "transparent",
        transform:  hovered ? "translateY(-2px)" : "none",
        transition: "border-color 0.18s ease, background 0.18s ease, transform 0.2s ease",
      }}
    >
      <span
        className="flex items-center justify-center rounded-full"
        style={{
          width: 44, height: 44,
          background: hovered ? ACCENT_GRAD : ACCENT_GLOW,
          color:      hovered ? "#0a0a0d" : ACCENT_SOFT,
          transition: "background 0.18s ease, color 0.18s ease",
        }}
      >
        <FaPlus size={16} />
      </span>
      <span style={{ color: hovered ? ACCENT_SOFT : MUTED2, fontSize: 13, fontWeight: 600 }}>
        Adicionar board
      </span>
    </button>
  );
}

// ─── Board Card ───────────────────────────────────────────────────────────────

function ActionBtn({ title, danger, children, ...rest }) {
  return (
    <button
      title={title}
      className="flex items-center justify-center w-7 h-7 rounded-lg"
      style={{ color: danger ? RED : MUTED2, background: "rgba(255,255,255,0.06)" }}
      onMouseEnter={e => { e.currentTarget.style.background = danger ? "rgba(251,113,133,0.16)" : "rgba(255,255,255,0.11)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
      {...rest}
    >
      {children}
    </button>
  );
}

function BoardCard({ board, onOpen }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onOpen}
      className="relative flex flex-col rounded-2xl p-4 cursor-pointer overflow-hidden"
      style={{
        background:     hovered ? "rgba(255,255,255,0.045)" : "rgba(255,255,255,0.028)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        border:         `1px solid ${hovered ? BORDER_STRONG : BORDER}`,
        boxShadow:      hovered ? "0 12px 36px rgba(0,0,0,0.4)" : "0 4px 24px rgba(0,0,0,0.28)",
        transform:      hovered ? "translateY(-2px)" : "none",
        transition:     "background 0.18s ease, border-color 0.18s ease, box-shadow 0.2s ease, transform 0.2s ease",
      }}
    >
      {/* Linha de acento no topo — gradiente, mesmo padrão das colunas */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: 2, background: `linear-gradient(90deg, ${board.accent}, transparent 85%)` }}
      />

      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold truncate" style={{ color: TEXT }}>
          {board.name}
        </h3>
        <span
          className="rounded-full flex-shrink-0 mt-1"
          style={{ width: 7, height: 7, background: board.accent, boxShadow: `0 0 8px ${board.accent}80` }}
        />
      </div>

      <div className="flex flex-col gap-1.5 flex-1">
        <span className="flex items-center gap-1.5" style={{ color: MUTED2, fontSize: 12 }}>
          <HiOutlineUserGroup size={13} style={{ color: MUTED }} />
          {board.squad} <span style={{ color: MUTED }}>· {board.area}</span>
        </span>
        <span className="flex items-center gap-1.5" style={{ color: MUTED2, fontSize: 12 }}>
          <BsCalendar3 size={11} style={{ color: MUTED }} />
          {formatDate(board.createdAt)}
        </span>
      </div>

      {/* Ações — aparecem no hover, mesmo padrão de reveal dos cards do board */}
      <div
        className="flex items-center justify-end gap-1.5 mt-3 pt-3 transition-opacity duration-150"
        style={{ borderTop: `1px solid ${BORDER}`, opacity: hovered ? 1 : 0 }}
      >
        <ActionBtn title="Excluir" danger onClick={(e) => e.stopPropagation()}>
          <FaRegTrashAlt size={12} />
        </ActionBtn>
        <ActionBtn title="Clonar" onClick={(e) => e.stopPropagation()}>
          <FaRegClone size={12} />
        </ActionBtn>
        <ActionBtn title="Exportar" onClick={(e) => e.stopPropagation()}>
          <AiOutlineExport size={13} />
        </ActionBtn>
        <button
          title="Abrir"
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg"
          style={{ background: ACCENT_GLOW, color: ACCENT_SOFT, border: `1px solid ${ACCENT}40` }}
        >
          <FaRegFolderOpen size={12} />
          Abrir
        </button>
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function BoardListPageMock() {
  const boards = MOCK_BOARDS;
  const [nameQuery, setNameQuery]     = useState("");
  const [squadFilter, setSquadFilter] = useState("all");
  const [dateRange, setDateRange]     = useState({ start: null, end: null });

  const filteredBoards = useMemo(() => {
    const query = nameQuery.trim().toLowerCase();
    return boards.filter(b =>
      (query === "" || b.name.toLowerCase().includes(query)) &&
      (squadFilter === "all" || b.squad === squadFilter) &&
      matchesRange(b.createdAt, dateRange)
    );
  }, [boards, nameQuery, squadFilter, dateRange]);

  const hasActiveFilters = nameQuery.trim() !== "" || squadFilter !== "all" || !!dateRange.start;

  return (
    <div className="relative min-h-screen" style={{ background: BG }}>
      <AmbientGlow />

      <div className="sticky top-0 relative" style={{ zIndex: 10 }}>
        <ListTopBar boardCount={boards.length} />
      </div>

      <div className="relative flex items-start" style={{ zIndex: 10 }}>
        <div className="sticky top-14 flex-shrink-0" style={{ height: "calc(100vh - 56px)" }}>
          <Sidebar />
        </div>

        <div className="flex-1 min-w-0 px-6 pt-5 pb-6">
          {/* Barra de filtros */}
          <div className="flex items-center gap-2.5 flex-wrap mb-4">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: nameQuery ? ACCENT_GLOW : "rgba(255,255,255,0.035)",
                border: `1px solid ${nameQuery ? ACCENT + "50" : BORDER}`,
              }}
            >
              <FaMagnifyingGlass size={11} style={{ color: nameQuery ? ACCENT_SOFT : MUTED }} />
              <input
                value={nameQuery}
                onChange={e => setNameQuery(e.target.value)}
                placeholder="Buscar por nome..."
                className="bg-transparent text-xs outline-none w-36"
                style={{ color: TEXT }}
              />
              {nameQuery && (
                <button onClick={() => setNameQuery("")} style={{ color: MUTED, display: "flex" }}>
                  <MdClose size={13} />
                </button>
              )}
            </div>

            <FilterDropdown label="Squad" value={squadFilter} options={SQUAD_OPTIONS} onChange={setSquadFilter} />
            <DateRangeFilter range={dateRange} onChange={setDateRange} />

            {hasActiveFilters && (
              <button
                onClick={() => { setNameQuery(""); setSquadFilter("all"); setDateRange({ start: null, end: null }); }}
                className="text-xs"
                style={{ color: MUTED }}
              >
                Limpar filtros
              </button>
            )}

            <span className="ml-auto" style={{ color: MUTED, fontSize: 12 }}>
              {filteredBoards.length} de {boards.length} boards
            </span>
          </div>

          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
          >
            <AddBoardTile onClick={() => {}} />
            {filteredBoards.map(board => (
              <BoardCard key={board.id} board={board} onOpen={() => {}} />
            ))}
          </div>

          {filteredBoards.length === 0 && (
            <div className="flex items-center justify-center py-10" style={{ color: MUTED, fontSize: 13 }}>
              Nenhum board encontrado com esses filtros.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
