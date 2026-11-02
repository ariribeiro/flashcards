import type { Timestamp } from 'firebase/firestore';

import type { StoredFsrs } from '@/fsrs/convert';

export type Deck = {
  id: string;
  name: string;
  description?: string;
  createdAt: Timestamp | null;
  cardCount: number;
  /** Índice da cor em `colors.decks` do tema */
  color?: number;
  /** Nome do ícone (ver `DECK_ICONS`) */
  icon?: string;
  newPerDay: number;
  newToday?: { day: string; count: number };
};

export type FlashCard = {
  id: string;
  front: string;
  back: string;
  tags: string[];
  createdAt: Timestamp | null;
} & StoredFsrs;
