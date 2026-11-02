import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card,
  type Grade,
  type ReviewLog,
} from 'ts-fsrs';

export { Rating, State };
export type { Card, Grade, ReviewLog };

export const DEFAULT_RETENTION = 0.9;

export function makeScheduler(requestRetention = DEFAULT_RETENTION) {
  return fsrs(generatorParameters({ request_retention: requestRetention, enable_fuzz: true }));
}

export function newCardState(now = new Date()): Card {
  return createEmptyCard(now);
}

export const GRADES: { grade: Grade; label: string; key: string }[] = [
  { grade: Rating.Again, label: 'Errei', key: '1' },
  { grade: Rating.Hard, label: 'Difícil', key: '2' },
  { grade: Rating.Good, label: 'Bom', key: '3' },
  { grade: Rating.Easy, label: 'Fácil', key: '4' },
];

/** Intervalo curto para os botões: "<1m", "10m", "3h", "4d", "2me", "1,5a". */
export function formatInterval(from: Date, to: Date): string {
  const min = Math.round((to.getTime() - from.getTime()) / 60000);
  if (min < 1) return '<1m';
  if (min < 60) return `${min}m`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d`;
  if (d < 365) return `${Math.round(d / 30)}me`;
  return `${(d / 365).toFixed(1).replace('.', ',').replace(',0', '')}a`;
}
