import type { GameInfo } from '../../core/types';
import { bilingual } from '../../i18n';

export const p4rGame: GameInfo = {
  id: 'p4r',
  name: 'Persona 4 Revival',
  shortName: 'P4 REVIVAL',
  available: true,
  swatch: '#FF9A00',
  tools: [
    {
      id: 'calculator',
      path: 'calculadora',
      title: 'Calculadora de Personas',
      description: 'Las Personas del Revival con sus ilustraciones oficiales, fichas, fusión de dos Personas, búsqueda inversa y fusiones especiales.',
    },
    {
      id: 'links',
      path: 'vinculos',
      title: 'Vínculos sociales',
      description: 'Todos los vínculos del Revival: dónde encontrar a cada uno, cómo empieza y qué responder rango por rango, con los diálogos del juego.',
    },
    {
      id: 'classes',
      path: 'clases',
      title: 'Respuestas de clase',
      description: 'Las preguntas de los profesores, las ayudas a tus amigos y los exámenes, con la respuesta correcta y el texto oficial.',
    },
    {
      id: 'builds',
      path: 'builds',
      title: 'Builds de Personas',
      description: 'Rutas de fusión paso a paso armadas por la comunidad: qué heredar en cada paso y qué skill cards enseñar al final.',
    },
  ],
};

const TOOLS_EN: Record<string, { title: string; description: string }> = {
  calculator: { title: 'Persona Calculator', description: "Revival's Personas with their official artwork, profiles, two-Persona fusion, reverse search and special fusions." },
  classes: { title: 'Class answers', description: 'Teacher questions, helping your friends and exams, with the right answer and the official text.' },
  builds: { title: 'Persona builds', description: 'Community step-by-step fusion routes: what to inherit at each step and which skill cards to teach at the end.' },
  links: { title: 'Social Links', description: "Every Social Link in Revival: where to find each one, how it starts and what to answer rank by rank, with the game's dialogue." },
};
for (const t of p4rGame.tools) bilingual(t, TOOLS_EN[t.id]);
