import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FirebaseApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';

// No React Native, o Metro resolve `firebase/auth` para o build RN, que exporta
// getReactNativePersistence. Os tipos padrão (web) não o declaram.
const { getReactNativePersistence } = FirebaseAuth as unknown as {
  getReactNativePersistence: (storage: typeof AsyncStorage) => FirebaseAuth.Persistence;
};

export function createAuth(app: FirebaseApp): FirebaseAuth.Auth {
  try {
    return FirebaseAuth.initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Fast refresh: auth já inicializado.
    return FirebaseAuth.getAuth(app);
  }
}
