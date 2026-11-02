import { GoogleAuthProvider, signInWithCredential, signInWithPopup, signInWithRedirect } from 'firebase/auth';

import { auth } from '@/lib/firebase';

export async function signInWithGoogle(): Promise<boolean> {
  // Só no Firebase Auth Emulator: credencial Google de teste (o emulador aceita
  // um id token não assinado). Útil para desenvolvimento e testes automatizados.
  if (process.env.EXPO_PUBLIC_USE_EMULATORS === '1' && process.env.EXPO_PUBLIC_EMULATOR_FAKE_GOOGLE === '1') {
    const fakeToken = JSON.stringify({ sub: 'dev-user', email: 'dev@example.com', email_verified: true, name: 'Dev' });
    await signInWithCredential(auth, GoogleAuthProvider.credential(fakeToken));
    return true;
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await signInWithPopup(auth, provider);
    return true;
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return false;
    if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, provider);
      return true;
    }
    throw e;
  }
}

export async function googleSignOut() {}
