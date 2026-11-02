import { memoryLocalCache } from 'firebase/firestore';

// No nativo o SDK JS não tem IndexedDB: cache em memória. Gravações feitas
// offline ficam na fila enquanto o app estiver aberto.
export const firestoreCache = () => memoryLocalCache();
