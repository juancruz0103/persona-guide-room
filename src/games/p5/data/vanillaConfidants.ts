/**
 * Diferencias de los confidentes de Persona 5 original respecto de Royal.
 *
 * Los textos (preguntas y respuestas) son los oficiales de Royal: las conversaciones y los puntos
 * son los mismos en los dos juegos, salvo las llamadas, que son exclusivas de Royal.
 * Lo que cambia son las habilidades por rango, el confidente de Akechi (automático en el original)
 * y los pedidos de Caroline y Justine.
 *
 * Fuentes (guías del juego original, 2017):
 *  - Twinfinite, «All Persona 5 Confidant Abilities and Ranks» y «How to Get the Justice Confidant».
 *  - RankedBoost, «Persona 5 Confidant Guide List».
 *  - RPG Site (marca con «P5R» lo exclusivo de Royal) y GamerGuides (guía de P5 original).
 * Cuando una habilidad no existe en Royal no hay nombre oficial en español: va marcada como provisoria.
 */
export const VANILLA_SOURCES = [
  'https://twinfinite.net/?p=270741',
  'https://twinfinite.net/?p=271850',
  'https://rankedboost.com/persona-5/confidant/',
];

/** Confidentes que no existen en el original. */
export const ROYAL_ONLY_CONFIDANTS = ['kasumi', 'maruki'];

export interface UnlockFix {
  /** Habilidades de Royal que no están en el original (por nombre en español) */
  remove?: string[];
  /** Habilidades que en el original se ganan en otro rango */
  move?: Record<string, number>;
  /** Habilidades que solo tiene el original */
  add?: { rank: number; name: string; description: string; provisional?: boolean }[];
  /** Texto de Royal que hay que sacar de una descripción */
  strip?: Record<string, string>;
}

const RELEVO = (who: string) => ({
  name: 'Relevo',
  description: `Después de un 1 More podés pasarle el turno a ${who} (y ${who} a otro con Relevo).`,
});
const SECOND_R = 'Segundo despertar R';

export const UNLOCK_FIXES: Record<string, UnlockFix> = {
  ryuji: {
    remove: ['Esprint sigiloso', SECOND_R],
    move: { 'Mediación agresiva': 4 },
    add: [{ rank: 2, ...RELEVO('Ryuji') }],
  },
  ann: {
    remove: [SECOND_R],
    move: { Seducción: 7 },
    add: [{ rank: 1, ...RELEVO('Ann') }],
  },
  makoto: { remove: [SECOND_R], add: [{ rank: 2, ...RELEVO('Makoto') }] },
  haru: { remove: [SECOND_R], add: [{ rank: 2, ...RELEVO('Haru') }] },
  yusuke: {
    remove: [SECOND_R],
    add: [{ rank: 2, ...RELEVO('Yusuke') }],
    strip: { 'Mediación artística': ' También desbloquea el parque Inokashira.' },
  },
  futaba: { remove: [SECOND_R] },
  chihaya: {
    // Royal reordenó sus lecturas: en el original la de afinidad es la del rango 7 y la «especial» la del 10.
    remove: ['Lectura celestial', 'Devolución', 'Lectura especial de vínculo'],
    move: { 'Lectura de afinidad': 7, 'Lectura especial del sino': 10 },
    add: [{ rank: 5, name: 'Lectura del sino', description: 'Te muestra las próximas habilidades de un confidente.', provisional: true }],
  },
  iwai: { remove: ['Destreza +'] },
  takemi: { remove: ['Coraje +', 'Parque Inokashira'] },
  ohya: {
    remove: ['Encanto +', 'Exclusiva sin precedentes'],
    move: { 'Exclusiva impactante': 4 },
  },
  oda: { remove: ['Gentileza +'] },
  hifumi: { remove: ['Conocimiento +', 'Jinbocho', 'Tokyo Skytree'] },
  mishima: { remove: ['Parque Inokashira'] },
  yoshida: { move: { 'Control mental': 7 } },
  sojiro: { remove: ['Gentileza +3'] },
};

/** En el original, Morgana da Relevo en el rango 2 y no hay tercer semestre. */
export const MORGANA_FIX = {
  rank2: RELEVO('Morgana'),
  stripRank10: / En el tercer semestre.*$/,
};

/** Akechi en el original: sube solo con la historia (Twinfinite, «How to Get the Justice Confidant»). */
export const AKECHI_TIMELINE = [
  { rank: 1, when: 'Automático · 10/6' },
  { rank: 2, when: 'Automático · 24/7' },
  { rank: 3, when: 'Automático · 28/8' },
  { rank: 4, when: 'Automático · 24/10' },
  { rank: 5, when: 'Automático · 26/10' },
  {
    rank: 6,
    when: 'Automático · 29/10',
    ability: 'Relevo',
    description: 'Después de un 1 More podés pasarle el turno a Akechi.',
    extra: [
      { ability: 'Golpe de gracia', description: 'A veces ataca después de Joker.' },
      { ability: 'Mediación detectivesca', description: 'Akechi puede salvar una negociación con una Sombra que salió mal. (Nombre provisorio: no está en Royal.)' },
      { ability: 'Golpe de abanico', description: 'Puede curar estados alterados del grupo.' },
    ],
  },
  { rank: 7, when: 'Automático · 19/11' },
  { rank: 8, when: 'Automático · 20/11' },
  { rank: 9, when: 'Con la historia · sexto Palacio' },
  { rank: 10, when: 'Con la historia · sexto Palacio', ability: 'Fusión de Metatrón', description: 'Se desbloquea la fusión de Metatrón.' },
];

/** Caroline y Justine en el original (RPG Site marca qué cambió en Royal). */
export const STRENGTH_REQUESTS = [
  { rank: 1, persona: 'jack-frost', skill: 'Mabufu', reward: { name: 'Guillotina grupal', description: 'Fusionar 3 Personas a la vez.' } },
  { rank: 2, persona: 'shiisaa', skill: 'Frei' },
  { rank: 3, persona: 'matador', skill: 'Magaru', reward: { name: 'Confinamiento', description: 'Las Personas encerradas ganan skills de resistencia.' } },
  { rank: 4, persona: 'flauros', skill: 'Tarukaja' },
  { rank: 5, persona: 'ame-no-uzume', skill: 'Dodge Psy', reward: { name: 'Guillotina mejorada', description: 'Fusionar 4 o más Personas a la vez.' } },
  { rank: 6, persona: 'neko-shogun', skill: 'Dekaja' },
  { rank: 7, persona: 'lachesis', skill: 'Tetraja' },
  { rank: 8, persona: 'hecatoncheires', skill: 'Masukunda', reward: { name: 'Aislamiento', description: 'Mejora el encierro de Personas (nombre provisorio).' } },
  { rank: 9, persona: 'bugs', skill: 'Samarecarm' },
  { rank: 10, persona: 'seth', skill: 'High Counter', reward: { name: 'Trato especial', description: 'Fusionar Personas de nivel mayor al de Joker, pagando.' } },
];
