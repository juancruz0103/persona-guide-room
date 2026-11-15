import { describe, expect, it } from 'vitest';
import { CLASS_QUESTIONS } from './classes';

describe('clases P3R', () => {
  it('tiene las 53 preguntas (clases y exámenes) con su respuesta', () => {
    expect(CLASS_QUESTIONS).toHaveLength(53);
    for (const q of CLASS_QUESTIONS) {
      expect(q.opts[q.answer], `${q.day}/${q.month}`).toBeTruthy();
      expect(q.opts.length).toBe(q.optsEn.length);
    }
  });
  it('los exámenes son 17 en cuatro períodos', () => {
    const exams = CLASS_QUESTIONS.filter((q) => q.kind === 'exam');
    expect(exams).toHaveLength(17);
    expect(new Set(exams.map((q) => q.month))).toEqual(new Set([5, 7, 10, 12]));
  });
});
