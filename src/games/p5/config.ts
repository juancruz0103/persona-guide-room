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
    {
      id: 'confidants',
      path: 'confidentes',
      title: 'Confidentes',
      description: 'Los 21 confidentes del original con las mejores respuestas y las habilidades de cada rango (sin llamadas, Kasumi ni Maruki).',
    },
  ],
};

const TOOLS_EN: Record<string, { title: string; description: string }> = {
  confidants: { title: 'Confidants', description: "The original's 21 confidants with the best answers and each rank's abilities (no phone calls, Kasumi or Maruki)." },
  calculator: { title: 'Persona Calculator', description: "The original Persona 5's 210 Personas with their fusions, stats, affinities and skills (without Royal's additions)." },
};
for (const t of p5Game.tools) bilingual(t, TOOLS_EN[t.id]);
