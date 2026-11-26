import { Fragment, useMemo, useState } from 'react';
import { CLASS_QUESTIONS, SCHOOL_ORDER, examFor, monthKey, withName, type ClassQuestion } from '../services/classes';
import { normalize } from '../../p5r/services/gameText';
import styles from './Classes.module.css';
import { L } from '../../../i18n';

type Type = 'all' | 'teacher' | 'friend' | 'exam';
const MONTHS = (): Record<number, string> => ({
  4: L('Abril', 'April'), 5: L('Mayo', 'May'), 6: L('Junio', 'June'), 7: L('Julio', 'July'), 9: L('Septiembre', 'September'),
  10: L('Octubre', 'October'), 11: L('Noviembre', 'November'), 12: L('Diciembre', 'December'), 1: L('Enero', 'January'), 2: L('Febrero', 'February'),
});
const tone = (q: ClassQuestion) => (q.kind === 'exam' ? 'exam' : q.askedBy);
const text = (es: string, en: string) => withName(L(es || en, en || es));

/** Respuestas de clase y exámenes de Persona 4 Revival. */
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
      return [q.q, q.qEn, q.ctx, q.ctxEn, ...q.opts, ...q.optsEn, q.speaker].some((s) => normalize(s).includes(qn));
    }).sort((a, b) => monthKey(a.month) - monthKey(b.month) || a.day - b.day);
  }, [query, month, type]);

  const TYPES: { id: Type; label: string }[] = [
    { id: 'all', label: L('Todas', 'All') },
    { id: 'teacher', label: L('Te pregunta el profe', 'Teacher asks you') },
    { id: 'friend', label: L('Ayudás a un amigo', 'You help a friend') },
    { id: 'exam', label: L('Exámenes', 'Exams') },
  ];

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <span className="label label-accent">Yasogami</span>
          <h1 className={styles.title}>{L('Respuestas de clase', 'Class answers')}</h1>
          <p className={styles.lead}>
            {L('Todas las preguntas de los profesores, las veces que Yosuke, Chie o Yukiko te piden ayuda y los exámenes, ordenadas por fecha. Responder bien en clase sube el Conocimiento.', 'Every teacher question, every time Yosuke, Chie or Yukiko ask for help and every exam, sorted by date. Answering right in class raises Knowledge.')}
          </p>
        </div>
      </section>

      <section className={`container ${styles.controls}`}>
        <label className={styles.field}>
          <span className="label label-accent">{L('Buscar palabra', 'Search word')}</span>
          <input type="search" value={query} placeholder={L('Ej: pirámides', 'E.g.: pyramids')} onChange={(e) => setQuery(e.target.value)} />
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
          const noText = !q.opts.some(Boolean) && !q.optsEn.some(Boolean);
          return (
            <Fragment key={`${q.month}-${q.day}-${q.kind}-${i}`}>
              {newExam && <div className={styles.examBand}>{L(exam.title[0], exam.title[1])}</div>}
              <article className={styles.entry} data-tone={t}>
                <div className={styles.date}>
                  <span className={styles.day}>{q.day}</span>
                  <span className={styles.month}>{months[q.month]}</span>
                </div>
                <div className={styles.body}>
                  <div className={styles.meta}>
                    <span className={styles.tag}>
                      {t === 'exam' ? `${L('Examen', 'Exam')} · ${L(q.speaker, q.speakerEn)}` : t === 'friend' ? L(`${q.speaker} te pide ayuda`, `${q.speakerEn} asks for help`) : L(q.speaker, q.speakerEn)}
                    </span>
                  </div>
                  {t === 'friend' && (q.ctx || q.ctxEn) && (
                    <p className={styles.note}>{L(q.ctxSpeaker, q.ctxSpeakerEn)}: “{text(q.ctx, q.ctxEn)}”</p>
                  )}
                  <p className={styles.q}>“{text(q.q, q.qEn)}”</p>
                  <ul className={styles.opts}>
                    {q.opts.map((o, n) => (
                      <li key={n} className={n === q.answer ? styles.right : ''}>
                        <span>{noText ? L(`Opción ${n + 1}`, `Option ${n + 1}`) : text(o, q.optsEn[n])}</span>
                        {n === q.answer && <b>{L('Correcta', 'Correct')}</b>}
                      </li>
                    ))}
                  </ul>
                  {noText && (
                    <p className={styles.note}>{L('Las opciones son kanji dibujados: la respuesta es la primera.', 'The options are drawn kanji: the answer is the first one.')}</p>
                  )}
                </div>
              </article>
            </Fragment>
          );
        })}
        {!list.length && <p className={styles.note}>{L('No hay preguntas con esos filtros.', 'No questions match those filters.')}</p>}
        <p className={styles.credit}>{L('Preguntas y opciones: textos oficiales del juego. Fechas y respuestas: RPG Site.', 'Questions and options: official game text. Dates and answers: RPG Site.')}</p>
      </section>
    </>
  );
}
