import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

import { auth } from '@/lib/firebase';

let configured = false;
function configure() {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
  configured = true;
}

/** Retorna false se o usuário cancelou. */
export async function signInWithGoogle(): Promise<boolean> {
  configure();
  try {
    const res = await GoogleSignin.signIn();
    if (!isSuccessResponse(res)) return false;
    const idToken = res.data.idToken;
    if (!idToken) throw new Error('O Google não retornou um idToken. Confira o webClientId.');
    await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
    return true;
  } catch (e) {
    if (isErrorWithCode(e) && (e.code === statusCodes.SIGN_IN_CANCELLED || e.code === statusCodes.IN_PROGRESS)) return false;
    throw e;
  }
}

export async function googleSignOut() {
  configure();
  try {
    await GoogleSignin.signOut();
  } catch {
    // sem sessão Google nativa: nada a fazer
  }
}
