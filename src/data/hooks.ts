import { onSnapshot, orderBy, query, Timestamp, where, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';

import { DEFAULT_RETENTION } from '@/fsrs/scheduler';

import { cardsCol, deckDoc, decksCol, settingsDoc } from './paths';
import { dueHorizon, isDue } from './queue';
import type { Deck, FlashCard } from './types';

const logError = (where: string) => (e: Error) => console.warn(`[firestore] ${where}:`, e.message);

export function useDecks() {
  const [decks, setDecks] = useState<Deck[] | null>(null);
  useEffect(
    () =>
      onSnapshot(query(decksCol(), orderBy('createdAt', 'desc')), (snap) =>
        setDecks(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Deck, 'id'>) }))),
        logError('useDecks'),
      ),
    [],
  );
  return decks;
}

export function useDeck(deckId: string) {
  const [deck, setDeck] = useState<Deck | null | undefined>(undefined);
  useEffect(
    () =>
      onSnapshot(deckDoc(deckId), (d) =>
        setDeck(d.exists() ? { id: d.id, ...(d.data() as Omit<Deck, 'id'>) } : null),
        logError('useDeck'),
      ),
    [deckId],
  );
  return deck;
}

export function useCards(deckId: string) {
  const [cards, setCards] = useState<FlashCard[] | null>(null);
  useEffect(
    () =>
      onSnapshot(query(cardsCol(deckId), orderBy('createdAt', 'asc')), (snap) =>
        setCards(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FlashCard, 'id'>) }))),
        logError('useCards'),
      ),
    [deckId],
  );
  return cards;
}

/** Atualiza a cada `ms` milissegundos e quando a aba/app volta ao foco. */
function useNow(ms = 30000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    const onFocus = () => setNow(Date.now());
    if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(t);
      if (typeof window !== 'undefined' && window.removeEventListener) window.removeEventListener('focus', onFocus);
    };
  }, [ms]);
  return now;
}

/**
 * Cartões disponíveis para estudo (novos + `due <= agora`), em tempo real. A consulta busca até o fim de
 * amanhã e o filtro fino é feito no cliente com um relógio que avança, assim cartões
 * recém-criados ou que vencem durante o uso entram na contagem sem refazer a consulta.
 */
export function useDueCards(deckId: string) {
  const [cards, setCards] = useState<FlashCard[] | null>(null);
  const now = useNow();
  useEffect(() => {
    return onSnapshot(query(cardsCol(deckId), where('due', '<=', Timestamp.fromDate(dueHorizon())), orderBy('due', 'asc')), (snap) =>
      setCards(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FlashCard, 'id'>) }))),
      logError('useDueCards'),
    );
  }, [deckId]);
  return useMemo(() => {
    const t = Math.max(now, Date.now());
    return cards?.filter((c) => isDue(c, t)) ?? null;
  }, [cards, now]);
}

export type FsrsSettings = { request_retention: number };

export async function loadSettings(): Promise<FsrsSettings> {
  const snap = await getDoc(settingsDoc());
  return { request_retention: snap.data()?.request_retention ?? DEFAULT_RETENTION };
}

export function saveSettings(s: FsrsSettings) {
  return setDoc(settingsDoc(), s, { merge: true });
}

