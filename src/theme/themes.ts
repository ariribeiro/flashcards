export type ThemeId = 'vibrant' | 'table' | 'paper';
export type Appearance = 'system' | 'light' | 'dark';

export type Palette = {
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accentText: string;
  /** Links e aba ativa: legível sobre o fundo */
  link: string;
  subtle: string;
  danger: string;
  /** Faixa do topo (degradê) e texto sobre ela */
  heroFrom: string;
  heroTo: string;
  heroText: string;
  /** Face das cartas de estudo */
  card: string;
  cardText: string;
  cardBorder: string;
  /** Ornamentos: naipe vermelho, linhas pautadas, marca-texto */
  ornament: string;
  highlight: string;
  shadow: string;
  tabBar: string;
  again: string;
  hard: string;
  good: string;
  easy: string;
  /** 8 cores de baralho, ajustadas ao tema */
  decks: string[];
};

export type ThemeDef = {
  id: ThemeId;
  name: string;
  description: string;
  /** Ornamento das cartas: nenhum, naipes nos cantos ou linhas pautadas */
  cardStyle: 'plain' | 'suits' | 'ruled';
  fonts: { display: string };
  light: Palette;
  dark: Palette;
};

const vibrant: ThemeDef = {
  id: 'vibrant',
  name: 'Vibrante',
  description: 'Cores vivas e degradês',
  cardStyle: 'plain',
  fonts: { display: 'PlusJakartaSans_800ExtraBold' },
  light: {
    background: '#F5F3FF',
    surface: '#FFFFFF',
    text: '#1E1B4B',
    muted: '#6B6893',
    border: '#E4E0FB',
    accent: '#6D28D9',
    accentText: '#FFFFFF',
    link: '#6D28D9',
    subtle: '#EDE9FE',
    danger: '#DC2626',
    heroFrom: '#4F46E5',
    heroTo: '#A21CAF',
    heroText: '#FFFFFF',
    card: '#FFFFFF',
    cardText: '#1E1B4B',
    cardBorder: '#E4E0FB',
    ornament: '#A78BFA',
    highlight: '#FDE68A',
    shadow: '#4C1D95',
    tabBar: '#FFFFFF',
    again: '#E11D48',
    hard: '#F59E0B',
    good: '#10B981',
    easy: '#3B82F6',
    decks: ['#6D28D9', '#DB2777', '#EA580C', '#CA8A04', '#16A34A', '#0891B2', '#2563EB', '#475569'],
  },
  dark: {
    background: '#0F0B24',
    surface: '#1A1538',
    text: '#F1EEFF',
    muted: '#A39FCB',
    border: '#2D2658',
    accent: '#A78BFA',
    accentText: '#1E1B4B',
    link: '#C4B5FD',
    subtle: '#231C49',
    danger: '#F87171',
    heroFrom: '#3730A3',
    heroTo: '#86198F',
    heroText: '#FFFFFF',
    card: '#221B47',
    cardText: '#F1EEFF',
    cardBorder: '#3B3270',
    ornament: '#7C3AED',
    highlight: '#FCD34D',
    shadow: '#000000',
    tabBar: '#140F2E',
    again: '#FB7185',
    hard: '#FBBF24',
    good: '#34D399',
    easy: '#60A5FA',
    decks: ['#8B5CF6', '#EC4899', '#F97316', '#EAB308', '#22C55E', '#06B6D4', '#3B82F6', '#64748B'],
  },
};

const table: ThemeDef = {
  id: 'table',
  name: 'Mesa de jogo',
  description: 'Feltro verde e cartas clássicas',
  cardStyle: 'suits',
  fonts: { display: 'PlayfairDisplay_700Bold' },
  light: {
    background: '#0F5132',
    surface: '#13603C',
    text: '#FBF7EE',
    muted: '#B9D3C2',
    border: '#1D7048',
    accent: '#B3261E',
    accentText: '#FFFFFF',
    link: '#E9C46A',
    subtle: '#0C4429',
    danger: '#FF8A80',
    heroFrom: '#0B3D26',
    heroTo: '#14683F',
    heroText: '#FBF7EE',
    card: '#FBF7EE',
    cardText: '#1B1B1B',
    cardBorder: '#E8DFC9',
    ornament: '#B3261E',
    highlight: '#E9C46A',
    shadow: '#03140C',
    tabBar: '#0B3D26',
    again: '#B3261E',
    hard: '#9A6B12',
    good: '#1B1B1B',
    easy: '#1F4E8C',
    decks: ['#B3261E', '#1B1B1B', '#8C1C3C', '#1F4E8C', '#9A6B12', '#5B3A8C', '#0E6E5C', '#6B4423'],
  },
  dark: {
    background: '#062618',
    surface: '#0B3522',
    text: '#F3EEDF',
    muted: '#93B5A1',
    border: '#134A30',
    accent: '#D9473C',
    accentText: '#FFFFFF',
    link: '#E9C46A',
    subtle: '#041C11',
    danger: '#FF8A80',
    heroFrom: '#03170E',
    heroTo: '#0C452A',
    heroText: '#F3EEDF',
    card: '#F3EEDF',
    cardText: '#1B1B1B',
    cardBorder: '#D9CFB6',
    ornament: '#B3261E',
    highlight: '#E9C46A',
    shadow: '#000000',
    tabBar: '#041C11',
    again: '#B3261E',
    hard: '#9A6B12',
    good: '#1B1B1B',
    easy: '#1F4E8C',
    decks: ['#C0392B', '#2B2B2B', '#9B2246', '#2A5DA0', '#A87A1C', '#6A469E', '#13806B', '#7A5230'],
  },
};

const paper: ThemeDef = {
  id: 'paper',
  name: 'Papel e tinta',
  description: 'Fichas pautadas e marca-texto',
  cardStyle: 'ruled',
  fonts: { display: 'Fraunces_700Bold' },
  light: {
    background: '#F6F1E7',
    surface: '#FFFDF8',
    text: '#1E3A5F',
    muted: '#6E7A8A',
    border: '#E6DCC8',
    accent: '#1E3A5F',
    accentText: '#FFFDF8',
    link: '#1E3A5F',
    subtle: '#EFE7D6',
    danger: '#C0392B',
    heroFrom: '#EFE5D0',
    heroTo: '#F6F1E7',
    heroText: '#1E3A5F',
    card: '#FFFDF8',
    cardText: '#1E3A5F',
    cardBorder: '#E6DCC8',
    ornament: '#9CC3E6',
    highlight: '#FFE58A',
    shadow: '#8A7650',
    tabBar: '#FFFDF8',
    again: '#C0392B',
    hard: '#B7791F',
    good: '#2F7A4D',
    easy: '#2B6CB0',
    decks: ['#1E3A5F', '#C0392B', '#2F7A4D', '#B7791F', '#7B4B94', '#2B6CB0', '#8B5E3C', '#4A5568'],
  },
  dark: {
    background: '#161B22',
    surface: '#1E242D',
    text: '#E8E1D3',
    muted: '#9AA4B2',
    border: '#2C3440',
    accent: '#FFE58A',
    accentText: '#161B22',
    link: '#FFE58A',
    subtle: '#1A2029',
    danger: '#F28B82',
    heroFrom: '#1E242D',
    heroTo: '#161B22',
    heroText: '#E8E1D3',
    card: '#F1EADB',
    cardText: '#1E3A5F',
    cardBorder: '#D9CDB4',
    ornament: '#9CC3E6',
    highlight: '#FFE58A',
    shadow: '#000000',
    tabBar: '#1A2029',
    again: '#E57368',
    hard: '#E0A84F',
    good: '#6BBF8A',
    easy: '#7FB2E5',
    decks: ['#7FA7D6', '#E57368', '#6BBF8A', '#E0A84F', '#B58BD0', '#5FA8E8', '#C49A72', '#A0AEC0'],
  },
};

export const THEMES: Record<ThemeId, ThemeDef> = { vibrant, table, paper };
export const THEME_LIST: ThemeDef[] = [vibrant, table, paper];
export const DEFAULT_THEME: ThemeId = 'vibrant';

export function resolveScheme(appearance: Appearance, system: 'light' | 'dark' | null | undefined): 'light' | 'dark' {
  if (appearance === 'light' || appearance === 'dark') return appearance;
  return system === 'dark' ? 'dark' : 'light';
}

export function isThemeId(v: unknown): v is ThemeId {
  return v === 'vibrant' || v === 'table' || v === 'paper';
}
