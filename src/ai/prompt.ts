export type PromptInput = { subject: string; intent: string; count: number };

export function buildPrompt({ subject, intent, count }: PromptInput): string {
  return `Você é um especialista em aprendizagem e em criar flashcards para repetição espaçada (FSRS/Anki).

Crie ${count} flashcards sobre o assunto abaixo, pensando no objetivo do estudante.

ASSUNTO: ${subject.trim()}
OBJETIVO DO ESTUDANTE: ${intent.trim()}

Regras para os cartões:
- Uma única ideia por cartão (princípio da informação mínima).
- A frente é uma pergunta clara e sem ambiguidade, com uma só resposta correta. Ela força a recordação ativa e não é uma pergunta de sim/não.
- O verso é curto e direto (de preferência até ~25 palavras). Se precisar de contexto, inclua uma frase breve depois da resposta.
- Evite listas longas. Divida enumerações em vários cartões.
- Ajuste a profundidade, o vocabulário e o foco ao objetivo do estudante (ex.: prova, trabalho, curiosidade).
- Cubra os conceitos mais importantes primeiro e não repita cartões.
- Escreva no mesmo idioma em que o assunto foi escrito.
- Use "tags" com 1 a 3 palavras-chave curtas por cartão.

Formato da resposta: responda SOMENTE com um JSON válido, sem markdown, sem \`\`\` e sem nenhum texto antes ou depois, exatamente nesta estrutura:
{
  "deck": "título curto sugerido para o baralho",
  "cards": [
    { "front": "pergunta", "back": "resposta", "tags": ["tag"] }
  ]
}
Escape corretamente aspas duplas dentro dos textos (\\").`;
}
