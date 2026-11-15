import classesJson from '../data/generated/classes.json';

/** Preguntas de clase y de exámenes de Gekkoukan, con el texto oficial del juego. */
export interface ClassQuestion {
  month: number;
  day: number;
  kind: 'class' | 'exam';
  /** teacher = te pregunta el profesor; friend = Junpei te pide ayuda. */
  askedBy: 'teacher' | 'friend';
  /** Profesor o compañero (en los exámenes, la materia). */
  speaker: string;
  speakerEn: string;
  q: string;
  qEn: string;
  opts: string[];
  optsEn: string[];
  answer: number;
}

export const CLASS_QUESTIONS = (classesJson as unknown as { questions: ClassQuestion[] }).questions;

/** Año escolar de abril a enero. */
export const SCHOOL_ORDER = [4, 5, 6, 7, 9, 10, 11, 12, 1];
export const monthKey = (m: number) => SCHOOL_ORDER.indexOf(m);

export interface ExamPeriod { id: string; months: number[]; title: [string, string] }
export const EXAMS: ExamPeriod[] = [
  { id: 'may', months: [5], title: ['Exámenes parciales del primer trimestre', 'First-term midterms'] },
  { id: 'jul', months: [7], title: ['Exámenes finales del primer trimestre', 'First-term finals'] },
  { id: 'oct', months: [10], title: ['Exámenes parciales del segundo trimestre', 'Second-term midterms'] },
  { id: 'dec', months: [12], title: ['Exámenes finales del segundo trimestre', 'Second-term finals'] },
];
export const examFor = (q: ClassQuestion) => (q.kind === 'exam' ? EXAMS.find((e) => e.months.includes(q.month)) : undefined);
