import { State } from '@/fsrs/scheduler';

import { localDay } from '@/lib/dates';

import type { Deck, FlashCard } from './types';

export const DEFAULT_NEW_PER_DAY = 20;

/** Cartão disponível para estudo: novo (limitado só pela cota diária) ou com `due` vencido. */
export function isDue(c: Pick<FlashCard, 'state' | 'due'>, nowMs = Date.now()): boolean {
  return c.state === State.New || c.due.toMillis() <= nowMs;
}

/** Fim de amanhã: horizonte das consultas de cartões a vencer (o filtro fino é no cliente). */
export function dueHorizon(): Date {
  const h = new Date();
  h.setDate(h.getDate() + 2);
  h.setHours(0, 0, 0, 0);
  return h;
}

/**
 * Divide os cartões vencidos entre novos e em revisão/aprendizado, respeitando o
 * limite diário de cartões novos. Os novos vêm intercalados no fim.
 */
export function buildQueue(due: FlashCard[], newRemaining: number) {
  const reviews = due.filter((c) => c.state !== State.New);
  const news = due.filter((c) => c.state === State.New).slice(0, newRemaining);
  const learning = reviews.filter((c) => c.state === State.Learning || c.state === State.Relearning).length;
  return {
    queue: [...reviews, ...news],
    counts: { new: news.length, learning, review: reviews.length - learning },
  };
}

/** Quantos cartões novos ainda podem ser introduzidos hoje neste baralho. */
export function newRemainingToday(deck: Pick<Deck, 'newPerDay' | 'newToday'>, today = localDay()): number {
  const used = deck.newToday?.day === today ? deck.newToday.count : 0;
  return Math.max(0, (deck.newPerDay ?? DEFAULT_NEW_PER_DAY) - used);
}
