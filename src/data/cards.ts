import { deleteDoc, doc, increment, Timestamp, updateDoc, writeBatch } from 'firebase/firestore';
import type { Card, ReviewLog } from 'ts-fsrs';

import type { GeneratedCard } from '@/ai/schema';
import { fsrsToFirestore, reviewLogToFirestore } from '@/fsrs/convert';
import { newCardState, State } from '@/fsrs/scheduler';
import { localDay } from '@/lib/dates';
import { db } from '@/lib/firebase';

import { newRemainingToday } from './queue';
import { cardDoc, cardsCol, deckDoc, reviewLogsCol } from './paths';
import type { Deck } from './types';

const BATCH = 450;

/** Cria cartões novos (estado FSRS inicial). Usado na criação manual e na importação da IA. */
export async function addCards(deckId: string, cards: GeneratedCard[]): Promise<number> {
  for (let i = 0; i < cards.length; i += BATCH) {
    const chunk = cards.slice(i, i + BATCH);
    const batch = writeBatch(db);
    const now = new Date();
    chunk.forEach((c, j) => {
      // 1 ms de diferença entre cartões preserva a ordem original (lista e fila de novos);
      // fica no passado para o cartão já estar vencido na hora
      const at = new Date(now.getTime() - (chunk.length - j));
      const fsrs = fsrsToFirestore(newCardState(at));
      batch.set(doc(cardsCol(deckId)), {
        front: c.front.trim(),
        back: c.back.trim(),
        tags: c.tags ?? [],
        createdAt: Timestamp.fromDate(at),
        ...fsrs,
      });
    });
    batch.update(deckDoc(deckId), { cardCount: increment(chunk.length) });
    await batch.commit();
  }
  return cards.length;
}

export function updateCardText(deckId: string, cardId: string, front: string, back: string) {
  return updateDoc(cardDoc(deckId, cardId), { front: front.trim(), back: back.trim() });
}

export async function deleteCard(deckId: string, cardId: string) {
  await deleteDoc(cardDoc(deckId, cardId));
  await updateDoc(deckDoc(deckId), { cardCount: increment(-1) });
}

/**
 * Grava o resultado de uma revisão: novo estado do cartão + reviewLog (para otimizar
 * os parâmetros do FSRS no futuro). Não é aguardado na tela de estudo, porque o Firestore
 * aplica a escrita localmente na hora e sincroniza quando houver conexão.
 */
export function saveReview(deck: Deck, cardId: string, previousState: State, card: Card, log: ReviewLog) {
  const batch = writeBatch(db);
  batch.update(cardDoc(deck.id, cardId), fsrsToFirestore(card));
  batch.set(doc(reviewLogsCol(deck.id)), reviewLogToFirestore(cardId, log));
  if (previousState === State.New) {
    const today = localDay();
    const used = deck.newPerDay - newRemainingToday(deck, today);
    batch.update(deckDoc(deck.id), { newToday: { day: today, count: used + 1 } });
  }
  return batch.commit();
}
