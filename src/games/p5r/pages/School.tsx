import { Fragment, useMemo, useState } from 'react';
import {
  DEFAULT_SCHOOL_FILTERS,
  SCHOOL_MONTHS,
  daysWithQuestions,
  filterQuestions,
  getExam,
  getSchoolData,
  monthName,
  type SchoolFilterType,
  type SchoolFilters,
  type SchoolQuestion,
} from '../services/school';
import styles from './School.module.css';
import { L, bilingual, tr } from '../../../i18n';

const TYPES = (): { id: SchoolFilterType; label: string }[] => [
  { id: 'all', label: L('Todas', 'All') },
  { id: 'protagonist', label: L('Protagonista', 'Protagonist') },
  { id: 'ann', label: 'Ann' },
  { id: 'exam', label: L('Exámenes', 'Exams') },
];

function tone(q: SchoolQuestion): 'class' | 'ann' | 'exam' {
  if (q.kind === 'exam') return 'exam';
  return q.askedTo === 'ann' ? 'ann' : 'class';
}

const TAG = bilingual({ class: 'Protagonista', ann: 'Ann', exam: 'Examen' }, { class: 'Protagonist', exam: 'Exam' });

export default function School() {
  const { questions } = getSchoolData();
  const [f, setF] = useState<SchoolFilters>(DEFAULT_SCHOOL_FILTERS);
  const list = useMemo(() => filterQuestions(questions, f), [questions, f]);
  const days = useMemo(() => daysWithQuestions(questions, f.month), [questions, f.month]);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroSlab} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <span className={styles.kicker}>Shujin Academy</span>
          <h1 className={styles.title}>{L('Respuestas de clase', 'Class answers')}</h1>
          <p className={styles.lead}>
            {L('Todas las preguntas que hacen los profesores y las de los exámenes, ordenadas por fecha. Buscá el día en que estás y listo.', 'Every question teachers ask and every exam question, sorted by date. Find the day you are on and you are done.')}
          </p>
        </div>
      </section>

      <section className={`container ${styles.controls}`}>
        <ul className={styles.legend} aria-label={L('Referencias de color', 'Color legend')}>
          <li><span className={styles.sw} data-tone="class" /> {L('Pregunta al protagonista', 'Question to the protagonist')}</li>
          <li><span className={styles.sw} data-tone="ann" /> {L('Pregunta a Ann (la ayudás vos)', 'Question to Ann (you help her)')}</li>
          <li><span className={styles.sw} data-tone="exam" /> {L('Examen', 'Exam')}</li>
        </ul>

        <div className={styles.filters}>
          <label className={styles.field}>
            <span className="label label-accent">{L('Buscar palabra', 'Search word')}</span>
            <input
              type="search"
              value={f.query}
              placeholder={L('Ej: diccionario', 'E.g.: dictionary')}
              onChange={(e) => setF({ ...f, query: e.target.value })}
            />
          </label>
          <label className={styles.field}>
            <span className="label label-accent">{L('Mes', 'Month')}</span>
            <select
              value={f.month ?? ''}
              onChange={(e) => setF({ ...f, month: e.target.value ? Number(e.target.value) : null, day: null })}
            >
              <option value="">{L('Todos los meses', 'All months')}</option>
              {SCHOOL_MONTHS.map((m) => (
                <option key={m.month} value={m.month}>{m.name}</option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span className="label label-accent">{L('Día', 'Day')}</span>
            <select
              value={f.day ?? ''}
              onChange={(e) => setF({ ...f, day: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">{L('Todos los días', 'All days')}</option>
              {days.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          <div className={styles.types} role="group" aria-label={L('Tipo de pregunta', 'Question type')}>
            {TYPES().map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={f.type === t.id}
                data-type={t.id}
                className={styles.chip}
                onClick={() => setF({ ...f, type: t.id })}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className={`container ${styles.results}`} aria-live="polite">
        <p className={styles.count}>
          <strong>{list.length}</strong> {list.length === 1 ? 'pregunta' : 'preguntas'}
        </p>

        {list.map((q, i) => {
          const prev = list[i - 1];
          const exam = q.kind === 'exam' ? getExam(q.exam) : undefined;
          const newExamBlock = exam && prev?.exam !== q.exam;
          const t = tone(q);
          return (
            <Fragment key={`${q.month}-${q.day}-${q.part ?? 0}`}>
              {newExamBlock && (
                <div className={styles.examBand}>
                  <span className={styles.examTitle}>{tr(exam.title)}</span>
                  <span className={styles.examRange}>{tr(exam.range)}</span>
                </div>
              )}
              <article className={styles.entry} data-tone={t}>
                <div className={styles.date}>
                  <span className={styles.day}>{q.day}</span>
                  <span className={styles.month}>{monthName(q.month)}</span>
                </div>
                <div className={styles.body}>
                  <div className={styles.meta}>
                    <span className={styles.tag}>{TAG[t]}</span>
                    {q.part && <span className={styles.part}>{L('Pregunta', 'Question')} {q.part}</span>}
                    {q.month === 1 && <span className="tag tag--royal">{L('Solo Royal', 'Royal only')}</span>}
                  </div>
                  <p className={styles.topic}>{tr(q.topic)}</p>
                  <div className={styles.answer}>
                    <span className={styles.answerLabel}>{L('Respuesta', 'Answer')}</span>
                    <span className={styles.answerText}>{tr(q.answer)}</span>
                  </div>
                  {q.note && <p className={styles.note}>{tr(q.note)}</p>}
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
