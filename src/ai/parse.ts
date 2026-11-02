import { CardSchema, type GeneratedCard } from './schema';

export type ParseResult =
  | { ok: true; title?: string; cards: GeneratedCard[]; errors: string[] }
  | { ok: false; error: string };

/** Extrai o trecho JSON de uma resposta de LLM (tolera ```json, texto antes e depois). */
export function extractJson(raw: string): string {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  const firstObj = text.indexOf('{');
  const firstArr = text.indexOf('[');
  const isArray = firstArr !== -1 && (firstObj === -1 || firstArr < firstObj);
  const start = isArray ? firstArr : firstObj;
  const end = isArray ? text.lastIndexOf(']') : text.lastIndexOf('}');
  if (start === -1 || end <= start) return text;
  return text.slice(start, end + 1);
}

/**
 * Converte a resposta da IA em cartões. Aceita `{ deck, cards: [...] }` ou só `[...]`.
 * Cartões inválidos são ignorados e listados em `errors` (ex.: "cartão 7: falta `back`").
 */
export function parseCards(raw: string): ParseResult {
  if (!raw.trim()) return { ok: false, error: 'Cole a resposta da IA.' };

  let data: unknown;
  try {
    data = JSON.parse(extractJson(raw));
  } catch {
    return { ok: false, error: 'Não foi possível ler o JSON. Confira se a resposta está completa.' };
  }

  let title: string | undefined;
  let items: unknown;
  if (Array.isArray(data)) {
    items = data;
  } else if (data && typeof data === 'object' && Array.isArray((data as { cards?: unknown }).cards)) {
    items = (data as { cards: unknown[] }).cards;
    const deck = (data as { deck?: unknown }).deck;
    if (typeof deck === 'string' && deck.trim()) title = deck.trim();
  } else {
    return { ok: false, error: 'O JSON precisa ter uma lista "cards".' };
  }

  const cards: GeneratedCard[] = [];
  const errors: string[] = [];
  (items as unknown[]).forEach((item, i) => {
    const r = CardSchema.safeParse(item);
    if (r.success) cards.push(r.data);
    else errors.push(`cartão ${i + 1}: ${r.error.issues.map((x) => x.message).join(', ')}`);
  });

  if (cards.length === 0) {
    return { ok: false, error: errors.length ? `Nenhum cartão válido (${errors[0]}).` : 'A lista de cartões está vazia.' };
  }
  return { ok: true, title, cards, errors };
}
