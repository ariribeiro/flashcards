import { onSnapshot, orderBy, query, Timestamp, where, getDoc, setDoc } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_RETENTION } from '@/fsrs/scheduler';

import { cardsCol, deckDoc, decksCol, settingsDoc } from './paths';
import { buildQueue, dueHorizon, isDue, newRemainingToday } from './queue';
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
  const refresh = useCallback(() => setNow(Date.now()), []);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    const onFocus = () => setNow(Date.now());
    if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(t);
      if (typeof window !== 'undefined' && window.removeEventListener) window.removeEventListener('focus', onFocus);
    };
  }, [ms]);
  return [now, refresh] as const;
}

/**
 * Cartões disponíveis para estudo (novos + `due <= agora`), em tempo real. A consulta busca até o fim de
 * amanhã e o filtro fino é feito no cliente com um relógio que avança, assim cartões
 * recém-criados ou que vencem durante o uso entram na contagem sem refazer a consulta.
 */
export function useDueCards(deckId: string) {
  const [cards, setCards] = useState<FlashCard[] | null>(null);
  const [now, refresh] = useNow();
  useEffect(() => {
    return onSnapshot(query(cardsCol(deckId), where('due', '<=', Timestamp.fromDate(dueHorizon())), orderBy('due', 'asc')), (snap) => {
      setCards(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FlashCard, 'id'>) })));
      refresh();
    },
      logError('useDueCards'),
    );
  }, [deckId, refresh]);
  return useMemo(() => cards?.filter((c) => isDue(c, now)) ?? null, [cards, now]);
}

export type DueCounts = { new: number; learning: number; review: number; total: number };

/** Contagem de cartas para hoje em vários baralhos de uma vez (Início e Baralhos). */
export function useDueCounts(decks: Deck[] | null): Record<string, DueCounts> {
  const [byDeck, setByDeck] = useState<Record<string, FlashCard[]>>({});
  const [now, refresh] = useNow();
  const ids = (decks ?? []).map((d) => d.id).join(',');

  useEffect(() => {
    if (!ids) return;
    const unsubs = ids.split(',').map((id) =>
      onSnapshot(
        query(cardsCol(id), where('due', '<=', Timestamp.fromDate(dueHorizon())), orderBy('due', 'asc')),
        (snap) => {
          setByDeck((m) => ({ ...m, [id]: snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FlashCard, 'id'>) })) }));
          refresh();
        },
        logError('useDueCounts'),
      ),
    );
    return () => unsubs.forEach((u) => u());
  }, [ids, refresh]);

  return useMemo(() => {
    const t = now;
    const out: Record<string, DueCounts> = {};
    for (const d of decks ?? []) {
      const due = (byDeck[d.id] ?? []).filter((c) => isDue(c, t));
      const { counts, queue } = buildQueue(due, newRemainingToday(d));
      out[d.id] = { ...counts, total: queue.length };
    }
    return out;
  }, [decks, byDeck, now]);
}

export type FsrsSettings = { request_retention: number };

export async function loadSettings(): Promise<FsrsSettings> {
  const snap = await getDoc(settingsDoc());
  return { request_retention: snap.data()?.request_retention ?? DEFAULT_RETENTION };
}

export function saveSettings(s: FsrsSettings) {
  return setDoc(settingsDoc(), s, { merge: true });
}

