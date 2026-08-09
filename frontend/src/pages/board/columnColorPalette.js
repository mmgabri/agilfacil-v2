// Paleta de cores das colunas — compartilhada entre o menu "Cor dos Cards"
// (ColumnHeader.js, pra colunas já existentes) e o seletor de cor na criação
// do board (CreateBoardModal.js), pra manter as duas telas sempre em sincronia.
//
// Ordenada por matiz (hue), formando um gradiente contínuo do vermelho ao
// rosa/magenta, com os neutros (sem matiz definido) no final.

export const COLUMN_COLOR_PALETTE = [

  { name: 'coral', color: '#FF6B6B' },
  { name: 'vermelho', color: '#EF5350' },
  { name: 'terracota-suave', color: '#D08770' },
  { name: 'ambar-forte', color: '#F59E0B' },
  { name: 'areia', color: '#FFE5B4' },
  { name: 'dourado', color: '#DDBB66' },
  { name: 'ambar', color: '#FBBF24' },
  { name: 'vanila', color: '#F3E5AB' },
  { name: 'amarelo-pastel', color: '#FFF9C4' },
  { name: 'amarelo-khaki', color: '#F0E68C' },
  { name: 'verde-claro', color: '#98FB98' },
  { name: 'verde-pastel', color: '#C8E6C9' },
  { name: 'verde', color: '#4CAF50' },
  { name: 'esmeralda', color: '#34D399' },
  { name: 'esmeralda-escura', color: '#059669' },
  { name: 'verde-agua', color: '#00C896' },
  { name: 'menta', color: '#5EEAD4' },
  { name: 'ciano', color: '#22D3EE' },
  { name: 'azul-gelo', color: '#88C0D0' },
  { name: 'azul-claro-pastel', color: '#BFEFFF' },
  { name: 'ceu', color: '#38BDF8' },
  { name: 'azul-medio', color: '#42A5F5' },
  { name: 'cinza-azulado', color: '#81A1C1' },
  { name: 'azul-claro', color: '#60A5FA' },
  { name: 'azul-royal', color: '#3B82F6' },
  { name: 'roxo', color: '#8B7CF6' },
  { name: 'violeta', color: '#A78BFA' },
  { name: 'roxo-vivo', color: '#9B5DE5' },
  { name: 'lavanda', color: '#CDB4DB' },
  { name: 'lilas-pastel', color: '#E1BEE7' },
  { name: 'magenta', color: '#E879F9' },
  { name: 'lilas-acinzentado', color: '#B48EAD' },
  { name: 'rosa-choque', color: '#F472B6' },
  { name: 'rubi', color: '#BE123C' },
  { name: 'malva', color: '#B5838D' },
  { name: 'rosa', color: '#FB7185' },
  { name: 'rosa-pastel', color: '#FFCDD2' },

  // ── Neutros (sem matiz definido) ──
  { name: 'cinza-claro', color: '#A1A1AA' },
  { name: 'branco-suave', color: '#F4F4F5' },
];

// Cor fixa por posição de coluna para boards "legados" (criados até
// 09/08/2026) — usada tanto na criação/clonagem (CreateBoardModal.js) quanto
// na exibição normal do board (BoardPage.js via FunctionsBoard.js), sempre
// ignorando a cor que estiver salva no banco pra esses boards.
export const LEGACY_COLUMN_COLORS = ['#3B82F6', '#60A5FA', '#81A1C1', '#8B7CF6', '#38BDF8', '#A1A1AA'];
export const LEGACY_COLOR_CUTOFF = new Date('2026-08-10T00:00:00');
