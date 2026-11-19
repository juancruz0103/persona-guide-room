import { describe, expect, it } from 'vitest';
import { CONFIDANTS, loadConfidant } from './confidants';

const unlocksAt = async (id: string, rank: number) =>
  (await loadConfidant(id))!.ranks.find((r) => r.rank === rank)!.unlocks.map((u) => u.name);

describe('confidentes de Persona 5 original', () => {
  it('21 confidentes, sin Kasumi ni Maruki', () => {
    expect(CONFIDANTS).toHaveLength(21);
    expect(CONFIDANTS.some((c) => c.id === 'kasumi' || c.id === 'maruki')).toBe(false);
  });
  it('sin llamadas', async () => {
    for (const c of CONFIDANTS) {
      const d = await loadConfidant(c.id);
      for (const r of d!.ranks) expect(r.conversations.some((x) => 'kind' in x && x.kind === 'phone')).toBe(false);
    }
  });
  it('Ryuji: Relevo en el 2, Mediación agresiva en el 4, sin Esprint sigiloso', async () => {
    expect(await unlocksAt('ryuji', 2)).toEqual(['Relevo']);
    expect(await unlocksAt('ryuji', 4)).toEqual(['Mediación agresiva']);
    expect(await unlocksAt('ryuji', 10)).not.toContain('Segundo despertar R');
  });
  it('Ann: Relevo en el 1 y Seducción en el 7', async () => {
    expect(await unlocksAt('ann', 1)).toContain('Relevo');
    expect(await unlocksAt('ann', 7)).toContain('Seducción');
    expect(await unlocksAt('ann', 4)).not.toContain('Seducción');
  });
  it('Akechi sube solo con la historia', async () => {
    const a = await loadConfidant('akechi');
    expect(a!.kind).toBe('auto');
    expect(a!.timeline?.find((t) => t.rank === 6)?.ability).toBe('Relevo');
  });
  it('Caroline y Justine: pedidos del original', async () => {
    const s = await loadConfidant('caroline-justine');
    expect(s!.requests!.map((r) => r.persona).slice(0, 5)).toEqual(['jack-frost', 'shiisaa', 'matador', 'flauros', 'ame-no-uzume']);
  });
});
