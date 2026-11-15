import { Fragment, useMemo, useState } from 'react';
import { CLASS_QUESTIONS, SCHOOL_ORDER, examFor, monthKey, type ClassQuestion } from '../services/classes';
import { normalize } from '../../p5r/services/gameText';
import styles from './Classes.module.css';
import { L, isEn } from '../../../i18n';

type Type = 'all' | 'teacher' | 'friend' | 'exam';
const MONTHS = (): Record<number, string> => ({
  4: L('Abril', 'April'), 5: L('Mayo', 'May'), 6: L('Junio', 'June'), 7: L('Julio', 'July'), 9: L('Septiembre', 'September'),
  10: L('Octubre', 'October'), 11: L('Noviembre', 'November'), 12: L('Diciembre', 'December'), 1: L('Enero', 'January'),
});
const tone = (q: ClassQuestion) => (q.kind === 'exam' ? 'exam' : q.askedBy);

/** Respuestas de clase y exámenes de Persona 3 Reload. */
export default function Classes() {
  const [query, setQuery] = useState('');
  const [month, setMonth] = useState<number | null>(null);
  const [type, setType] = useState<Type>('all');
  const months = MONTHS();

  const list = useMemo(() => {
    const qn = normalize(query.trim());
    return CLASS_QUESTIONS.filter((q) => {
      if (month !== null && q.month !== month) return false;
      if (type === 'exam' ? q.kind !== 'exam' : type !== 'all' && (q.kind === 'exam' || q.askedBy !== type)) return false;
      if (!qn) return true;
      return [q.q, q.qEn, ...q.opts, ...q.optsEn, q.speaker].some((s) => normalize(s).includes(qn));
    }).sort((a, b) => monthKey(a.month) - monthKey(b.month) || a.day - b.day);
  }, [query, month, type]);

  const TYPES: { id: Type; label: string }[] = [
    { id: 'all', label: L('Todas', 'All') },
    { id: 'teacher', label: L('Te pregunta el profe', 'Teacher asks you') },
    { id: 'friend', label: L('Ayudás a Junpei', 'You help Junpei') },
    { id: 'exam', label: L('Exámenes', 'Exams') },
  ];

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <span className="label label-accent">Gekkoukan</span>
          <h1 className={styles.title}>{L('Respuestas de clase', 'Class answers')}</h1>
          <p className={styles.lead}>
            {L('Todas las preguntas de los profesores, las veces que Junpei te pide ayuda y los exámenes, ordenadas por fecha. Responder bien en clase sube el Encanto; los exámenes dependen también de tu Académico.', 'Every teacher question, every time Junpei asks for help and every exam, sorted by date. Answering right in class raises Charm; exams also depend on your Academics.')}
          </p>
        </div>
      </section>

      <section className={`container ${styles.controls}`}>
        <label className={styles.field}>
          <span className="label label-accent">{L('Buscar palabra', 'Search word')}</span>
          <input type="search" value={query} placeholder={L('Ej: péndulo', 'E.g.: pendulum')} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label className={styles.field}>
          <span className="label label-accent">{L('Mes', 'Month')}</span>
          <select value={month ?? ''} onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : null)}>
            <option value="">{L('Todos los meses', 'All months')}</option>
            {SCHOOL_ORDER.map((m) => <option key={m} value={m}>{months[m]}</option>)}
          </select>
        </label>
        <div className={styles.types} role="group" aria-label={L('Tipo de pregunta', 'Question type')}>
          {TYPES.map((t) => (
            <button key={t.id} type="button" aria-pressed={type === t.id} className={styles.chip} data-tone={t.id} onClick={() => setType(t.id)}>{t.label}</button>
          ))}
        </div>
      </section>

      <section className={`container ${styles.results}`} aria-live="polite">
        <p className={styles.count}><strong>{list.length}</strong> {list.length === 1 ? L('pregunta', 'question') : L('preguntas', 'questions')}</p>
        {list.map((q, i) => {
          const exam = examFor(q);
          const newExam = exam && (!list[i - 1] || examFor(list[i - 1]) !== exam);
          const t = tone(q);
          return (
            <Fragment key={`${q.month}-${q.day}-${q.kind}`}>
              {newExam && <div className={styles.examBand}>{L(exam.title[0], exam.title[1])}</div>}
              <article className={styles.entry} data-tone={t}>
                <div className={styles.date}>
                  <span className={styles.day}>{q.day}</span>
                  <span className={styles.month}>{months[q.month]}</span>
                </div>
                <div className={styles.body}>
                  <div className={styles.meta}>
                    <span className={styles.tag}>
                      {t === 'exam' ? `${L('Examen', 'Exam')} · ${L(q.speaker, q.speakerEn)}` : t === 'friend' ? L('Junpei te pide ayuda', 'Junpei asks for help') : L(q.speaker, q.speakerEn)}
                    </span>
                  </div>
                  <p className={styles.q}>“{L(q.q, q.qEn)}”{!isEn() && <small>{q.qEn}</small>}</p>
                  <ul className={styles.opts}>
                    {q.opts.map((o, n) => (
                      <li key={n} className={n === q.answer ? styles.right : ''}>
                        <span>{L(o, q.optsEn[n])}{!isEn() && <small>{q.optsEn[n]}</small>}</span>
                        {n === q.answer && <b>{L('Correcta', 'Correct')}</b>}
                      </li>
                    ))}
                  </ul>
                  {q.month === 4 && q.day === 27 && (
                    <p className={styles.note}>{L('Las opciones son dibujos en la pizarra: la respuesta es la A.', 'The options are drawings on the board: the answer is A.')}</p>
                  )}
                </div>
              </article>
            </Fragment>
          );
        })}
        {!list.length && <p className={styles.note}>{L('No hay preguntas con esos filtros.', 'No questions match those filters.')}</p>}
        <p className={styles.credit}>{L('Preguntas y opciones: textos oficiales del juego. Fechas y respuestas: Pro Game Guides y Gameland.', 'Questions and options: official game text. Dates and answers: Pro Game Guides and Gameland.')}</p>
      </section>
    </>
  );
}
