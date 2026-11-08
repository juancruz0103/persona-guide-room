import { describe, expect, it } from 'vitest';
import { analyzeConversation } from './confidants';
import ryuji from '../data/confidants/ryuji.json';
import type { Confidant } from '../types';

const data = ryuji as Confidant;

describe('analyzeConversation', () => {
  it('detecta la mejor opción del rango 2 de Ryuji', () => {
    const rank2 = data.ranks.find((r) => r.rank === 2)!;
    const r = analyzeConversation(rank2.conversations[0]);
    expect(r).toEqual({ max: 3, allSame: false });
  });

  it('marca cuando todas las opciones dan lo mismo', () => {
    const rank2 = data.ranks.find((r) => r.rank === 2)!;
    expect(analyzeConversation(rank2.conversations[1]).allSame).toBe(true);
  });
});
