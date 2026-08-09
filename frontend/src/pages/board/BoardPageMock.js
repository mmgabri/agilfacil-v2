import React, { useState, useRef, useEffect } from "react";
import { FaPlay, FaStop, FaPlus, FaHeart } from "react-icons/fa6";
import { FaClock } from "react-icons/fa";
import { AiOutlineExport } from "react-icons/ai";
import { LiaEyeSlashSolid, LiaEyeSolid } from "react-icons/lia";
import { MdMoreVert, MdEdit, MdSpaceDashboard, MdSettings, MdHome, MdStyle, MdPersonAdd, MdLogin, MdLogout, MdDragIndicator } from "react-icons/md";
import Logo from '../../images/favicon.ico';
import { CiTrash } from "react-icons/ci";

// ─── Design tokens — "Dark Premium" ───────────────────────────────────────────
// Referências de humor: Vercel dashboard, Raycast, Linear.
// Base quase-preta + glow ambiente sutil, hairlines no lugar de bordas sólidas,
// um único accent usado com intenção, glass com camadas de profundidade reais.

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

const fadeDivider = `linear-gradient(to bottom, transparent, ${BORDER_STRONG} 30%, ${BORDER_STRONG} 70%, transparent)`;

// Paleta de cores para colunas — combina o tom "dark premium" do mock com as
// cores que a tela de coluna em produção já oferece (ColumnHeader.js), para
// não quebrar a familiaridade de quem já usa o AgilFácil.
const COLUMN_COLOR_GROUPS = [
  {
    label: "Paleta atual",
    swatches: [
      { name: "Esmeralda", color: "#34d399" },
      { name: "Rosa",      color: "#fb7185" },
      { name: "Céu",       color: "#38bdf8" },
      { name: "Âmbar",     color: "#fbbf24" },
      { name: "Violeta",   color: "#a78bfa" },
    ],
  },
  {
    label: "Cores do AgilFácil",
    swatches: [
      { name: "Amarelo",     color: "#F0E68C" },
      { name: "Rosa claro",  color: "#D8968C" },
      { name: "Verde claro", color: "#98FB98" },
      { name: "Azul claro",  color: "#BFEFFF" },
      { name: "Dourado",     color: "#DDBB66" },
    ],
  },
];

// ─── Dados fictícios ──────────────────────────────────────────────────────────

const MOCK_BOARD = {
  boardName: "Retrospectiva Q3 2025",
  usersOnBoard: 4,
  cardCreators: 3,
  columns: [
    {
      id: "col-1", title: "O que foi bem", accent: "#34d399",
      cards: [
        { id: "c1", content: "Entrega do sprint dentro do prazo", likes: 4 },
        { id: "c2", content: "Boa comunicação entre as equipes durante a sprint", likes: 2 },
        { id: "c3", content: "Automação dos testes reduziu regressões em 30%", likes: 1 },
      ],
    },
    {
      id: "col-2", title: "O que pode melhorar", accent: "#fb7185",
      cards: [
        { id: "c4", content: "Reuniões longas demais sem conclusão clara", likes: 5 },
        { id: "c5", content: "Falta de documentação nas novas features", likes: 3 },
      ],
    },
    {
      id: "col-3", title: "Ações para próxima sprint", accent: "#38bdf8",
      cards: [
        { id: "c6", content: "Limitar reuniões a 30 minutos com pauta definida", likes: 6 },
        { id: "c7", content: "Criar template de documentação para features", likes: 2 },
        { id: "c8", content: "Daily mais curta e focada em bloqueios", likes: 1 },
      ],
    },
    {
      id: "col-4", title: "Aprendizados", accent: "#fbbf24",
      cards: [
        { id: "c9", content: "Pair programming acelerou o onboarding do novo dev", likes: 3 },
      ],
    },
  ],
};

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
// Redesenhado para reduzir ruído: menos divisores/pills competindo entre si,
// hierarquia clara (nome do board como título, Convidar como único CTA colorido,
// o resto é utilitário e discreto até o hover).

function StatMeta({ board }) {
  const totalCards = board.columns.reduce((a, c) => a + c.cards.length, 0);

  return (
    <div className="flex items-center gap-2.5 flex-shrink-0" style={{ fontSize: 12.5 }}>
      <span className="flex items-center gap-1.5" title="Participantes online agora">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: GREEN }} />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: GREEN }} />
        </span>
        <span style={{ color: MUTED2 }}>
          <b style={{ color: TEXT, fontWeight: 700 }}>{board.usersOnBoard}</b> online
          <span style={{ color: MUTED, fontWeight: 400 }}> ({board.cardCreators} com card)</span>
        </span>
      </span>

      <span style={{ color: MUTED }}>·</span>

      <span style={{ color: MUTED2 }} title="Total de cards no board">
        <b style={{ color: TEXT, fontWeight: 700 }}>{totalCards}</b> cards
      </span>
    </div>
  );
}

const MOCK_USER = { name: "Marcelo Gabriel", initials: "MG" };

function IconGhostBtn({ title, active, activeColor, children, ...rest }) {
  return (
    <button
      title={title}
      className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
      style={{
        background: active ? `${activeColor}1a` : "transparent",
        color:      active ? activeColor : MUTED,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
      {...rest}
    >
      {children}
    </button>
  );
}

function TopBar({ board }) {
  const [time,        setTime]        = useState("05:00");
  const [running,     setRunning]     = useState(false);
  const [hidden,      setHidden]      = useState(false);
  const [loggedIn,    setLoggedIn]    = useState(true);
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
      {/* Esquerda: identidade do board (fixo) + stats (encolhe/some primeiro em telas estreitas) */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <img
            src={Logo}
            alt="AgilFácil"
            style={{ width: 22, height: 22, flexShrink: 0 }}
          />
          <span className="hidden lg:inline" style={{ color: "#ffffff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>AgilFácil</span>
        </div>
        <span className="hidden lg:inline" style={{ color: MUTED, fontSize: 13, flexShrink: 0 }}>/</span>
        <span
          className="truncate min-w-0 text-sm px-2.5 py-0.5 rounded-full font-semibold"
          style={{ background: ACCENT_GLOW, color: ACCENT_SOFT, border: `1px solid ${ACCENT}30`, letterSpacing: -0.1 }}
          title={board.boardName}
        >
          {board.boardName}
        </span>

        <div className="hidden md:block flex-shrink-0">
          <StatMeta board={board} />
        </div>
      </div>

      {/* Centro: timer — centralizado no header, independente do peso dos lados */}
      <div
        className="absolute flex items-center gap-2 px-2.5 py-1 rounded-full"
        style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", background: "rgba(255,255,255,0.035)" }}
      >
        <FaClock size={11} style={{ color: MUTED }} />
        <input
          className="w-12 bg-transparent text-xs text-center outline-none font-mono"
          style={{ color: TEXT, letterSpacing: 0.5 }}
          value={time}
          onChange={e => setTime(e.target.value)}
          disabled={running}
        />
        <button
          onClick={() => setRunning(r => !r)}
          className="flex items-center justify-center w-5 h-5 rounded-full"
          style={{
            background: running ? "rgba(251,113,133,0.20)" : ACCENT_GLOW,
            color:      running ? RED : ACCENT_SOFT,
            transition: "background 0.18s ease, color 0.18s ease",
          }}
        >
          {running ? <FaStop size={8} /> : <FaPlay size={8} />}
        </button>
      </div>

      {/* Direita: só os botões fixos — utilitários → CTA → avatar */}
      <div className="flex items-center gap-3.5 flex-shrink-0">
        {/* Utilitários — agrupados e discretos, cor só aparece no hover/ativo */}
        <div className="flex items-center gap-0.5">
          <IconGhostBtn title={hidden ? "Revelar cards" : "Ocultar cards"} active={hidden} activeColor={ACCENT} onClick={() => setHidden(h => !h)}>
            {hidden ? <LiaEyeSolid size={15} /> : <LiaEyeSlashSolid size={15} />}
          </IconGhostBtn>

          <IconGhostBtn title="Exportar PDF">
            <AiOutlineExport size={15} />
          </IconGhostBtn>

          <IconGhostBtn title="Nova coluna">
            <FaPlus size={13} />
          </IconGhostBtn>
        </div>

        {/* Convidar — único CTA colorido do header; rótulo some em telas estreitas */}
        <button
          className="flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-4 py-1.5 rounded-full"
          style={{
            background: ACCENT_GRAD,
            color: "#0a0a0d",
            boxShadow: `0 4px 18px ${ACCENT_GLOW}`,
          }}
        >
          <MdPersonAdd size={13} />
          <span className="hidden sm:inline">Convidar</span>
        </button>

        <div className="w-px h-5" style={{ background: fadeDivider }} />

        {/* Avatar / Entrar ou Sair */}
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

// ─── Card ─────────────────────────────────────────────────────────────────────

function Card({ card, accent }) {
  const [hovered, setHovered] = useState(false);
  const [liked,   setLiked]   = useState(false);
  const [likes,   setLikes]   = useState(card.likes);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-xl p-2.5 pl-3 cursor-grab"
      style={{
        background:     hovered ? `${accent}17` : `${accent}0c`,
        backdropFilter: "blur(14px)",
        border:         `1px solid ${hovered ? accent + "40" : "transparent"}`,
        borderLeft:     `3px solid ${accent}`,
        boxShadow:      hovered ? `0 10px 28px rgba(0,0,0,0.45), 0 0 0 1px ${accent}22` : "none",
        transform:      hovered ? "translateY(-2px)" : "none",
        transition:     "background 0.16s ease, border-color 0.16s ease, box-shadow 0.2s ease, transform 0.2s ease",
      }}
    >
      <div
        className="absolute top-2 left-2 transition-opacity duration-150"
        style={{ opacity: hovered ? 1 : 0, color: MUTED }}
      >
        <MdDragIndicator size={13} />
      </div>

      <p className="text-sm leading-relaxed px-4" style={{ color: TEXT }}>
        {card.content}
      </p>

      <div
        className="absolute top-2.5 right-2.5 flex gap-1 transition-opacity duration-150"
        style={{ opacity: hovered ? 1 : 0 }}
      >
        <button className="p-1 rounded-md" style={{ color: MUTED2, background: "rgba(255,255,255,0.06)" }}>
          <MdEdit size={12} />
        </button>
        <button className="p-1 rounded-md" style={{ color: MUTED2, background: "rgba(255,255,255,0.06)" }}>
          <CiTrash size={13} />
        </button>
      </div>

      <div className="flex justify-end mt-2">
        <button
          onClick={() => { setLiked(!liked); setLikes(l => liked ? l - 1 : l + 1); }}
          className="flex items-center gap-1.5 text-xs"
          style={{ color: liked ? accent : MUTED, transition: "color 0.15s ease" }}
        >
          <FaHeart size={10} /> {likes}
        </button>
      </div>
    </div>
  );
}

// ─── Coluna ───────────────────────────────────────────────────────────────────

function ColumnColorMenu({ col, onSelect, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full mt-2 rounded-xl p-3"
      style={{
        background: "#141418",
        border: `1px solid ${BORDER_STRONG}`,
        minWidth: 190,
        zIndex: 50,
        boxShadow: "0 20px 48px rgba(0,0,0,0.55)",
      }}
    >
      {COLUMN_COLOR_GROUPS.map((group, gi) => (
        <div key={group.label} className={gi > 0 ? "mt-3" : ""}>
          <span style={{ color: MUTED, fontSize: 10, letterSpacing: 0.4, textTransform: "uppercase", fontWeight: 600 }}>
            {group.label}
          </span>
          <div className="flex flex-wrap gap-2 mt-2">
            {group.swatches.map(swatch => {
              const isSelected = swatch.color === col.accent;
              return (
                <button
                  key={swatch.color}
                  title={swatch.name}
                  onClick={() => onSelect(swatch.color)}
                  className="rounded-full flex-shrink-0"
                  style={{
                    width: 20,
                    height: 20,
                    background: swatch.color,
                    border: isSelected ? "2px solid #fff" : `1px solid ${BORDER_STRONG}`,
                    boxShadow: isSelected ? `0 0 0 2px ${swatch.color}80` : "none",
                    transition: "transform 0.12s ease",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.15)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Column({ col, onColorChange, onAddCard }) {
  const [text,    setText]    = useState("");
  const [focused, setFocused] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);

  const handleSave = () => {
    if (!text.trim()) return;
    onAddCard(text.trim());
    setText("");
    setFocused(false);
  };

  return (
    <div
      className="relative flex-1 min-w-[240px] flex flex-col rounded-2xl overflow-hidden"
      style={{
        background:     "rgba(255,255,255,0.028)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        border:         `1px solid ${BORDER}`,
        boxShadow:      "0 4px 32px rgba(0,0,0,0.35)",
      }}
    >
      {/* Linha de acento no topo — gradiente, não sólida */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: 2, background: `linear-gradient(90deg, ${col.accent}, transparent 85%)` }}
      />

      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="rounded-full flex-shrink-0"
            style={{ width: 7, height: 7, background: col.accent, boxShadow: `0 0 8px ${col.accent}80` }}
          />
          <span className="text-sm font-semibold truncate" style={{ color: TEXT }}>
            {col.title}
          </span>
          <span
            className="text-[11px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ background: `${col.accent}1f`, color: col.accent }}
          >
            {col.cards.length}
          </span>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowColorMenu(v => !v)}
            className="p-1 rounded-lg hover:opacity-80"
            style={{ color: TEXT, opacity: showColorMenu ? 0.9 : 0.4, transition: "opacity 0.15s ease" }}
          >
            <MdMoreVert size={15} />
          </button>
          {showColorMenu && (
            <ColumnColorMenu
              col={col}
              onSelect={(color) => { onColorChange(color); setShowColorMenu(false); }}
              onClose={() => setShowColorMenu(false)}
            />
          )}
        </div>
      </div>

      {/* Quick-add */}
      <div className="px-2.5 pt-2.5 pb-1">
        <textarea
          rows={focused ? 3 : 1}
          placeholder="Digite algo..."
          value={text}
          onChange={e => setText(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { if (!text) setFocused(false); }}
          className="w-full resize-none rounded-xl text-sm px-3 py-2 outline-none"
          style={{
            background:     "rgba(255,255,255,0.045)",
            backdropFilter: "blur(8px)",
            border:         `1px solid ${focused ? col.accent + "70" : BORDER}`,
            boxShadow:      focused ? `0 0 0 3px ${col.accent}18` : "none",
            color:          TEXT,
            caretColor:     col.accent,
            transition:     "border-color 0.18s ease, box-shadow 0.18s ease",
          }}
        />
        {focused && (
          <div className="flex gap-2 mt-2">
            <button
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: col.accent, color: "#0a0a0d" }}
              onClick={handleSave}
            >
              Salvar
            </button>
            <button
              className="text-xs px-3 py-1.5 rounded-lg"
              style={{ color: MUTED2, background: "rgba(255,255,255,0.04)" }}
              onClick={() => { setText(""); setFocused(false); }}
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 p-2.5">
        {col.cards.map(card => (
          <Card key={card.id} card={card} accent={col.accent} />
        ))}
      </div>
    </div>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────────

export default function BoardPageMock() {
  const [columns, setColumns] = useState(MOCK_BOARD.columns);
  const board = { ...MOCK_BOARD, columns };

  const handleColorChange = (columnId, color) => {
    setColumns(cols => cols.map(c => (c.id === columnId ? { ...c, accent: color } : c)));
  };

  const handleAddCard = (columnId, content) => {
    const newCard = { id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, content, likes: 0 };
    setColumns(cols => cols.map(c => (c.id === columnId ? { ...c, cards: [...c.cards, newCard] } : c)));
  };

  return (
    <div className="relative min-h-screen" style={{ background: BG }}>
      <AmbientGlow />

      {/* Header full-width — sticky, como no board atual */}
      <div className="sticky top-0 relative" style={{ zIndex: 10 }}>
        <TopBar board={board} />
      </div>

      {/* Sidebar + conteúdo */}
      <div className="relative flex items-start" style={{ zIndex: 10 }}>
        <div className="sticky top-14 flex-shrink-0" style={{ height: "calc(100vh - 56px)" }}>
          <Sidebar />
        </div>

        <div className="flex gap-4 px-2.5 pt-2.5 pb-5 flex-1 min-w-0 items-stretch overflow-x-auto">
          {board.columns.map(col => (
            <Column
              key={col.id}
              col={col}
              onColorChange={(color) => handleColorChange(col.id, color)}
              onAddCard={(content) => handleAddCard(col.id, content)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
