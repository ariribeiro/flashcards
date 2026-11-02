import type { FirebaseApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, setPersistence, type Auth } from 'firebase/auth';

export function createAuth(app: FirebaseApp): Auth {
  const auth = getAuth(app);
  void setPersistence(auth, browserLocalPersistence);
  return auth;
}
