import { describe, expect, it } from 'vitest';
import { analyzeConversation } from './confidants';
import ryuji from '../data/confidants/ryuji.json';
import type { Confidant, Conversation } from '../types';

const data = ryuji as Confidant;

describe('analyzeConversation', () => {
  it('detecta la mejor opción del rango 2 de Ryuji', () => {
    const rank2 = data.ranks.find((r) => r.rank === 2)!;
    const r = analyzeConversation(rank2.conversations[0] as Conversation);
    expect(r).toEqual({ max: 3, allSame: false, hasRecommended: false });
  });

  it('marca cuando todas las opciones dan lo mismo', () => {
    const rank2 = data.ranks.find((r) => r.rank === 2)!;
    expect(analyzeConversation(rank2.conversations[1] as Conversation).allSame).toBe(true);
  });
});

import { CONFIDANTS, getConfidantSummary, ultimatePersona } from './confidants';
import { getPersona as getP } from './personas';

describe('los 23 confidentes', () => {
  it('están todos, con su tipo', () => {
    expect(CONFIDANTS).toHaveLength(23);
    expect(CONFIDANTS.filter((c) => c.kind === 'auto').map((c) => c.id).sort()).toEqual(['igor', 'morgana', 'sae']);
    expect(getConfidantSummary('caroline-justine')?.kind).toBe('fusion');
  });

  it('cada Arcana de confidente desbloquea su Persona al rango 10', () => {
    for (const c of CONFIDANTS) expect(ultimatePersona(c.arcana), c.id).toBeDefined();
    expect(ultimatePersona('chariot')?.name).toBe('Chi You');
  });

  it('los Ladrones Fantasma enlazan su Persona inicial', () => {
    for (const c of CONFIDANTS.filter((x) => x.phantomThief)) {
      expect(c.persona, c.id).toBeDefined();
      expect(getP(c.persona!)?.party?.stage, c.id).toBe('initial');
    }
  });

  it('una opción recomendada sin puntos es la mejor y no cuenta como «todas iguales»', () => {
    const r = analyzeConversation({
      kind: 'conversation',
      royalOnly: false,
      romance: false,
      speaker: 'Chihaya',
      prompt: { es: '', en: '' },
      options: [
        { es: 'a', en: 'a', points: 0 },
        { es: 'b', en: 'b', points: 0, recommended: true },
      ],
    });
    expect(r).toEqual({ max: 0, allSame: false, hasRecommended: true });
  });
});
