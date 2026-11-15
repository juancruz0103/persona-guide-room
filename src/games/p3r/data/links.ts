import type { ArcanaId } from '../types';
import { L } from '../../../i18n';

/** Día de la semana: 0 = lunes … 6 = domingo. */
export type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type Slot = 'day' | 'night';

export interface LinkMeta {
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
  place?: [string, string];
  unlock: [string, string];
}

/**
 * Datos de cada vínculo de Persona 3 Reload. Lugar, días y desbloqueo salen de la guía de RPG Site;
 * los diálogos y respuestas son los oficiales del juego (generated/links.json).
 */
export const LINKS: LinkMeta[] = [
  { arcana: 'fool', who: ['S.E.E.S.', 'S.E.E.S.'], auto: true,
    unlock: ['Empieza al unirte a S.E.E.S. y sube solo con la historia.', 'Starts when you join S.E.E.S. and ranks up with the story.'] },
  { arcana: 'magician', who: ['Kenji Tomochika', 'Kenji Tomochika'], days: [1, 3, 4], slot: 'day',
    place: ['Aula 2-F', 'Classroom 2-F'],
    unlock: ['Empieza solo el 22 de abril; no se puede perder.', 'Starts on its own on April 22; it can\'t be missed.'] },
  { arcana: 'priestess', who: ['Fuuka Yamagishi', 'Fuuka Yamagishi'], romance: true, days: [0, 2, 3, 5], slot: 'day',
    place: ['Pasillo del 2.º piso', '2F hallway'],
    unlock: ['Coraje al máximo; desde mediados de junio, hablale en la escuela.', 'Max Courage; from mid-June, talk to her at school.'] },
  { arcana: 'empress', who: ['Mitsuru Kirijo', 'Mitsuru Kirijo'], romance: true, days: [1, 3, 5], slot: 'day',
    place: ['Frente a la sala de profesores', 'In front of the faculty office'],
    unlock: ['Académico al máximo (Genio). Por la historia, recién se puede en diciembre.', 'Max Academics (Genius). Because of the story, only available from December.'] },
  { arcana: 'emperor', who: ['Hidetoshi Odagiri', 'Hidetoshi Odagiri'], days: [0, 1, 2, 3, 4, 5], slot: 'day',
    place: ['Sala del consejo estudiantil (2.º piso)', 'Student council room (2F)'],
    unlock: ['El 27 de abril Mitsuru te invita al consejo: pedí permiso a la Srta. Toriumi en la sala de profesores y andá a la sala del consejo.', 'On April 27 Mitsuru invites you to the council: ask Ms. Toriumi in the faculty office, then go to the council room.'] },
  { arcana: 'hierophant', who: ['Bunkichi y Mitsuko', 'Bunkichi & Mitsuko'], days: [1, 2, 3, 4, 5, 6], slot: 'day',
    place: ['Librería de viejo · centro comercial de Iwatodai', 'Used bookstore · Iwatodai Strip Mall'],
    unlock: ['Desde el 25 de abril: escuchá lo del caqui en la librería, buscá una hoja del árbol en la escuela y mostrásela.', 'From April 25: hear about the persimmon tree at the bookstore, get a leaf at school and show it to him.'] },
  { arcana: 'lovers', who: ['Yukari Takeba', 'Yukari Takeba'], romance: true, days: [0, 2, 3, 5], slot: 'day',
    place: ['Aula 2-F', 'Classroom 2-F'],
    unlock: ['Encanto al máximo; hablale después del viaje a Yakushima (fines de julio).', 'Max Charm; talk to her after the Yakushima trip (late July).'] },
  { arcana: 'chariot', who: ['Kazushi Miyamoto', 'Kazushi Miyamoto'], days: [0, 1, 3, 4], slot: 'day',
    place: ['Club de atletismo', 'Track team'],
    unlock: ['Desde el 23 de abril, anotate en el club de atletismo (pasillo del gimnasio).', 'From April 23, join the track team (gym hallway).'] },
  { arcana: 'justice', who: ['Chihiro Fushimi', 'Chihiro Fushimi'], romance: true, days: [1, 3, 5], slot: 'day',
    place: ['Pasillo del 2.º piso', '2F hallway'],
    unlock: ['Entrá al consejo estudiantil (Emperador) y hablale tres días seguidos hasta que acepte.', 'Join the student council (Emperor) and talk to her on three days until she accepts.'] },
  { arcana: 'hermit', who: ['Maya', 'Maya'], days: [6], holidays: true, slot: 'day',
    place: ['Tu cuarto · revisá el escritorio', 'Your room · check the desk'],
    unlock: ['Junpei te da el juego en línea a fines de abril; un domingo o feriado, revisá el escritorio de tu cuarto. Ocupa todo el día.', 'Junpei gives you the online game in late April; on a Sunday or holiday, check your desk. It takes the whole day.'] },
  { arcana: 'fortune', who: ['Keisuke Hiraga', 'Keisuke Hiraga'], days: [1, 2, 3], slot: 'day',
    place: ['Club de arte', 'Art club'],
    unlock: ['Desde el 17 de junio se abren los clubes culturales: anotate en el club de arte.', 'From June 17 the culture clubs open: join the art club.'] },
  { arcana: 'strength', who: ['Yuko Nishiwaki', 'Yuko Nishiwaki'], romance: true, days: [2, 5], slot: 'day',
    place: ['Pasillo del 2.º piso', '2F hallway'],
    unlock: ['Después del rango 1 del Carro, invitala a volver juntos. La primera vez dice que no: volvé a ir al club y probá otra vez.', 'After Chariot rank 1, invite her to walk home. She says no the first time: go to the club again and retry.'] },
  { arcana: 'hanged', who: ['Maiko Oohashi', 'Maiko Oohashi'], days: [0, 2, 5], slot: 'day',
    place: ['Santuario Naganaki', 'Naganaki Shrine'],
    unlock: ['Desde el 6 de mayo, llevale un Mad Bull y el takoyaki raro al santuario, y volvé otro día.', 'From May 6, bring her a Mad Bull and the weird takoyaki at the shrine, then come back another day.'] },
  { arcana: 'death', who: ['Pharos', 'Pharos'], auto: true,
    unlock: ['Sube solo con la historia.', 'Ranks up on its own with the story.'] },
  { arcana: 'temperance', who: ['Bebe', 'Bebe'], days: [1, 2, 4], slot: 'day',
    place: ['Aula de economía doméstica', 'Home economics room'],
    unlock: ['Académico rango 2 (para leer la nota de la puerta) y Hierofante rango 3.', 'Academics rank 2 (to read the note on the door) and Hierophant rank 3.'] },
  { arcana: 'devil', who: ['Presidente Tanaka', 'President Tanaka'], days: [0, 1, 5, 6], slot: 'night',
    place: ['Centro comercial Paulownia', 'Paulownia Mall'],
    unlock: ['Coraje y Encanto rango 4 y 40.000 ¥. Desde fines de mayo aparece de noche: pagale tres veces.', 'Courage and Charm rank 4 and ¥40,000. From late May he shows up at night: pay him three times.'] },
  { arcana: 'tower', who: ['Mutatsu', 'Mutatsu'], days: [3, 4, 5, 6], slot: 'night',
    place: ['Club Escapade (arriba) · Paulownia', 'Club Escapade (upstairs) · Paulownia'],
    unlock: ['Coraje rango 4. Desde fines de julio, pedile al barman los tragos en orden: Margarita, Bloody Mary, Destornillador y té oolong.', 'Courage rank 4. From late July, order the drinks: Margarita, Bloody Mary, Screwdriver and Oolong Tea.'] },
  { arcana: 'star', who: ['Mamoru Hayase', 'Mamoru Hayase'], days: [2, 4, 6], slot: 'day',
    place: ['Centro comercial de Iwatodai', 'Iwatodai Strip Mall'],
    unlock: ['Coraje rango 4. Después de la carrera de principios de agosto, buscalo en el centro comercial.', 'Courage rank 4. After the early-August race, find him at the strip mall.'] },
  { arcana: 'moon', who: ['Nozomi Suemitsu', 'Nozomi Suemitsu'], days: [0, 1, 2, 3, 4, 5, 6], slot: 'day',
    place: ['Centro comercial Paulownia', 'Paulownia Mall'],
    unlock: ['Encanto rango 2. Respondé sus tres preguntas y llevá un Bocado extraño.', 'Charm rank 2. Answer his three questions and carry an Odd Morsel.'] },
  { arcana: 'sun', who: ['Akinari Kamiki', 'Akinari Kamiki'], days: [6], slot: 'day',
    place: ['Santuario Naganaki', 'Naganaki Shrine'],
    unlock: ['Colgado rango 3. El 9 de agosto, en el santuario, perdió una lapicera roja: la tiene Koromaru en el dormitorio.', 'Hanged Man rank 3. On August 9 at the shrine he lost a red pen: Koromaru has it at the dorm.'] },
  { arcana: 'judgement', who: ['S.E.E.S.', 'S.E.E.S.'], auto: true, spoiler: true,
    unlock: ['Sube solo con la historia.', 'Ranks up on its own with the story.'] },
  { arcana: 'aeon', who: ['Aigis', 'Aigis'], romance: true, days: [4], slot: 'day',
    place: ['Aula 2-F', 'Classroom 2-F'],
    unlock: ['Sin requisitos: desde el 8 de enero, hablale después de clase.', 'No requirements: from January 8, talk to her after school.'] },
];

export const DAY_NAMES = (): string[] =>
  [L('Lunes', 'Monday'), L('Martes', 'Tuesday'), L('Miércoles', 'Wednesday'), L('Jueves', 'Thursday'), L('Viernes', 'Friday'), L('Sábado', 'Saturday'), L('Domingo', 'Sunday')];
const SHORT = () => [L('lun', 'Mon'), L('mar', 'Tue'), L('mié', 'Wed'), L('jue', 'Thu'), L('vie', 'Fri'), L('sáb', 'Sat'), L('dom', 'Sun')];

export function scheduleText(l: LinkMeta): string {
  if (l.auto) return L('Sube con la historia', 'Ranks up with the story');
  const d = l.days ?? [];
  const days = d.length === 7 ? L('Todos los días', 'Every day') : d.length === 6 && !d.includes(6) ? L('Lunes a sábado', 'Monday to Saturday') : d.map((i) => SHORT()[i]).join(' · ');
  const extra = l.holidays ? L(' y feriados', ' and holidays') : '';
  const slot = l.slot === 'night' ? L(', de noche', ', at night') : L(', de día', ', daytime');
  return days + extra + slot;
}
