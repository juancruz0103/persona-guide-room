import { it, expect } from 'vitest';
import { BOND_SKILLS } from './bond';
it('suma', () => { expect(BOND_SKILLS.length).toBe(30); expect(BOND_SKILLS.reduce((a, s) => a + s.total, 0)).toBe(1449); });
