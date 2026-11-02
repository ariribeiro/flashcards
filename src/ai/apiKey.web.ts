// Web: localStorage deste navegador. A chave nunca vai para o Firestore.
const KEY = 'gemini_api_key';
const MODEL = 'gemini_model';

function get(k: string): Promise<string | null> {
  try {
    return Promise.resolve(window.localStorage.getItem(k));
  } catch {
    return Promise.resolve(null);
  }
}
function set(k: string, v: string): Promise<void> {
  try {
    window.localStorage.setItem(k, v);
  } catch {
    // armazenamento indisponível (ex.: navegação privada)
  }
  return Promise.resolve();
}

export const getGeminiKey = () => get(KEY);
export const setGeminiKey = (v: string) => set(KEY, v);
export const removeGeminiKey = () => {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
  return Promise.resolve();
};
export const getGeminiModel = () => get(MODEL);
export const setGeminiModel = (v: string) => set(MODEL, v);
