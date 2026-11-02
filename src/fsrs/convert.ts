import { Timestamp } from 'firebase/firestore';
import type { Card, ReviewLog } from 'ts-fsrs';

/** Campos FSRS como são guardados no Firestore. */
export type StoredFsrs = {
  due: Timestamp;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review: Timestamp | null;
};

export function fsrsToFirestore(c: Card): StoredFsrs {
  return {
    due: Timestamp.fromDate(c.due),
    stability: c.stability,
    difficulty: c.difficulty,
    elapsed_days: c.elapsed_days,
    scheduled_days: c.scheduled_days,
    learning_steps: c.learning_steps,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state,
    last_review: c.last_review ? Timestamp.fromDate(c.last_review) : null,
  };
}

export function fsrsFromFirestore(s: StoredFsrs): Card {
  return {
    due: s.due.toDate(),
    stability: s.stability,
    difficulty: s.difficulty,
    elapsed_days: s.elapsed_days,
    scheduled_days: s.scheduled_days,
    learning_steps: s.learning_steps ?? 0,
    reps: s.reps,
    lapses: s.lapses,
    state: s.state,
    last_review: s.last_review ? s.last_review.toDate() : undefined,
  };
}

export function reviewLogToFirestore(cardId: string, log: ReviewLog) {
  return {
    cardId,
    rating: log.rating,
    state: log.state,
    due: Timestamp.fromDate(log.due),
    stability: log.stability,
    difficulty: log.difficulty,
    elapsed_days: log.elapsed_days,
    last_elapsed_days: log.last_elapsed_days,
    scheduled_days: log.scheduled_days,
    learning_steps: log.learning_steps,
    review: Timestamp.fromDate(log.review),
  };
}
