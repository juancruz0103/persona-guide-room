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
  ],
};

const TOOLS_EN: Record<string, { title: string; description: string }> = {
  calculator: { title: 'Persona Calculator', description: "Reload's 194 Personas with profiles, two-Persona fusion, reverse search and special fusions." },
};
for (const t of p3rGame.tools) bilingual(t, TOOLS_EN[t.id]);
