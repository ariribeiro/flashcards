import { describe, expect, it } from 'vitest';

import { parseCards } from '@/ai/parse';
import { buildPrompt } from '@/ai/prompt';

const valid = { deck: 'Krebs', cards: [{ front: 'Onde ocorre?', back: 'Na matriz mitocondrial', tags: ['bio'] }, { front: 'Produto?', back: 'NADH' }] };

describe('parseCards', () => {
  it('lê JSON válido', () => {
    const r = parseCards(JSON.stringify(valid));
    expect(r.ok && r.cards.length).toBe(2);
    expect(r.ok && r.title).toBe('Krebs');
  });

  it('aceita JSON dentro de ```json e texto em volta', () => {
    const r = parseCards('Claro! Aqui estão:\n```json\n' + JSON.stringify(valid) + '\n```\nBons estudos!');
    expect(r.ok && r.cards.length).toBe(2);
  });

  it('aceita texto antes e depois sem cercas', () => {
    const r = parseCards('Segue: ' + JSON.stringify(valid) + ' fim.');
    expect(r.ok).toBe(true);
  });

  it('aceita um array direto', () => {
    const r = parseCards(JSON.stringify(valid.cards));
    expect(r.ok && r.cards.length).toBe(2);
  });

  it('ignora cartões inválidos e informa o erro', () => {
    const r = parseCards(JSON.stringify({ cards: [valid.cards[0], { front: 'sem verso' }] }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.cards).toHaveLength(1);
      expect(r.errors[0]).toMatch(/cartão 2/);
    }
  });

  it('falha com lista vazia, JSON quebrado ou entrada vazia', () => {
    expect(parseCards('{"cards": []}').ok).toBe(false);
    expect(parseCards('{"cards": [{"front": "a"').ok).toBe(false);
    expect(parseCards('   ').ok).toBe(false);
    expect(parseCards('{"foo": 1}').ok).toBe(false);
  });
});

describe('buildPrompt', () => {
  it('inclui assunto, objetivo, quantidade e o formato JSON', () => {
    const p = buildPrompt({ subject: 'Ciclo de Krebs', intent: 'prova', count: 15 });
    expect(p).toContain('Ciclo de Krebs');
    expect(p).toContain('prova');
    expect(p).toContain('15 flashcards');
    expect(p).toContain('"cards"');
  });
});
