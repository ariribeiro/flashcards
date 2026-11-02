import { describe, expect, it } from 'vitest';

import { fsrsFromFirestore, fsrsToFirestore } from '@/fsrs/convert';
import { formatInterval, makeScheduler, newCardState, Rating, State } from '@/fsrs/scheduler';
import { buildQueue } from '@/data/queue';
import { newRemainingToday } from '@/data/queue';

describe('FSRS', () => {
  it('Bom num cartão novo leva ao estado Learning', () => {
    const now = new Date('2026-01-01T10:00:00Z');
    const { card, log } = makeScheduler().next(newCardState(now), now, Rating.Good);
    expect(card.state).toBe(State.Learning);
    expect(card.due.getTime()).toBeGreaterThan(now.getTime());
    expect(log.rating).toBe(Rating.Good);
  });

  it('Fácil gera intervalo maior que Errei', () => {
    const now = new Date('2026-01-01T10:00:00Z');
    const p = makeScheduler().repeat(newCardState(now), now);
    expect(p[Rating.Easy].card.due.getTime()).toBeGreaterThan(p[Rating.Again].card.due.getTime());
  });

  it('conversão para Firestore e de volta preserva os valores', () => {
    const now = new Date('2026-01-01T10:00:00Z');
    const { card } = makeScheduler().next(newCardState(now), now, Rating.Good);
    const back = fsrsFromFirestore(fsrsToFirestore(card));
    expect(back.due.getTime()).toBe(card.due.getTime());
    expect(back.last_review?.getTime()).toBe(card.last_review?.getTime());
    expect(back.stability).toBe(card.stability);
    expect(back.state).toBe(card.state);
    expect(fsrsToFirestore(newCardState(now)).last_review).toBeNull();
  });

  it('formatInterval', () => {
    const t = new Date('2026-01-01T00:00:00Z');
    const plus = (min: number) => new Date(t.getTime() + min * 60000);
    expect(formatInterval(t, plus(0.2))).toBe('<1m');
    expect(formatInterval(t, plus(10))).toBe('10m');
    expect(formatInterval(t, plus(180))).toBe('3h');
    expect(formatInterval(t, plus(4 * 1440))).toBe('4d');
    expect(formatInterval(t, plus(60 * 1440))).toBe('2me');
    expect(formatInterval(t, plus(365 * 1440))).toBe('1a');
  });
});

describe('fila de estudo', () => {
  const mk = (id: string, state: State) => ({ id, state }) as never;

  it('respeita o limite diário de novos e conta por estado', () => {
    const due = [mk('a', State.Review), mk('b', State.Learning), mk('c', State.New), mk('d', State.New), mk('e', State.New)];
    const { queue, counts } = buildQueue(due, 2);
    expect(queue.map((c: { id: string }) => c.id)).toEqual(['a', 'b', 'c', 'd']);
    expect(counts).toEqual({ new: 2, learning: 1, review: 1 });
  });

  it('newRemainingToday zera o contador em um novo dia', () => {
    expect(newRemainingToday({ newPerDay: 20, newToday: { day: '2026-01-01', count: 5 } }, '2026-01-01')).toBe(15);
    expect(newRemainingToday({ newPerDay: 20, newToday: { day: '2026-01-01', count: 5 } }, '2026-01-02')).toBe(20);
  });
});

describe('isDue', () => {
  it('cartão novo está sempre disponível; revisão só quando vence', async () => {
    const { isDue } = await import('@/data/queue');
    const ts = (ms: number) => ({ toMillis: () => ms }) as never;
    expect(isDue({ state: State.New, due: ts(Date.now() + 5000) })).toBe(true);
    expect(isDue({ state: State.Review, due: ts(Date.now() + 5000) })).toBe(false);
    expect(isDue({ state: State.Review, due: ts(Date.now() - 1) })).toBe(true);
  });
});
