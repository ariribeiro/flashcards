import { persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';

export const firestoreCache = () =>
  persistentLocalCache({ tabManager: persistentMultipleTabManager() });
