import * as SecureStore from 'expo-secure-store';

// iOS: Keychain. A chave nunca vai para o Firestore.
const KEY = 'gemini_api_key';
const MODEL = 'gemini_model';

export const getGeminiKey = () => SecureStore.getItemAsync(KEY);
export const setGeminiKey = (v: string) => SecureStore.setItemAsync(KEY, v);
export const removeGeminiKey = () => SecureStore.deleteItemAsync(KEY);
export const getGeminiModel = () => SecureStore.getItemAsync(MODEL);
export const setGeminiModel = (v: string) => SecureStore.setItemAsync(MODEL, v);
