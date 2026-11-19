import { Fragment, useMemo, useState } from 'react';
import { SCHOOL_MONTHS, daysWithQuestions, filterQuestions, monthName, type SchoolQuestion } from '../../p5r/services/school';
import schoolJson from '../data/school.json';
import styles from '../../p5r/pages/School.module.css';
import { L, isEn } from '../../../i18n';

/**
 * Respuestas de clase de Persona 5 original. Son distintas a las de Royal (Royal cambió muchas preguntas).
 * P5 no tiene traducción oficial al español: los textos en español son traducción propia.
 * Fuentes: RPG Site, Twinfinite, CGMagazine y Prima Games (guías del original).
 */
type Text = { es: string; en: string };
interface Question extends Omit<SchoolQuestion, 'topic' | 'answer'> { topic: Text; answer: Text }
interface Data { sources: string[]; exams: { id: string; title: Text; range: Text }[]; questions: Question[] }

const DATA = schoolJson as unknown as Data;
const t = (x: Text) => L(x.es, x.en);
type Type = 'all' | 'protagonist' | 'exam';

export default function School() {
  const [query, setQuery] = useState('');
  const [month, setMonth] = useState<number | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const [type, setType] = useState<Type>('all');
  const months = SCHOOL_MONTHS.filter((m) => m.month !== 1); // sin tercer semestre

  // Se reutiliza el filtro de Royal pasándole los textos del idioma actual.
  const flat = useMemo(() => DATA.questions.map((q) => ({ ...q, topic: t(q.topic), answer: t(q.answer), src: q })), []);
  const list = useMemo(
    () => (filterQuestions(flat, { query, month, day, type }) as typeof flat),
    [flat, query, month, day, type],
  );
  const days = useMemo(() => daysWithQuestions(flat, month), [flat, month]);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroSlab} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <span className={styles.kicker}>Shujin Academy</span>
          <h1 className={styles.title}>{L('Respuestas de clase', 'Class answers')}</h1>
          <p className={styles.lead}>
            {L('Las preguntas de los profesores y de los exámenes de Persona 5 original, ordenadas por fecha. Son distintas a las de Royal.', "The teachers' and exam questions of the original Persona 5, sorted by date. They're different from Royal's.")}
          </p>
        </div>
      </section>
      {!isEn() && (
        <p className="container" style={{ marginTop: 16, color: 'var(--c-text-muted)', fontSize: 15 }}>
          Persona 5 original no tiene traducción oficial al español: las preguntas y respuestas son una traducción propia de la versión en inglés.
          Buscá la respuesta por su sentido. Fuentes: RPG Site, Twinfinite, CGMagazine y Prima Games.
        </p>
      )}

      <section className={`container ${styles.controls}`}>
        <ul className={styles.legend} aria-label={L('Referencias de color', 'Color legend')}>
          <li><span className={styles.sw} data-tone="class" /> {L('Pregunta al protagonista', 'Question to the protagonist')}</li>
          <li><span className={styles.sw} data-tone="exam" /> {L('Examen', 'Exam')}</li>
        </ul>
        <div className={styles.filters}>
          <label className={styles.field}>
            <span className="label label-accent">{L('Buscar palabra', 'Search word')}</span>
            <input type="search" value={query} placeholder={L('Ej: guillotina', 'E.g.: guillotine')} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <label className={styles.field}>
            <span className="label label-accent">{L('Mes', 'Month')}</span>
            <select value={month ?? ''} onChange={(e) => { setMonth(e.target.value ? Number(e.target.value) : null); setDay(null); }}>
              <option value="">{L('Todos los meses', 'All months')}</option>
              {months.map((m) => <option key={m.month} value={m.month}>{m.name}</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span className="label label-accent">{L('Día', 'Day')}</span>
            <select value={day ?? ''} onChange={(e) => setDay(e.target.value ? Number(e.target.value) : null)}>
              <option value="">{L('Todos los días', 'All days')}</option>
              {days.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <div className={styles.types} role="group" aria-label={L('Tipo de pregunta', 'Question type')}>
            {([['all', L('Todas', 'All')], ['protagonist', L('Clase', 'Class')], ['exam', L('Exámenes', 'Exams')]] as [Type, string][]).map(([id, label]) => (
              <button key={id} type="button" aria-pressed={type === id} data-type={id} className={styles.chip} onClick={() => setType(id)}>{label}</button>
            ))}
          </div>
        </div>
      </section>

      <section className={`container ${styles.results}`} aria-live="polite">
        <p className={styles.count}><strong>{list.length}</strong> {list.length === 1 ? L('pregunta', 'question') : L('preguntas', 'questions')}</p>
        {list.map((q, i) => {
          const prev = list[i - 1];
          const exam = q.kind === 'exam' ? DATA.exams.find((e) => e.id === q.exam) : undefined;
          const tone = q.kind === 'exam' ? 'exam' : 'class';
          return (
            <Fragment key={`${q.month}-${q.day}-${q.part ?? 0}`}>
              {exam && prev?.exam !== q.exam && (
                <div className={styles.examBand}>
                  <span className={styles.examTitle}>{t(exam.title)}</span>
                  <span className={styles.examRange}>{t(exam.range)}</span>
                </div>
              )}
              <article className={styles.entry} data-tone={tone}>
                <div className={styles.date}>
                  <span className={styles.day}>{q.day}</span>
                  <span className={styles.month}>{monthName(q.month)}</span>
                </div>
                <div className={styles.body}>
                  <div className={styles.meta}>
                    <span className={styles.tag}>{tone === 'exam' ? L('Examen', 'Exam') : L('Protagonista', 'Protagonist')}</span>
                    {q.part && <span className={styles.part}>{L('Pregunta', 'Question')} {q.part}</span>}
                  </div>
                  <p className={styles.topic}>{q.topic}</p>
                  <div className={styles.answer}>
                    <span className={styles.answerLabel}>{L('Respuesta', 'Answer')}</span>
                    <span className={styles.answerText}>{q.answer}</span>
                  </div>
                  {!isEn() && <p className={styles.note}>{L('En inglés', 'In English')}: {q.src.answer.en}</p>}
                </div>
              </article>
            </Fragment>
          );
        })}
        {!list.length && <p className="pending">{L('No hay preguntas con esos filtros.', 'No questions match those filters.')}</p>}
      </section>
    </>
  );
}
