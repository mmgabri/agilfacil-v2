// Paleta de cores das colunas — compartilhada entre o menu "Cor dos Cards"
// (ColumnHeader.js, pra colunas já existentes) e o seletor de cor na criação
// do board (CreateBoardModal.js), pra manter as duas telas sempre em sincronia.
//
// Ordenada por matiz (hue), formando um gradiente contínuo do vermelho ao
// rosa/magenta, com os neutros (sem matiz definido) no final.

export const COLUMN_COLOR_PALETTE = [

  { name: 'coral', color: '#FF5C5C' },
  { name: 'vermelho', color: '#EF5350' },
  { name: 'terracota-suave', color: '#CD8168' },
  { name: 'ambar-forte', color: '#CA8208' },
  { name: 'verde', color: '#49A84D' },
  { name: 'esmeralda', color: '#24A676' },
  { name: 'esmeralda-escura', color: '#059669' },
  { name: 'verde-agua', color: '#00A47B' },
  { name: 'ciano', color: '#0E9FB6' },
  { name: 'azul-gelo', color: '#4A9FB7' },
  { name: 'ceu', color: '#089EE1' },
  { name: 'azul-medio', color: '#2A99F4' },
  { name: 'cinza-azulado', color: '#7397BA' },
  { name: 'azul-claro', color: '#4294F9' },
  { name: 'azul-royal', color: '#3B82F6' },
  { name: 'roxo', color: '#8B7CF6' },
  { name: 'violeta', color: '#9C7CF9' },
  { name: 'roxo-vivo', color: '#9B5DE5' },
  { name: 'lavanda', color: '#AD84C4' },
  { name: 'lilas-acinzentado', color: '#B088A9' },
  { name: 'rubi', color: '#BE123C' },
  { name: 'malva', color: '#B5838D' },
  { name: 'rosa', color: '#FA5D74' },
  // ── Neutros (sem matiz definido) ──
  { name: 'cinza-claro', color: '#94949E' },
];

const hexToRgb = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const colorDistance = (hexA, hexB) => {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  return (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2;
};

// Garante que a cor de uma coluna esteja sempre em COLUMN_COLOR_PALETTE —
// cobre boards antigos/importados com uma cor que não existe mais na paleta
// atual (ex.: uma revisão anterior da paleta). Se não achar igual, retorna a
// cor mais próxima por distância RGB em vez de deixar a cor "órfã" passar.
export const resolveColumnAccent = (colorCards) => {
  if (!colorCards) return COLUMN_COLOR_PALETTE[0].color;

  const exact = COLUMN_COLOR_PALETTE.find(c => c.color.toLowerCase() === colorCards.toLowerCase());
  if (exact) return exact.color;

  let nearest = COLUMN_COLOR_PALETTE[0];
  let nearestDistance = colorDistance(colorCards, nearest.color);
  for (const candidate of COLUMN_COLOR_PALETTE.slice(1)) {
    const distance = colorDistance(colorCards, candidate.color);
    if (distance < nearestDistance) {
      nearest = candidate;
      nearestDistance = distance;
    }
  }
  return nearest.color;
};

// Cor fixa por posição de coluna para boards "legados" (criados até
// 09/08/2026) — usada tanto na criação/clonagem (CreateBoardModal.js) quanto
// na exibição normal do board (BoardPage.js via FunctionsBoard.js), sempre
// ignorando a cor que estiver salva no banco pra esses boards.
export const LEGACY_COLUMN_COLORS = ['#3B82F6', '#4294F9', '#7397BA', '#8B7CF6', '#089EE1', '#94949E'];
export const LEGACY_COLOR_CUTOFF = new Date('2026-08-10T00:00:00');
