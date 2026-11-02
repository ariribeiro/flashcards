import { collection, doc } from 'firebase/firestore';

import { db, requireUid } from '@/lib/firebase';

export const decksCol = () => collection(db, 'users', requireUid(), 'decks');
export const deckDoc = (deckId: string) => doc(decksCol(), deckId);
export const cardsCol = (deckId: string) => collection(deckDoc(deckId), 'cards');
export const cardDoc = (deckId: string, cardId: string) => doc(cardsCol(deckId), cardId);
export const reviewLogsCol = (deckId: string) => collection(deckDoc(deckId), 'reviewLogs');
export const settingsDoc = () => doc(db, 'users', requireUid(), 'settings', 'fsrs');
