export const DECK_ICONS = [
  'BookOpen',
  'Brain',
  'FlaskConical',
  'Globe',
  'Languages',
  'Calculator',
  'Scale',
  'Music',
  'Code',
  'Heart',
  'Landmark',
  'Leaf',
  'Palette',
  'Stethoscope',
  'Rocket',
  'Briefcase',
] as const;

export type DeckIconName = (typeof DECK_ICONS)[number];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Cor e ícone do baralho; baralhos antigos sem esses campos recebem um padrão estável derivado do id. */
export function deckStyle(deck: { id: string; color?: number; icon?: string }, paletteSize = 8): { color: number; icon: DeckIconName } {
  const h = hash(deck.id);
  const color = typeof deck.color === 'number' && deck.color >= 0 && deck.color < paletteSize ? deck.color : h % paletteSize;
  const icon = (DECK_ICONS as readonly string[]).includes(deck.icon ?? '') ? (deck.icon as DeckIconName) : DECK_ICONS[h % DECK_ICONS.length];
  return { color, icon };
}
