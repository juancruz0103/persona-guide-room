import type { GameInfo } from '../../core/types';
import { bilingual } from '../../i18n';

export const p4gGame: GameInfo = {
  id: 'p4g',
  name: 'Persona 4 Golden',
  shortName: 'P4 GOLDEN',
  available: true,
  swatch: '#A87912',
  tools: [
    {
      id: 'calculator',
      path: 'calculadora',
      title: 'Calculadora de Personas',
      description: 'Las Personas del Golden con sus ilustraciones oficiales, fichas, fusión de dos Personas, búsqueda inversa y fusiones especiales.',
    },
  ],
};

const TOOLS_EN: Record<string, { title: string; description: string }> = {
  calculator: { title: 'Persona Calculator', description: "Golden's Personas with their official artwork, profiles, two-Persona fusion, reverse search and special fusions." },
};
for (const t of p4gGame.tools) bilingual(t, TOOLS_EN[t.id]);
