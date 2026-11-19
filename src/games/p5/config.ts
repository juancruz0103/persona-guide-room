import type { GameInfo } from '../../core/types';
import { bilingual } from '../../i18n';

export const p5Game: GameInfo = {
  id: 'p5',
  name: 'Persona 5',
  shortName: 'P5',
  available: true,
  swatch: '#873F35',
  tools: [
    {
      id: 'calculator',
      path: 'calculadora',
      title: 'Calculadora de Personas',
      description: 'Las 210 Personas de Persona 5 original con sus fusiones, estadísticas, afinidades y habilidades (sin lo que agregó Royal).',
    },
  ],
};

const TOOLS_EN: Record<string, { title: string; description: string }> = {
  calculator: { title: 'Persona Calculator', description: "The original Persona 5's 210 Personas with their fusions, stats, affinities and skills (without Royal's additions)." },
};
for (const t of p5Game.tools) bilingual(t, TOOLS_EN[t.id]);
