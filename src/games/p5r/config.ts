import type { GameInfo } from '../../core/types';

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
  ],
};
