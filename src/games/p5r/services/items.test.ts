import { describe, expect, it } from 'vitest';
import { getAllPersonas, getPersona } from './personas';
import { NO_DAMAGE, filterSkillCardRows, getItem, getSkillCardRows, itemDescription, itemTypeLabel, skillCardSources, sortByPower } from './items';
import { describeCost } from './skillText';
import { getSkill } from './personas';

describe('items de la silla eléctrica', () => {
  it('todas las Personas con item tienen ese item en la base', () => {
    for (const p of getAllPersonas()) {
      if (p.itemization) expect(getItem(p.itemization), p.itemization).toBeDefined();
      if (p.itemizationAlt) expect(getItem(p.itemizationAlt), p.itemizationAlt).toBeDefined();
    }
  });

  it('Abaddon da Megaton Raid Belt y con alarma God\'s Hand Belt (accesorios)', () => {
    const p = getPersona('abaddon')!;
    expect(p.itemization).toBe('Megaton Raid Belt');
    expect(p.itemizationAlt).toBe("God's Hand Belt");
    const it = getItem(p.itemization)!;
    expect(it.type).toBe('accessory');
    expect(it.skill).toBe('Megaton Raid');
    expect(itemTypeLabel(it)).toBe('Accesorio');
    const d = itemDescription(it);
    // Primero la descripción oficial, después qué skill da (con su nombre en español)
    expect(d.lines[0].text).toBe('Cinturón que permite asestar un golpe grave.');
    expect(d.lines[1].text).toContain('Ataque megatón');
    expect(d.lines[1].cost).toEqual({ text: '16% HP', kind: 'hp' });
  });

  it('las armas de P5 traen estadísticas y una advertencia', () => {
    const it = getItem("Arsene's Cane")!;
    expect(it.type).toBe('melee');
    expect(it.owner).toBe('joker');
    const d = itemDescription(it);
    expect(d.lines.some((l) => l.text.includes('Ataque 130'))).toBe(true);
    expect(d.note).toMatch(/P5 original/);
  });

  it('un item sin datos no inventa números', () => {
    const d = itemDescription({ name: 'Inventado', type: 'unknown', source: null } as Parameters<typeof itemDescription>[0]);
    expect(d.lines.every((l) => !/\d/.test(l.text))).toBe(true);
    expect(d.note).toMatch(/falta confirmar/);
  });

  it('un item comprobado en el juego muestra sus números y lo dice', () => {
    const it = getItem('Ancient Day')!;
    expect(it.type).toBe('gun');
    const d = itemDescription(it);
    expect(d.lines.some((l) => l.text.includes('Ataque 420'))).toBe(true);
    expect(d.note).toMatch(/Comprobado en el juego/);
  });
});

describe('skill cards', () => {
  it('costos: HP en porcentaje, SP en puntos', () => {
    expect(describeCost(getSkill('Mabufudyne')!)).toEqual({ text: '22 SP', kind: 'sp' });
    expect(describeCost(getSkill('Brave Blade')!)).toEqual({ text: '24% HP', kind: 'hp' });
  });

  it('Bufudyne: Baphomet normal y Belphegor con alarma', () => {
    const src = skillCardSources('Bufudyne').map((s) => [s.persona.name, s.alarm]);
    expect(src).toContainEqual(['Baphomet', false]);
    expect(src).toContainEqual(['Belphegor', true]);
  });

  it('las exclusivas no tienen skill card', () => {
    const rows = getSkillCardRows();
    const excl = rows.filter((r) => r.exclusive);
    expect(excl.length).toBeGreaterThan(0);
    for (const r of excl) expect(r.cards).toHaveLength(0);
    expect(rows.find((r) => r.skill.name === 'Myriad Truths')?.exclusive).toBe(true);
  });

  it('los rasgos no aparecen en la lista', () => {
    expect(getSkillCardRows().some((r) => r.skill.element === 'tra')).toBe(false);
  });

  it('filtros: tipo, elemento y búsqueda por Persona', () => {
    const rows = getSkillCardRows();
    const alarm = filterSkillCardRows(rows, { query: '', type: 'alarm', element: null });
    expect(alarm.every((r) => r.cards.some((c) => c.alarm))).toBe(true);
    const ice = filterSkillCardRows(rows, { query: '', type: 'all', element: 'ice' });
    expect(ice.length).toBeGreaterThan(0);
    expect(ice.every((r) => r.skill.element === 'ice')).toBe(true);
    const byPersona = filterSkillCardRows(rows, { query: 'baphomet', type: 'all', element: null });
    expect(byPersona.map((r) => r.skill.name)).toContain('Bufudyne');
  });
});

describe('filtros y orden de skill cards', () => {
  const rows = getSkillCardRows();
  it('«Fusión normal» deja solo skills con skill card sin alarma; «Alarma» las que piden alarma', () => {
    const normal = filterSkillCardRows(rows, { query: '', type: 'normal', element: null });
    expect(normal.length).toBeGreaterThan(0);
    expect(normal.every((r) => r.cards.some((c) => !c.alarm))).toBe(true);
    const alarm = filterSkillCardRows(rows, { query: '', type: 'alarm', element: null });
    expect(alarm.every((r) => r.cards.some((c) => c.alarm))).toBe(true);
    const excl = filterSkillCardRows(rows, { query: '', type: 'excl', element: null });
    expect(excl.every((r) => r.exclusive && r.cards.length === 0)).toBe(true);
  });

  it('ordenar por daño no agrega ni quita skills y respeta el sentido', () => {
    const fire = filterSkillCardRows(rows, { query: '', type: 'all', element: 'fir' });
    const desc = sortByPower(fire, 'desc');
    expect(desc.map((r) => r.skill.name).sort()).toEqual(fire.map((r) => r.skill.name).sort());
    const p = desc.map((r) => r.skill.power ?? -1);
    for (let i = 1; i < p.length; i++) expect(p[i - 1]).toBeGreaterThanOrEqual(p[i]);
    expect(sortByPower(fire, 'asc')[0].skill.power).toBe(Math.min(...fire.map((r) => r.skill.power ?? Infinity)));
  });

  it('sanación, apoyo, pasivas y estados alterados no se ordenan por daño', () => {
    for (const e of ['rec', 'sup', 'pas', 'ail'] as const) expect(NO_DAMAGE.has(e)).toBe(true);
    expect(NO_DAMAGE.has('fir')).toBe(false);
  });
});
