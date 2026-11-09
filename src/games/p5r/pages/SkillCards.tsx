import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ElementIcon } from '../../../shared/components/ElementIcon';
import { CalculatorHeader } from '../components/CalculatorHeader';
import { SKILL_CARD_PATH } from '../components/ItemIcon';
import { SkillTip } from '../components/SkillTip';
import { ELEMENTS } from '../data/elements';
import { filterSkillCardRows, getSkillCardRows, type SkillCardFilter, type SkillCardRow } from '../services/items';
import { describeCost, skillMeta } from '../services/skillText';
import type { Persona, SkillElement } from '../types';
import styles from './SkillCards.module.css';

const TYPES: { id: SkillCardFilter; label: string; tone: 'red' | 'white' | 'gold' }[] = [
  { id: 'all', label: 'Todas', tone: 'red' },
  { id: 'card', label: 'Con skill card', tone: 'white' },
  { id: 'alarm', label: 'Con alarma', tone: 'red' },
  { id: 'excl', label: 'Exclusivas', tone: 'gold' },
];

const ELEMENT_FILTER = Object.keys(ELEMENTS) as SkillElement[];
const PAGE = 50;
const MAX_LEARNERS = 4;

const personaLink = (p: Persona) => `/p5r/calculadora/persona/${p.id}`;

/** Nombre de Persona con su foto en miniatura al pasar el mouse. */
function PersonaPeek({ persona }: { persona: Persona }) {
  return (
    <span className={styles.peek}>
      <Link to={personaLink(persona)} className={styles.peekLink}>
        {persona.name}
      </Link>
      <span className={styles.preview} aria-hidden="true">
        <span className={`img-stripes ${styles.photo}`}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="4" width="18" height="16" rx="1" />
            <circle cx="9" cy="10" r="2" />
            <path d="M21 16l-5-5-9 9" />
          </svg>
          <span>Foto</span>
        </span>
        <span className={styles.previewName}>{persona.name}</span>
        <span className={styles.previewMeta}>Nv {persona.level}</span>
      </span>
    </span>
  );
}

function Row({ row }: { row: SkillCardRow }) {
  const { skill, cards, learners, exclusive } = row;
  const cost = describeCost(skill);
  const meta = skillMeta(skill);

  return (
    <li className={`${styles.row} ${exclusive ? styles.rowExcl : ''}`}>
      <SkillTip skill={skill} />
      <span className={styles.skill}>
        <span className={styles.skillName}>{skill.name}</span>
        <span className={styles.skillMeta}>
          {meta}
          {cost && (
            <>
              {' · '}
              <strong className={cost.kind === 'hp' ? 'cost-hp' : 'cost-sp'}>{cost.text}</strong>
            </>
          )}
        </span>
      </span>

      <span className={styles.cards}>
        <span className={styles.mobileLabel}>Skill card</span>
        {exclusive ? (
          <span className={styles.exclTag}>Exclusiva · no existe como skill card</span>
        ) : cards.length ? (
          cards.map((c) => (
            <Link
              key={`${c.persona.id}-${c.alarm}`}
              to={personaLink(c.persona)}
              className={`${styles.card} ${c.alarm ? styles.cardAlarm : styles.cardNormal}`}
              title={c.alarm ? 'Ejecutar con la Alarma de fusión activa' : 'Ejecución normal'}
            >
              <svg width="14" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" fillRule="evenodd" d={SKILL_CARD_PATH} />
              </svg>
              {c.persona.name}
              {c.alarm && <span className={styles.alarmBadge}>Alarma</span>}
            </Link>
          ))
        ) : (
          <span className={styles.none}>Ninguna Persona la da por silla eléctrica</span>
        )}
      </span>

      <span className={styles.learn}>
        <span className={styles.mobileLabel}>La aprenden</span>
        {learners.length ? (
          <>
            {learners.slice(0, MAX_LEARNERS).map((p) => (
              <PersonaPeek key={p.id} persona={p} />
            ))}
            {learners.length > MAX_LEARNERS && (
              <span className={styles.more} title={learners.slice(MAX_LEARNERS).map((p) => p.name).join(', ')}>
                +{learners.length - MAX_LEARNERS} más
              </span>
            )}
          </>
        ) : (
          <span className={styles.none}>Ninguna por nivel</span>
        )}
      </span>
    </li>
  );
}

export default function SkillCards() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<SkillCardFilter>('all');
  const [element, setElement] = useState<SkillElement | null>(null);
  const [limit, setLimit] = useState(PAGE);

  const all = getSkillCardRows();
  const list = useMemo(() => filterSkillCardRows(all, { query, type, element }), [all, query, type, element]);
  const reset = () => setLimit(PAGE);

  return (
    <>
      <CalculatorHeader />

      <section className={`container ${styles.page}`}>
        <p className={styles.intro}>
          Qué Persona tenés que ejecutar en la <strong>silla eléctrica</strong> para conseguir la skill card de cada
          habilidad, y cuáles son <strong>exclusivas</strong> (no existen como skill card).
        </p>

        <div className={styles.legend}>
          <span className="label label-accent">Referencias</span>
          <span><i className={styles.swatch} style={{ background: 'var(--c-paper)' }} /> Ejecución normal</span>
          <span><i className={styles.swatch} style={{ background: 'var(--c-primary)' }} /> Requiere Alarma de fusión</span>
          <span><i className={styles.swatch} style={{ background: 'var(--c-accent)' }} /> Exclusiva de Persona</span>
          <span>
            Costo: <strong className="cost-hp">HP</strong> / <strong className="cost-sp">SP</strong>
          </span>
        </div>

        <div className={styles.controls}>
          <label className={styles.search}>
            <span className="label label-accent">Buscar skill o Persona</span>
            <input
              type="search"
              placeholder="Ej: Bufudyne"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                reset();
              }}
            />
          </label>
          <div className={styles.types} role="group" aria-label="Tipo">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={type === t.id}
                data-tone={t.tone}
                className={styles.typeBtn}
                onClick={() => {
                  setType(t.id);
                  reset();
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.elements} role="group" aria-label="Elemento">
          <span className="label label-accent">Elemento</span>
          {ELEMENT_FILTER.map((id) => (
            <button
              key={id}
              type="button"
              title={ELEMENTS[id].name}
              aria-label={ELEMENTS[id].name}
              aria-pressed={element === id}
              className={styles.elBtn}
              onClick={() => {
                setElement(element === id ? null : id);
                reset();
              }}
            >
              <ElementIcon element={id} size={24} />
            </button>
          ))}
          {element && (
            <button type="button" className={styles.clear} onClick={() => setElement(null)}>
              Quitar filtro
            </button>
          )}
        </div>

        <p className={styles.count} aria-live="polite">
          <strong>{list.length}</strong> skills
        </p>

        <div className={styles.head} aria-hidden="true">
          <span />
          <span>Skill</span>
          <span>Skill card (silla eléctrica)</span>
          <span>La aprenden</span>
        </div>
        {list.length ? (
          <ul className={styles.list}>
            {list.slice(0, limit).map((r) => (
              <Row key={r.skill.name} row={r} />
            ))}
          </ul>
        ) : (
          <p className="pending">Ninguna skill coincide con esos filtros.</p>
        )}
        {list.length > limit && (
          <button type="button" className={`btn btn--light ${styles.moreBtn}`} onClick={() => setLimit(limit + PAGE)}>
            Mostrar más ({list.length - limit} restantes)
          </button>
        )}

        <p className={styles.note}>
          Datos de la silla eléctrica: aqiu384/megaten-fusion-tool. Los nombres de las skills están en inglés hasta
          que confirmemos los oficiales de la versión en español.
        </p>
      </section>
    </>
  );
}
