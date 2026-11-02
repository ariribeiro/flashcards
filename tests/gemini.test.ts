import { describe, expect, it, vi } from 'vitest';

import { GeminiError, generateCardsWithGemini } from '@/ai/gemini';

const input = { subject: 'Krebs', intent: 'prova', count: 2, apiKey: 'KEY' };
const resp = (status: number, body: unknown) =>
  vi.fn().mockResolvedValue({ ok: status < 400, status, json: async () => body }) as unknown as typeof fetch;

describe('generateCardsWithGemini', () => {
  it('envia a chave no header, usa saída estruturada e lê os cartões', async () => {
    const text = JSON.stringify({ cards: [{ front: 'a', back: 'b' }] });
    const f = resp(200, { candidates: [{ content: { parts: [{ text }] } }] });
    const r = await generateCardsWithGemini(input, f);
    expect(r.ok && r.cards).toEqual([{ front: 'a', back: 'b' }]);

    const [url, init] = (f as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('gemini-2.5-flash:generateContent');
    expect(init.headers['x-goog-api-key']).toBe('KEY');
    const body = JSON.parse(init.body);
    expect(body.generationConfig.responseMimeType).toBe('application/json');
    expect(body.generationConfig.responseSchema.required).toEqual(['cards']);
  });

  it('traduz 403 e 429 em mensagens claras', async () => {
    await expect(generateCardsWithGemini(input, resp(403, {}))).rejects.toThrow(/inválida/);
    await expect(generateCardsWithGemini(input, resp(429, {}))).rejects.toThrow(/Limite/);
  });

  it('erro de rede vira GeminiError', async () => {
    const f = vi.fn().mockRejectedValue(new TypeError('fail')) as unknown as typeof fetch;
    await expect(generateCardsWithGemini(input, f)).rejects.toBeInstanceOf(GeminiError);
  });
});
