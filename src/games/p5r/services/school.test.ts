import { describe, expect, it } from 'vitest';
import { DEFAULT_SCHOOL_FILTERS, daysWithQuestions, filterQuestions, getSchoolData } from './school';

const { questions, exams } = getSchoolData();

describe('datos de clases y exámenes', () => {
  it('tiene 100 preguntas: 69 de clase y 31 de examen', () => {
    expect(questions).toHaveLength(100);
    expect(questions.filter((q) => q.kind === 'exam')).toHaveLength(31);
  });

  it('cada pregunta de examen pertenece a un período existente', () => {
    for (const q of questions.filter((x) => x.kind === 'exam')) {
      expect(exams.some((e) => e.id === q.exam), `${q.day}/${q.month}`).toBe(true);
    }
  });

  it('no hay preguntas repetidas (mismo día y número)', () => {
    const keys = questions.map((q) => `${q.month}-${q.day}-${q.part ?? 0}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('filterQuestions', () => {
  it('ordena por año escolar: abril primero, enero al final', () => {
    const r = filterQuestions(questions, DEFAULT_SCHOOL_FILTERS);
    expect(r[0]).toMatchObject({ month: 4, day: 12 });
    expect(r[r.length - 1]).toMatchObject({ month: 1, day: 27 });
  });

  it('filtra por mes y día', () => {
    const r = filterQuestions(questions, { ...DEFAULT_SCHOOL_FILTERS, month: 5, day: 23 });
    expect(r.map((q) => q.answer)).toEqual(['Juntos', 'Sentidos', 'La unión de los sentidos']);
  });

  it('filtra por tipo', () => {
    const ann = filterQuestions(questions, { ...DEFAULT_SCHOOL_FILTERS, type: 'ann' });
    expect(ann.every((q) => q.askedTo === 'ann' && q.kind === 'class')).toBe(true);
    const exam = filterQuestions(questions, { ...DEFAULT_SCHOOL_FILTERS, type: 'exam' });
    expect(exam).toHaveLength(31);
  });

  it('busca sin importar tildes ni mayúsculas', () => {
    const r = filterQuestions(questions, { ...DEFAULT_SCHOOL_FILTERS, query: 'heian' });
    expect(r.map((q) => q.answer)).toEqual(['La era Heian']);
    expect(filterQuestions(questions, { ...DEFAULT_SCHOOL_FILTERS, query: 'GUILLOTIN' })).toHaveLength(1);
  });

  it('lista solo los días con preguntas del mes', () => {
    expect(daysWithQuestions(questions, 1)).toEqual([11, 14, 18, 21, 24, 27]);
  });
});
