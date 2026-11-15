import { describe, expect, it } from 'vitest';
import { eventsByRank, getAllLinks, maxPersona } from './links';

describe('vínculos P3R', () => {
  it('tiene los 22 vínculos, uno por Arcana', () => {
    const links = getAllLinks();
    expect(links).toHaveLength(22);
    expect(new Set(links.map((l) => l.arcana)).size).toBe(22);
  });
  it('los vínculos con diálogo tienen respuestas con puntos', () => {
    for (const l of getAllLinks().filter((x) => !x.auto)) {
      const opts = eventsByRank(l.arcana).flatMap((g) => g.events.flatMap((e) => e.choices.flatMap((c) => c.opts)));
      expect(opts.some((o) => o.pts > 0), l.arcana).toBe(true);
      expect(opts.every((o) => o.es && o.en), l.arcana).toBe(true);
    }
  });
  it('conoce la Persona final de cada vínculo con historia propia', () => {
    expect(maxPersona('magician')?.name).toBe('Futsunushi');
    expect(maxPersona('aeon')?.name).toBe('Metatron');
  });
  it('separa las rutas de romance y amistad', () => {
    const routes = eventsByRank('lovers').map((g) => g.route);
    expect(routes).toContain('R');
    expect(routes).toContain('P');
  });
});
