import type { GameInfo } from '../../core/types';
import { bilingual } from '../../i18n';

export const p5sGame: GameInfo = {
  id: 'p5s',
  name: 'Persona 5 Strikers',
  shortName: 'P5 STRIKERS',
  available: true,
  swatch: '#E8304F',
  tools: [
    {
      id: 'calculator',
      path: 'calculadora',
      title: 'Catálogo de Personas',
      description: 'Las Personas de Strikers con sus estadísticas, afinidades, habilidades y dónde encontrar cada una.',
    },
  ],
};

const TOOLS_EN: Record<string, { title: string; description: string }> = {
  calculator: { title: 'Persona catalog', description: "Strikers' Personas with their stats, affinities, skills and where to find each one." },
};
for (const t of p5sGame.tools) bilingual(t, TOOLS_EN[t.id]);
