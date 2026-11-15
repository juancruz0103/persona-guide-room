import type { GameInfo } from '../../core/types';
import { bilingual } from '../../i18n';

export const p5rGame: GameInfo = {
  id: 'p5r',
  name: 'Persona 5 Royal',
  shortName: 'P5 ROYAL',
  available: true,
  swatch: '#D7141A',
  tools: [
    {
      id: 'calculator',
      path: 'calculadora',
      title: 'Calculadora de Personas',
      description:
        'Catálogo completo con filtros, fichas individuales, fusión de dos Personas y búsqueda inversa.',
    },
    {
      id: 'confidants',
      path: 'confidentes',
      title: 'Guía de Confidentes',
      description:
        'Respuestas rango por rango, la opción que más puntos da y las habilidades que desbloqueás.',
    },
    {
      id: 'school',
      path: 'clases',
      title: 'Respuestas de clase',
      description: 'Las respuestas a todas las preguntas de los profesores y de los exámenes, día por día.',
    },
  ],
};

const TOOLS_EN: Record<string, { title: string; description: string }> = {
  calculator: { title: 'Persona Calculator', description: 'Full catalog with filters, individual profiles, two-Persona fusion and reverse search.' },
  confidants: { title: 'Confidant Guide', description: 'Answers rank by rank, the option that gives the most points and the abilities you unlock.' },
  school: { title: 'Class answers', description: 'Answers to every teacher question and every exam, day by day.' },
};
for (const t of p5rGame.tools) bilingual(t, TOOLS_EN[t.id]);
