import { describe, expect, it } from 'vitest';
import { getAllPersonas, getAllSkills, getPersona } from './personas';
import { filterPersonas, DEFAULT_FILTERS } from './personas';
import { itemName, personaName, personaNameEn, skillDescription, skillName } from './gameText';

describe('textos oficiales del juego', () => {
  it('todas las Personas y skills tienen nombre en español', () => {
    for (const p of getAllPersonas()) expect(personaName(p), p.name).not.toBe('');
    const sinTraducir = getAllPersonas().filter((p) => !personaNameEn(p));
    expect(sinTraducir).toHaveLength(0);
    for (const s of getAllSkills()) expect(skillName(s.name)).toBeTruthy();
  });

  it('nombres oficiales conocidos', () => {
    expect(personaName(getPersona('beelzebub')!)).toBe('Belcebú');
    expect(personaName(getPersona('cerberus')!)).toBe('Cerbero');
    expect(skillName('Brave Blade')).toBe('Filo valeroso');
    expect(skillName('Megaton Raid')).toBe('Ataque megatón');
    expect(itemName('Megaton Raid Belt')).toBe('Cinturón megatón');
    expect(skillDescription('Agi')).toBe('Daño de fuego leve a un enemigo. Puede infligir Quemadura.');
  });

  it('Orfeo hombre y mujer no se confunden', () => {
    const names = getAllPersonas().filter((p) => p.name.startsWith('Orpheus')).map(personaName);
    expect(new Set(names).size).toBe(names.length);
  });

  it('el catálogo busca en español y en inglés', () => {
    const all = getAllPersonas();
    const es = filterPersonas(all, { ...DEFAULT_FILTERS, query: 'belcebu' });
    const en = filterPersonas(all, { ...DEFAULT_FILTERS, query: 'beelzebub' });
    expect(es.map((p) => p.id)).toContain('beelzebub');
    expect(en.map((p) => p.id)).toContain('beelzebub');
  });
});
