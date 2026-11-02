import { parseCards, type ParseResult } from './parse';
import { buildPrompt, type PromptInput } from './prompt';
import { geminiResponseSchema } from './schema';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export class GeminiError extends Error {}

function messageForStatus(status: number, detail?: string): string {
  if (status === 400 && detail?.toLowerCase().includes('api key')) return 'Chave de API inválida.';
  if (status === 400) return `Requisição recusada pelo Gemini${detail ? `: ${detail}` : '.'}`;
  if (status === 401 || status === 403) return 'Chave de API inválida ou sem permissão para este modelo.';
  if (status === 404) return 'Modelo não encontrado. Confira o nome do modelo nas configurações.';
  if (status === 429) return 'Limite de uso do Gemini atingido. Aguarde um pouco e tente de novo.';
  if (status >= 500) return 'O Gemini está indisponível no momento. Tente de novo em instantes.';
  return `Erro ${status} ao chamar o Gemini.`;
}

async function callGemini(apiKey: string, model: string, body: unknown, fetchImpl: typeof fetch): Promise<unknown> {
  let res: Response;
  try {
    res = await fetchImpl(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify(body),
      },
    );
  } catch {
    throw new GeminiError('Sem conexão com o Gemini. Verifique sua internet.');
  }
  const json = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
  if (!res.ok) throw new GeminiError(messageForStatus(res.status, json?.error?.message));
  return json;
}

function textOf(response: unknown): string {
  const r = response as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return (r?.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('');
}

export async function generateCardsWithGemini(
  input: PromptInput & { apiKey: string; model?: string },
  fetchImpl: typeof fetch = fetch,
): Promise<ParseResult> {
  const response = await callGemini(
    input.apiKey,
    input.model || DEFAULT_GEMINI_MODEL,
    {
      contents: [{ role: 'user', parts: [{ text: buildPrompt(input) }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: geminiResponseSchema },
    },
    fetchImpl,
  );
  const text = textOf(response);
  if (!text) throw new GeminiError('O Gemini não retornou conteúdo. Tente novamente.');
  return parseCards(text);
}

/** Faz uma chamada mínima para validar chave e modelo. */
export async function testGeminiKey(apiKey: string, model = DEFAULT_GEMINI_MODEL, fetchImpl: typeof fetch = fetch) {
  await callGemini(
    apiKey,
    model,
    { contents: [{ role: 'user', parts: [{ text: 'Responda apenas: ok' }] }], generationConfig: { maxOutputTokens: 5 } },
    fetchImpl,
  );
}
