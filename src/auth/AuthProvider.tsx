import { onAuthStateChanged, signOut as fbSignOut, type User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { auth } from '@/lib/firebase';

import { googleSignOut } from './google';

type AuthState = { user: User | null; initializing: boolean; signOut: () => Promise<void> };

const Ctx = createContext<AuthState>({ user: null, initializing: true, signOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [initializing, setInitializing] = useState(true);

  useEffect(
    () =>
      onAuthStateChanged(auth, (u) => {
        setUser(u);
        setInitializing(false);
      }),
    [],
  );

  const signOut = async () => {
    await googleSignOut();
    await fbSignOut(auth);
  };

  return <Ctx.Provider value={{ user, initializing, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
