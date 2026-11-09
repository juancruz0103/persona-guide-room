import schoolJson from '../data/school.json';

/** Preguntas de clase y exámenes de Shujin. */
export type QuestionKind = 'class' | 'exam';
export type AskedTo = 'protagonist' | 'ann';
export type SchoolFilterType = 'all' | 'protagonist' | 'ann' | 'exam';

export interface SchoolQuestion {
  month: number;
  day: number;
  kind: QuestionKind;
  askedTo: AskedTo;
  /** Número de pregunta dentro del mismo día (1, 2, 3...) o null si es única */
  part: number | null;
  /** Tema de la pregunta, redactado con palabras propias */
  topic: string;
  /** Respuesta correcta, tal como aparece en el juego en español */
  answer: string;
  exam?: string;
  note?: string;
}

export interface ExamPeriod {
  id: string;
  title: string;
  range: string;
}

interface SchoolData {
  sources: Record<string, string>;
  exams: ExamPeriod[];
  questions: SchoolQuestion[];
}

const DATA = schoolJson as SchoolData;

/** Orden del año escolar: abril → enero. */
export const SCHOOL_MONTHS: { month: number; name: string }[] = [
  { month: 4, name: 'Abril' },
  { month: 5, name: 'Mayo' },
  { month: 6, name: 'Junio' },
  { month: 7, name: 'Julio' },
  { month: 9, name: 'Septiembre' },
  { month: 10, name: 'Octubre' },
  { month: 11, name: 'Noviembre' },
  { month: 12, name: 'Diciembre' },
  { month: 1, name: 'Enero' },
];

const monthOrder = new Map(SCHOOL_MONTHS.map((m, i) => [m.month, i]));

export function monthName(month: number): string {
  return SCHOOL_MONTHS.find((m) => m.month === month)?.name ?? String(month);
}

export function getSchoolData(): SchoolData {
  return DATA;
}

export function getExam(id: string | undefined): ExamPeriod | undefined {
  return DATA.exams.find((e) => e.id === id);
}

export interface SchoolFilters {
  query: string;
  month: number | null;
  day: number | null;
  type: SchoolFilterType;
}

export const DEFAULT_SCHOOL_FILTERS: SchoolFilters = { query: '', month: null, day: null, type: 'all' };

/** Quita tildes y pasa a minúsculas para buscar sin importar acentos. */
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function filterQuestions(list: SchoolQuestion[], f: SchoolFilters): SchoolQuestion[] {
  const q = norm(f.query.trim());
  return list
    .filter((x) => {
      if (f.month !== null && x.month !== f.month) return false;
      if (f.day !== null && x.day !== f.day) return false;
      if (f.type === 'exam' && x.kind !== 'exam') return false;
      if (f.type === 'protagonist' && (x.kind !== 'class' || x.askedTo !== 'protagonist')) return false;
      if (f.type === 'ann' && (x.kind !== 'class' || x.askedTo !== 'ann')) return false;
      if (q && !norm(`${x.topic} ${x.answer}`).includes(q)) return false;
      return true;
    })
    .sort(
      (a, b) =>
        monthOrder.get(a.month)! - monthOrder.get(b.month)! ||
        a.day - b.day ||
        (a.part ?? 0) - (b.part ?? 0),
    );
}

/** Días que tienen preguntas en un mes (para el selector de día). */
export function daysWithQuestions(list: SchoolQuestion[], month: number | null): number[] {
  return [...new Set(list.filter((x) => month === null || x.month === month).map((x) => x.day))].sort((a, b) => a - b);
}
