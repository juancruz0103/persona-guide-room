import type { GameInfo } from '../../core/types';
import { bilingual } from '../../i18n';

export const p3rGame: GameInfo = {
  id: 'p3r',
  name: 'Persona 3 Reload',
  shortName: 'P3 RELOAD',
  available: true,
  swatch: '#00AEEF',
  tools: [
    {
      id: 'calculator',
      path: 'calculadora',
      title: 'Calculadora de Personas',
      description: 'Las 194 Personas de Reload con fichas, fusión de dos Personas, búsqueda inversa y fusiones especiales.',
    },
    {
      id: 'links',
      path: 'vinculos',
      title: 'Vínculos sociales',
      description: 'Los 22 vínculos: dónde encontrar a cada uno, cómo empieza y qué responder rango por rango, con los diálogos del juego.',
    },
  ],
};

const TOOLS_EN: Record<string, { title: string; description: string }> = {
  calculator: { title: 'Persona Calculator', description: "Reload's 194 Personas with profiles, two-Persona fusion, reverse search and special fusions." },
  links: { title: 'Social Links', description: 'All 22 Social Links: where to find them, how they start and what to answer at each rank.' },
};
for (const t of p3rGame.tools) bilingual(t, TOOLS_EN[t.id]);
