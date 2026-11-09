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

const TYPES: { id: SchoolFilterType; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'protagonist', label: 'Protagonista' },
  { id: 'ann', label: 'Ann' },
  { id: 'exam', label: 'Exámenes' },
];

function tone(q: SchoolQuestion): 'class' | 'ann' | 'exam' {
  if (q.kind === 'exam') return 'exam';
  return q.askedTo === 'ann' ? 'ann' : 'class';
}

const TAG = { class: 'Protagonista', ann: 'Ann', exam: 'Examen' } as const;

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
          <h1 className={styles.title}>Respuestas de clase</h1>
          <p className={styles.lead}>
            Todas las preguntas que hacen los profesores y las de los exámenes, ordenadas por fecha. Buscá el día en
            que estás y listo.
          </p>
        </div>
      </section>

      <section className={`container ${styles.controls}`}>
        <ul className={styles.legend} aria-label="Referencias de color">
          <li><span className={styles.sw} data-tone="class" /> Pregunta al protagonista</li>
          <li><span className={styles.sw} data-tone="ann" /> Pregunta a Ann (la ayudás vos)</li>
          <li><span className={styles.sw} data-tone="exam" /> Examen</li>
        </ul>

        <div className={styles.filters}>
          <label className={styles.field}>
            <span className="label label-accent">Buscar palabra</span>
            <input
              type="search"
              value={f.query}
              placeholder="Ej: diccionario"
              onChange={(e) => setF({ ...f, query: e.target.value })}
            />
          </label>
          <label className={styles.field}>
            <span className="label label-accent">Mes</span>
            <select
              value={f.month ?? ''}
              onChange={(e) => setF({ ...f, month: e.target.value ? Number(e.target.value) : null, day: null })}
            >
              <option value="">Todos los meses</option>
              {SCHOOL_MONTHS.map((m) => (
                <option key={m.month} value={m.month}>{m.name}</option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span className="label label-accent">Día</span>
            <select
              value={f.day ?? ''}
              onChange={(e) => setF({ ...f, day: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Todos los días</option>
              {days.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          <div className={styles.types} role="group" aria-label="Tipo de pregunta">
            {TYPES.map((t) => (
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
                  <span className={styles.examTitle}>{exam.title}</span>
                  <span className={styles.examRange}>{exam.range}</span>
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
                    {q.part && <span className={styles.part}>Pregunta {q.part}</span>}
                    {q.month === 1 && <span className="tag tag--royal">Solo Royal</span>}
                  </div>
                  <p className={styles.topic}>{q.topic}</p>
                  <div className={styles.answer}>
                    <span className={styles.answerLabel}>Respuesta</span>
                    <span className={styles.answerText}>{q.answer}</span>
                  </div>
                  {q.note && <p className={styles.note}>{q.note}</p>}
                </div>
              </article>
            </Fragment>
          );
        })}

        {!list.length && <p className="pending">No hay preguntas con esos filtros.</p>}

        <p className={styles.source}>
          Respuestas: Eurogamer España, verificadas jugando. Temas de cada pregunta redactados a partir de RPG Site.
          Las preguntas de Ann se marcan según lo confirmado hasta ahora; el resto se revisa durante la partida.
        </p>
      </section>
    </>
  );
}
