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
    {
      id: 'party',
      path: 'ladrones',
      title: 'Ladrones Fantasma',
      description: 'Cada miembro del grupo: su árbol de habilidades, lo que aprende su Persona y todas sus armas con la receta para fabricarlas.',
    },
  ],
};

const TOOLS_EN: Record<string, { title: string; description: string }> = {
  party: { title: 'Phantom Thieves', description: 'Every party member: their skill tree, what their Persona learns and all their weapons with the recipe to make them.' },
  calculator: { title: 'Persona Calculator', description: "Tactica's Personas with their normal and special fusions, stats and unique skill, taken from the game files." },
};
for (const t of p5tGame.tools) bilingual(t, TOOLS_EN[t.id]);
