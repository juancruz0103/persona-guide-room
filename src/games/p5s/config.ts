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
      title: 'Calculadora de Personas',
      description: 'Las Personas de Strikers con sus recetas de fusión, estadísticas, afinidades, habilidades y dónde encontrar cada una.',
    },
    {
      id: 'bond',
      path: 'vinculos',
      title: 'Vínculo',
      description: 'Las 30 habilidades de VÍNCULO: qué da cada una, cuánto cuesta cada nivel y cómo se desbloquea.',
    },
  ],
};

const TOOLS_EN: Record<string, { title: string; description: string }> = {
  bond: { title: 'Bond', description: 'The 30 BOND skills: what each gives, what each level costs and how to unlock it.' },
  calculator: { title: 'Persona Calculator', description: "Strikers' Personas with their fusion recipes, stats, affinities, skills and where to find each one." },
};
for (const t of p5sGame.tools) bilingual(t, TOOLS_EN[t.id]);
