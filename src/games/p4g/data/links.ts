import type { ArcanaId } from '../types';
import { L } from '../../../i18n';

/** Día de la semana: 0 = lunes … 6 = domingo. */
export type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Slot = 'day' | 'night';

/** Recompensa de un rango: una skill (con su descripción al pasar el cursor), una habilidad o un objeto. */
export type Reward =
  | { type: 'skill'; skill: string; who?: [string, string] }
  | { type: 'ability'; text: [string, string] }
  | { type: 'item'; item: [string, string] };

/** Pedido de Margaret para subir un rango (Emperatriz). */
export interface Request { rank: number; persona: string; skill: string; level?: number; note?: [string, string] }

export interface LinkMeta {
  /** Id en la URL. Fuerza y Sol tienen dos personajes posibles: uno por ficha. */
  id: string;
  arcana: ArcanaId;
  who: [string, string];
  /** Se sube solo con la historia (no hay que pasar tiempo). */
  auto?: boolean;
  /** Todo el vínculo es spoiler. */
  spoiler?: boolean;
  romance?: boolean;
  days?: Day[];
  slot?: Slot;
  /** Además, domingos y feriados. */
  holidays?: boolean;
  /** No se puede los días de lluvia. */
  noRain?: boolean;
  place?: [string, string];
  unlock: [string, string];
  /** La otra persona posible del mismo Arcana (se elige una sola). */
  alt?: string;
  requests?: Request[];
  /** Vínculos que suben solos: cuándo llega cada rango. */
  timeline?: { rank: number; when: [string, string]; note?: [string, string] }[];
  /** Es compañero de combate: suma las habilidades de combate de los rangos 1, 3, 5, 7, 9 y 10. */
  fighter?: boolean;
  /** Recompensas por rango (skills, habilidades y el objeto del rango máximo). */
  rewards?: Record<number, Reward[]>;
}

/**
 * Datos de cada vínculo social de Persona 4 Golden. Lugar, días y desbloqueo salen de la guía de RPG Site;
 * los diálogos y respuestas son los oficiales del juego (generated/links.json).
 */
export const LINKS: LinkMeta[] = [
  { id: 'fool', arcana: 'fool', who: ['Equipo de investigación', 'Investigation Team'], auto: true,
    unlock: ['Empieza el 17 de abril y sube solo con la historia.', 'Starts on April 17 and ranks up with the story.'],
    timeline: [
      { rank: 1, when: ['17/4', 'April 17'] }, { rank: 2, when: ['30/4', 'April 30'] }, { rank: 3, when: ['18/5', 'May 18'] },
      { rank: 4, when: ['6/6', 'June 6'] }, { rank: 5, when: ['10/7', 'July 10'] }, { rank: 6, when: ['10/7', 'July 10'] },
      { rank: 7, when: ['27/7', 'July 27'] }, { rank: 8, when: ['6/10', 'October 6'] }, { rank: 9, when: ['6/11', 'November 6'] },
      { rank: 10, when: ['3/12', 'December 3'] },
    ] },
  { id: 'magician', arcana: 'magician', who: ['Yosuke Hanamura', 'Yosuke Hanamura'], days: [0, 3, 4, 5], holidays: true, slot: 'day', noRain: true,
    place: ['Aulas 2.º piso · domingos y feriados: Junes', 'Classroom Building 2F · Sundays and holidays: Junes'],
    unlock: ['Empieza solo el 16 de abril.', 'Starts on its own on April 16.'] },
  { id: 'priestess', arcana: 'priestess', who: ['Yukiko Amagi', 'Yukiko Amagi'], romance: true, days: [0, 1, 2, 3], holidays: true, slot: 'day', noRain: true,
    place: ['Aulas 1.er piso · domingos: sur del distrito comercial', 'Classroom Building 1F · Sundays: southern Shopping District'],
    unlock: ['Empieza con la historia; el rango 1 llega el 17 de mayo.', 'Starts with the story; rank 1 comes on May 17.'] },
  { id: 'empress', arcana: 'empress', who: ['Margaret', 'Margaret'], slot: 'day',
    place: ['Velvet Room', 'Velvet Room'],
    unlock: ['Desde el 19 de mayo, con Conocimiento nivel 3, entrá a la Velvet Room. Cada rango se sube entregándole la Persona que pide.', 'From May 19, with Knowledge level 3, enter the Velvet Room. Each rank goes up by bringing her the Persona she asks for.'],
    requests: [
      { rank: 2, persona: 'ippon-datara', skill: 'Sukukaja', level: 17 },
      { rank: 3, persona: 'matador', skill: 'Mahama', level: 24 },
      { rank: 4, persona: 'gdon', skill: 'Rampage', level: 31 },
      { rank: 5, persona: 'neko-shogun', skill: 'Bufula', level: 32, note: ['Necesita la fusión triple (desde el 20 de julio).', 'Needs triangle fusion (from July 20).'] },
      { rank: 6, persona: 'black-frost', skill: 'Auto-Sukukaja', level: 38 },
      { rank: 7, persona: 'yatagarasu', skill: 'Megido', level: 40 },
      { rank: 8, persona: 'yatsufusa', skill: 'Mediarama', note: ['Necesita la fusión de 5 (desde el 20 de julio).', 'Needs pentagon fusion (from July 20).'] },
      { rank: 9, persona: 'ganesha', skill: 'Tetrakarn', level: 50 },
      { rank: 10, persona: 'trumpeter', skill: 'Mind Charge', level: 67 },
    ] },
  { id: 'emperor', arcana: 'emperor', who: ['Kanji Tatsumi', 'Kanji Tatsumi'], days: [2, 3, 5], holidays: true, slot: 'day', noRain: true,
    place: ['Edificio de prácticas 1.er piso · domingos: norte del distrito comercial', 'Practice Building 1F · Sundays: northern Shopping District'],
    unlock: ['Desde el 9 de junio: hablá con la alumna del 2.º piso de Aulas y después con Kanji en el Edificio de prácticas.', 'From June 9: talk to the female student on Classroom Building 2F, then to Kanji in the Practice Building.'] },
  { id: 'hierophant', arcana: 'hierophant', who: ['Ryotaro Dojima', 'Ryotaro Dojima'], slot: 'night',
    place: ['Tu casa, cuando Dojima está', 'Your house, when Dojima is home'],
    unlock: ['Empieza solo el 6 de mayo. Cuando él está en casa, Nanako no está disponible (y al revés).', 'Starts on its own on May 6. When he is home, Nanako is not available (and vice versa).'] },
  { id: 'lovers', arcana: 'lovers', who: ['Rise Kujikawa', 'Rise Kujikawa'], romance: true, days: [4, 5], holidays: true, slot: 'day', noRain: true,
    place: ['Aulas 1.er piso · domingos: sur del distrito comercial', 'Classroom Building 1F · Sundays: southern Shopping District'],
    unlock: ['Empieza solo el 23 de julio, al conocer a Rise.', 'Starts on its own on July 23, when you meet Rise.'] },
  { id: 'chariot', arcana: 'chariot', who: ['Chie Satonaka', 'Chie Satonaka'], romance: true, days: [0, 1, 3, 5], holidays: true, slot: 'day', noRain: true,
    place: ['Azotea · domingos: sur del distrito comercial', 'Rooftop · Sundays: southern Shopping District'],
    unlock: ['Empieza solo el 18 de abril.', 'Starts on its own on April 18.'] },
  { id: 'justice', arcana: 'justice', who: ['Nanako Dojima', 'Nanako Dojima'], slot: 'night',
    place: ['Tu casa, cuando Dojima no está', 'Your house, when Dojima is not home'],
    unlock: ['Empieza con la historia. Cuidar el huerto también le suma puntos.', 'Starts with the story. Tending the garden also gives points.'] },
  { id: 'hermit', arcana: 'hermit', who: ['Zorro', 'Fox'], slot: 'day',
    place: ['Santuario Tatsuhime (norte del distrito comercial)', 'Tatsuhime Shrine (northern Shopping District)'],
    unlock: ['Empieza solo el 5 de mayo. Cada rango se sube cumpliendo un pedido de las tablillas (ema) del santuario.', 'Starts on its own on May 5. Each rank goes up by completing a request from the shrine\'s ema.'] },
  { id: 'fortune', arcana: 'fortune', who: ['Naoto Shirogane', 'Naoto Shirogane'], romance: true, days: [0, 1, 2, 5], holidays: true, slot: 'day', noRain: true,
    place: ['Aulas 1.er piso · domingos: ribera del Samegawa', 'Classroom Building 1F · Sundays: Samegawa Flood Plain'],
    unlock: ['Desde el 21 de octubre: Naoto te encarga algo; hablá con el hombre de negro cerca de Aiya (Conocimiento 5) y volvé con Naoto (Coraje 5).', 'From October 21: Naoto gives you a task; talk to the man in black near Aiya (Knowledge 5), then go back to Naoto (Courage 5).'] },
  { id: 'strength-kou', arcana: 'strength', who: ['Kou Ichijo', 'Kou Ichijo'], alt: 'strength-daisuke', days: [0, 1, 2, 5], holidays: true, slot: 'day', noRain: true,
    place: ['Club de básquet', 'Basketball team'],
    unlock: ['Desde el 19 de abril hablá con el profesor en la sala de profesores y anotate en el club de básquet (Aulas 1.er piso). Es Kou o Daisuke: se elige uno.', 'From April 19 talk to your teacher in the faculty office and join the basketball team (Classroom Building 1F). It\'s Kou or Daisuke: you pick one.'] },
  { id: 'strength-daisuke', arcana: 'strength', who: ['Daisuke Nagase', 'Daisuke Nagase'], alt: 'strength-kou', days: [0, 1, 2, 5], holidays: true, slot: 'day', noRain: true,
    place: ['Club de fútbol', 'Soccer team'],
    unlock: ['Desde el 19 de abril hablá con el profesor en la sala de profesores y anotate en el club de fútbol (Aulas 1.er piso). Es Daisuke o Kou: se elige uno.', 'From April 19 talk to your teacher in the faculty office and join the soccer team (Classroom Building 1F). It\'s Daisuke or Kou: you pick one.'] },
  { id: 'hanged', arcana: 'hanged', who: ['Naoki Konishi', 'Naoki Konishi'], days: [0, 1, 2, 3], holidays: true, slot: 'day', noRain: true,
    place: ['Aulas 1.er piso · feriados: norte del distrito comercial', 'Classroom Building 1F · holidays: northern Shopping District'],
    unlock: ['Desde el 8 de junio, hablale en el 1.er piso de Aulas varios días seguidos.', 'From June 8, talk to him on Classroom Building 1F on several days in a row.'] },
  { id: 'death', arcana: 'death', who: ['Hisano Kuroda', 'Hisano Kuroda'], days: [6], holidays: true, slot: 'day', noRain: true,
    place: ['Ribera del Samegawa', 'Samegawa Flood Plain'],
    unlock: ['Llevá el Diablo (Sayoko) al rango 4 y hablale un domingo o feriado. Para el rango 7, buscá la carta del esposo en la armería Daidara.', 'Take the Devil (Sayoko) to rank 4 and talk to her on a Sunday or holiday. For rank 7, get the husband\'s letter at Daidara Metalworks.'] },
  { id: 'temperance', arcana: 'temperance', who: ['Eri Minami', 'Eri Minami'], days: [0, 4, 5], slot: 'day', noRain: true,
    place: ['Parada de colectivo (sur del distrito comercial)', 'Bus stop (southern Shopping District)'],
    unlock: ['Tomá el trabajo de ayudante de guardería (desde el 2 de mayo) y andá dos veces.', 'Take the daycare assistant job (from May 2) and go twice.'] },
  { id: 'devil', arcana: 'devil', who: ['Sayoko Uehara', 'Sayoko Uehara'], days: [2, 3, 4], slot: 'night',
    place: ['Hospital (trabajo de limpieza)', 'Hospital (cleaning job)'],
    unlock: ['Tomá el trabajo de limpieza del hospital (tablón de anuncios, desde el 25 de mayo) y andá dos veces.', 'Take the hospital cleaning job (bulletin board, from May 25) and go twice.'] },
  { id: 'tower', arcana: 'tower', who: ['Shu Nakajima', 'Shu Nakajima'], days: [1, 3, 5], slot: 'night', noRain: true,
    place: ['Casa de Shu (trabajo de tutor)', 'Shu\'s house (tutoring job)'],
    unlock: ['Tomá el trabajo de tutor (Comprensión nivel 5, desde el 25 de mayo).', 'Take the tutoring job (Understanding level 5, from May 25).'] },
  { id: 'star', arcana: 'star', who: ['Teddie', 'Teddie'], auto: true,
    unlock: ['Sube solo con eventos y la historia, desde el 24 de junio.', 'Ranks up with events and the story, from June 24.'],
    timeline: [
      { rank: 1, when: ['Evento · 24/6', 'Event · June 24'] },
      { rank: 2, when: ['Al terminar el 3.er calabozo', 'After clearing the 3rd dungeon'] },
      { rank: 3, when: ['Evento · 26/7', 'Event · July 26'] },
      { rank: 4, when: ['Al terminar el 4.º calabozo', 'After clearing the 4th dungeon'] },
      { rank: 5, when: ['Evento · 8/9', 'Event · September 8'] },
      { rank: 6, when: ['Evento · 7/10', 'Event · October 7'] },
      { rank: 7, when: ['Evento · 11/10', 'Event · October 11'] },
      { rank: 8, when: ['Evento · 30/10', 'Event · October 30'] },
      { rank: 9, when: ['Al terminar el 6.º calabozo', 'After clearing the 6th dungeon'] },
      { rank: 10, when: ['Evento · 5/12', 'Event · December 5'], note: ['Solo si seguís la ruta del final bueno.', 'Only if you follow the good ending route.'] },
    ] },
  { id: 'moon', arcana: 'moon', who: ['Ai Ebihara', 'Ai Ebihara'], romance: true, days: [2, 3, 4], slot: 'day', noRain: true,
    place: ['Aulas 1.er piso', 'Classroom Building 1F'],
    unlock: ['Llevá la Fuerza al rango 4 para conocerla; después te pide faltar a clase con ella (Coraje nivel 3).', 'Take Strength to rank 4 to meet her; then she asks you to skip class with her (Courage level 3).'] },
  { id: 'sun-yumi', arcana: 'sun', who: ['Yumi Ozawa', 'Yumi Ozawa'], alt: 'sun-ayane', romance: true, days: [0, 1, 4], slot: 'day', noRain: true,
    place: ['Club de teatro', 'Drama club'],
    unlock: ['Desde el 25 de abril, anotate en el club de teatro. Es Yumi o Ayane: se elige una.', 'From April 25, join the drama club. It\'s Yumi or Ayane: you pick one.'] },
  { id: 'sun-ayane', arcana: 'sun', who: ['Ayane Matsunaga', 'Ayane Matsunaga'], alt: 'sun-yumi', romance: true, days: [0, 1, 4], slot: 'day', noRain: true,
    place: ['Club de música', 'Music club'],
    unlock: ['Desde el 25 de abril, anotate en el club de música. Es Ayane o Yumi: se elige una.', 'From April 25, join the music club. It\'s Ayane or Yumi: you pick one.'] },
  { id: 'judgement', arcana: 'judgement', who: ['Spoiler', 'Spoiler'], auto: true, spoiler: true,
    unlock: ['Llega muy avanzada la historia y sube solo. No te adelantamos nada.', 'Comes very late in the story and ranks up on its own. No spoilers here.'] },
  { id: 'aeon', arcana: 'aeon', who: ['Marie', 'Marie'], romance: true, days: [2, 5], holidays: true, slot: 'day', noRain: true,
    place: ['Al salir de la Velvet Room', 'Outside the Velvet Room'],
    unlock: ['Desde el 18 de abril, entrá a la Velvet Room (si hay otro evento, salí y volvé a entrar).', 'From April 18, enter the Velvet Room (if another event shows up, leave and come back).'] },
  { id: 'jester', arcana: 'jester', who: ['Tohru Adachi', 'Tohru Adachi'],
    place: ['Entrada de Junes (de día) · gasolinera (de noche)', 'Junes entrance (day) · gas station (night)'],
    unlock: ['Desde el 13 de mayo, hablá con Adachi en Junes. Solo está en fechas fijas y hay que llegar al rango 6 antes del 1 de noviembre; los rangos 7 a 10 llegan solos.', 'From May 13, talk to Adachi at Junes. He is only around on set dates and you need rank 6 before November 1; ranks 7 to 10 come on their own.'] },
];

export const DAY_NAMES = (): string[] =>
  [L('Lunes', 'Monday'), L('Martes', 'Tuesday'), L('Miércoles', 'Wednesday'), L('Jueves', 'Thursday'), L('Viernes', 'Friday'), L('Sábado', 'Saturday'), L('Domingo', 'Sunday')];
const SHORT = () => [L('lun', 'Mon'), L('mar', 'Tue'), L('mié', 'Wed'), L('jue', 'Thu'), L('vie', 'Fri'), L('sáb', 'Sat'), L('dom', 'Sun')];

export function scheduleText(l: LinkMeta): string {
  if (l.auto) return L('Sube con la historia', 'Ranks up with the story');
  if (l.requests) return L('Cuando quieras, entregando Personas', 'Any time, by delivering Personas');
  if (l.arcana === 'hermit') return L('Con los pedidos del santuario', 'Through the shrine requests');
  if (l.arcana === 'jester') return L('Solo en fechas fijas', 'Only on set dates');
  const d = l.days ?? [];
  const slot = l.slot === 'night' ? L('de noche', 'at night') : L('de día', 'daytime');
  if (!d.length) return slot.charAt(0).toUpperCase() + slot.slice(1);
  const days = d.map((i) => SHORT()[i]).join(' · ');
  const extra = l.holidays && !d.includes(6) ? L(', domingos y feriados', ', Sundays and holidays') : '';
  const rain = l.noRain ? L(' · no con lluvia', ' · not when raining') : '';
  return `${days}${extra}, ${slot}${rain}`;
}

const skill = (s: string): Reward => ({ type: 'skill', skill: s });
const item = (es: string, en: string): Reward => ({ type: 'item', item: [es, en] });

/** Recompensas por rango. Skills y objetos: guías de RPG Site; objetos con su nombre oficial del juego. */
const REWARDS: Record<string, Record<number, Reward[]>> = {
  magician: { 2: [skill('Trafuri')], 4: [skill('Dekaja')], 6: [skill('Auto-Sukukaja')], 8: [skill('Diarama')], 10: [skill('Evade Elec'), item('Venda de colega', "Buddy's Bandage")] },
  chariot: { 2: [skill('Rebellion')], 4: [skill('Ice Boost')], 6: [skill('Revolution')], 8: [skill('Bufula')], 10: [item('Pulsera', 'Wristbands')] },
  priestess: { 4: [skill('Divine Grace')], 6: [skill('Amrita')], 8: [skill('Mudoon')], 10: [item('Amuleto de santuario', 'Shrine Charm')] },
  emperor: { 2: [skill('Dizzy Boost')], 4: [skill('Masukunda')], 6: [skill('Power Charge')], 8: [skill('Regenerate 3')], 10: [skill('Evade Wind'), item('Correa bonita', 'Cute Strap')] },
  lovers: {
    3: [{ type: 'ability', text: ['Rise detecta los tesoros del piso', 'Rise detects the treasure on each floor'] }],
    6: [{ type: 'ability', text: ['Rise detecta a los enemigos del piso', 'Rise detects the enemies on each floor'] }],
    10: [{ type: 'ability', text: ['Rise puede analizar las debilidades del enemigo', 'Rise can scan enemy weaknesses'] }, item('Foto firmada', 'Signed Photo')],
  },
  fortune: { 2: [skill('Invigorate 1')], 4: [skill('Mind Charge')], 6: [skill('Invigorate 2')], 8: [skill('Heat Riser')], 10: [item('Insignia de detective', 'Detective Badge')] },
  star: { 2: [skill('Auto-Rakukaja')], 4: [skill('Recarm')], 6: [skill('Marakunda')], 8: [skill('Samarecarm')] },
  empress: { 10: [item('Broche en espiral', 'Spiral Brooch')] },
  hierophant: { 10: [item('Taza de café', 'Coffee Mug')] },
  justice: { 10: [item('Foto familiar', 'Family Picture')] },
  hermit: { 10: [item('Ema de gratitud', 'Gratitude Ema')] },
  'strength-kou': { 10: [item('Carta para Kou', 'Letter to Kou')] },
  'strength-daisuke': { 10: [item('Brocha de pinchos', 'Spike Brush')] },
  hanged: { 10: [item('Ticket del Junes', 'Junes Receipt')] },
  death: { 10: [item('Pluma vieja', 'Old Fountain Pen')] },
  temperance: { 10: [item('Marcapáginas trébol', 'Clover Bookmark')] },
  devil: { 10: [item('Tarjeta de hospital', 'Hospital ID')] },
  tower: { 10: [item('Resultados de prueba', 'Test Results')] },
  moon: { 10: [item('Polvera', 'Compact')] },
  'sun-yumi': { 10: [item('Notas a mano', 'Annotated Script')] },
  'sun-ayane': { 10: [item('Entrada hecha a mano', 'Handmade Ticket')] },
};
const FIGHTERS = new Set(['magician', 'chariot', 'priestess', 'emperor', 'fortune', 'star']);
for (const l of LINKS) {
  l.rewards = REWARDS[l.id];
  if (FIGHTERS.has(l.id)) l.fighter = true;
}

/** Habilidades de combate de los compañeros en el Golden (Megami Tensei Wiki). */
export const FIGHTER_ABILITIES: Record<number, [string, string]> = {
  1: ['Puede curarte cuando estás derribado o mareado', 'May cure you when you are Down or Dizzy'],
  3: ['Ataque de seguimiento en combate (y en la moto cuando no está en el grupo)', 'Follow-up attacks in battle (and from the scooter when not in the party)'],
  5: ['Puede curar Furia, Pánico o Miedo', 'May cure Rage, Panic or Fear'],
  7: ['Resiste un golpe mortal una vez por combate', 'Survives a fatal blow once per battle'],
  9: ['Puede recibir un golpe mortal en tu lugar', 'May take a fatal blow in your place'],
  10: ['Su Persona se transforma y aprende una skill de evasión', 'Their Persona transforms and learns an Evade skill'],
};

/** Todo lo que da un rango, incluidas las habilidades de combate de los compañeros. */
export function rankRewards(l: LinkMeta, rank: number): Reward[] {
  const out: Reward[] = [];
  if (l.fighter && FIGHTER_ABILITIES[rank]) out.push({ type: 'ability', text: FIGHTER_ABILITIES[rank] });
  return out.concat(l.rewards?.[rank] ?? []);
}
