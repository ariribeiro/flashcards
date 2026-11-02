import { addDoc, deleteDoc, getDocs, limit, query, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';

import { db } from '@/lib/firebase';

import { cardsCol, deckDoc, decksCol, reviewLogsCol } from './paths';
import type { Deck } from './types';

import { DEFAULT_NEW_PER_DAY } from './queue';

export { DEFAULT_NEW_PER_DAY };

export async function createDeck(name: string, description = ''): Promise<string> {
  const ref = await addDoc(decksCol(), {
    name: name.trim(),
    description: description.trim(),
    createdAt: serverTimestamp(),
    cardCount: 0,
    newPerDay: DEFAULT_NEW_PER_DAY,
  });
  return ref.id;
}

export function updateDeck(deckId: string, data: Partial<Pick<Deck, 'name' | 'description' | 'newPerDay'>>) {
  return updateDoc(deckDoc(deckId), data);
}

async function deleteAllIn(col: ReturnType<typeof cardsCol>) {
  // Lotes de até 400 documentos (limite do writeBatch é 500).
  for (;;) {
    const snap = await getDocs(query(col, limit(400)));
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

export async function deleteDeck(deckId: string) {
  await deleteAllIn(cardsCol(deckId));
  await deleteAllIn(reviewLogsCol(deckId));
  await deleteDoc(deckDoc(deckId));
}

export { newRemainingToday } from './queue';
