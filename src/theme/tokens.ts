export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;
export const radius = 12;
export const maxContentWidth = 640;

export const fontSize = { small: 13, body: 16, title: 22, card: 26 } as const;

const light = {
  background: '#FAFAF9',
  surface: '#FFFFFF',
  text: '#1C1917',
  muted: '#78716C',
  border: '#E7E5E4',
  accent: '#4F46E5',
  accentText: '#FFFFFF',
  subtle: '#F5F5F4',
  danger: '#B91C1C',
  // Botões de nota: tons dessaturados
  again: '#B4534B',
  hard: '#A07A3C',
  good: '#4E7A5A',
  easy: '#4F6A9A',
};

const dark: typeof light = {
  background: '#0C0A09',
  surface: '#1C1917',
  text: '#F5F5F4',
  muted: '#A8A29E',
  border: '#292524',
  accent: '#8B8CF6',
  accentText: '#0C0A09',
  subtle: '#171412',
  danger: '#F87171',
  again: '#D98A83',
  hard: '#CDAA6E',
  good: '#8DB89A',
  easy: '#94AEDB',
};

export const palettes = { light, dark };
export type Palette = typeof light;
