import { z } from 'zod';

export const CardSchema = z.object({
  front: z.string().trim().min(1, 'falta `front`'),
  back: z.string().trim().min(1, 'falta `back`'),
  tags: z.array(z.string()).optional(),
});

export type GeneratedCard = z.infer<typeof CardSchema>;

/** Schema no formato OpenAPI aceito pelo `responseSchema` do Gemini. */
export const geminiResponseSchema = {
  type: 'OBJECT',
  properties: {
    deck: { type: 'STRING' },
    cards: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          front: { type: 'STRING' },
          back: { type: 'STRING' },
          tags: { type: 'ARRAY', items: { type: 'STRING' } },
        },
        required: ['front', 'back'],
      },
    },
  },
  required: ['cards'],
} as const;
