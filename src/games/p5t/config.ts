import type { GameInfo } from '../../core/types';
import { bilingual } from '../../i18n';

export const p5tGame: GameInfo = {
  id: 'p5t',
  name: 'Persona 5 Tactica',
  shortName: 'P5 TACTICA',
  available: true,
  swatch: '#A83232',
  tools: [
    {
      id: 'calculator',
      path: 'calculadora',
      title: 'Calculadora de Personas',
      description: 'Las Personas de Tactica con sus fusiones normales y especiales, estadísticas y habilidad única, sacadas de los archivos del juego.',
    },
  ],
};

const TOOLS_EN: Record<string, { title: string; description: string }> = {
  calculator: { title: 'Persona Calculator', description: "Tactica's Personas with their normal and special fusions, stats and unique skill, taken from the game files." },
};
for (const t of p5tGame.tools) bilingual(t, TOOLS_EN[t.id]);
