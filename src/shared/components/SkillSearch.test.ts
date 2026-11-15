import { describe, expect, it } from 'vitest';
import { searchSkills } from './SkillSearch';
import { SKILLS } from '../../games/p3r/services/text';

const opts = Object.entries(SKILLS).map(([k, v]) => ({ key: k, label: v.nameEs ?? k, alt: k }));

describe('buscador de habilidades', () => {
  it('encuentra sin tildes y por cualquier palabra', () => {
    expect(searchSkills(opts, 'unico', 50).map((o) => o.key)).toContain('Single-Target Boost');
  });
  it('busca también en inglés y con varias palabras', () => {
    expect(searchSkills(opts, 'almighty boost').map((o) => o.key)).toContain('Almighty Boost');
    expect(searchSkills(opts, 'potenciacion todopoderoso').map((o) => o.key)).toContain('Almighty Boost');
  });
});
