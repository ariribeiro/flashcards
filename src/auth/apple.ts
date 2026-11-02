import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { OAuthProvider, signInWithCredential } from 'firebase/auth';

import { auth } from '@/lib/firebase';

// EXPO_PUBLIC_APPLE_SIGNIN=0: build para conta Apple gratuita, sem Sign in with Apple.
export const appleSignInAvailable = async () =>
  process.env.EXPO_PUBLIC_APPLE_SIGNIN !== '0' && (await AppleAuthentication.isAvailableAsync());

/** Sign in with Apple (exigido pela App Store quando há login com Google). */
export async function signInWithApple(): Promise<boolean> {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  try {
    const cred = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
    if (!cred.identityToken) throw new Error('A Apple não retornou um identityToken.');
    const provider = new OAuthProvider('apple.com');
    await signInWithCredential(auth, provider.credential({ idToken: cred.identityToken, rawNonce }));
    return true;
  } catch (e) {
    if ((e as { code?: string }).code === 'ERR_REQUEST_CANCELED') return false;
    throw e;
  }
}
