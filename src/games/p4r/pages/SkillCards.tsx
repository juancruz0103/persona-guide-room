import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalcHeader } from '../components/CalcHeader';
import { ElementIcon } from '../components/ElementIcon';
import { PersonaPeek } from '../components/PersonaPeek';
import { SkillRow } from '../components/SkillRow';
import { elementName } from '../data/elements';
import { filterRows, getSkillCardRows, type CardFilter, type SkillCardRow } from '../services/skillCards';
import { personaName } from '../services/text';
import type { SkillElement } from '../types';
import styles from '../../p5r/pages/SkillCards.module.css';
import { L } from '../../../i18n';

const TYPES = (): { id: CardFilter; label: string; tone: 'red' | 'white' | 'gold' }[] => [
  { id: 'all', label: L('Todas', 'All'), tone: 'red' },
  { id: 'cafe', label: L('Cafetería Chagall', 'Cafe Chagall'), tone: 'white' },
  { id: 'shuffle', label: L('Solo Shuffle Time', 'Shuffle Time only'), tone: 'red' },
  { id: 'excl', label: L('Exclusivas', 'Exclusive'), tone: 'gold' },
];
const ELEMENTS: SkillElement[] = ['phy', 'fir', 'ice', 'ele', 'win', 'lig', 'dar', 'alm', 'ail', 'rec', 'sup', 'pas'];
const PAGE = 50;
const MAX_LEARNERS = 4;

const CARD = (
  <svg width="14" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="4" y="2" width="16" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M12 7l1.5 3 3.3.5-2.4 2.3.6 3.2-3-1.6-3 1.6.6-3.2-2.4-2.3 3.3-.5z" fill="currentColor" />
  </svg>
);

function Row({ row }: { row: SkillCardRow }) {
  const { skill, cafe, learners, exclusive } = row;
  const [showAll, setShowAll] = useState(false);
  return (
    <li className={`${styles.row} ${exclusive ? styles.rowExcl : ''}`}>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, gridColumn: 'span 2' }}>
        <SkillRow name={skill.name} />
      </ul>
      <span className={styles.cards}>
        <span className={styles.mobileLabel}>Skill card</span>
        {exclusive ? (
          <span className={styles.exclTag}>{L('Exclusiva · no existe como skill card', 'Exclusive · it does not exist as a skill card')}</span>
        ) : cafe ? (
          <Link to={`/p4r/calculadora/persona/${cafe.id}`} className={`${styles.card} ${styles.cardNormal}`} title={L('Equipala y andá a la Cafetería Chagall', 'Equip it and visit Cafe Chagall')}>
            {CARD}
            {personaName(cafe)}
          </Link>
        ) : (
          <span className={styles.none}>{L('Solo en el Shuffle Time (cartas de espada)', 'Only from Shuffle Time (sword cards)')}</span>
        )}
      </span>
      <span className={styles.learn}>
        <span className={styles.mobileLabel}>{L('La aprenden', 'Learned by')}</span>
        {learners.length ? (
          <>
            {(showAll ? learners : learners.slice(0, MAX_LEARNERS)).map((p) => <PersonaPeek key={p.id} persona={p} />)}
            {learners.length > MAX_LEARNERS && (
              <button type="button" className={styles.more} aria-expanded={showAll} onClick={() => setShowAll((v) => !v)}>
                {showAll ? L('Ver menos', 'Show less') : `+${learners.length - MAX_LEARNERS} ${L('más', 'more')}`}
              </button>
            )}
          </>
        ) : (
          <span className={styles.none}>{L('Ninguna por nivel', 'None by level')}</span>
        )}
      </span>
    </li>
  );
}

export default function SkillCards() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState<CardFilter>('all');
  const [element, setElement] = useState<SkillElement | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const all = getSkillCardRows();
  const list = useMemo(() => filterRows(all, { query, type, element }), [all, query, type, element]);
  const reset = () => setLimit(PAGE);

  return (
    <>
      <CalcHeader />
      <section className={`container ${styles.page}`}>
        <p className={styles.intro}>
          {L('Cada Persona da una skill card en la', 'Each Persona gives one skill card at')} <strong>{L('Cafetería Chagall', 'Cafe Chagall')}</strong>:{' '}
          {L('llevala equipada y entrá. El resto de las cartas salen de las cartas de espada del', 'equip it and go in. The rest come from the sword cards in')} <strong>Shuffle Time</strong>.{' '}
          {L('Las cartas que ya tenés las copian Marie o Margaret en el Cuarto de Terciopelo.', 'Marie or Margaret in the Velvet Room copy the cards you already have.')}
        </p>

        <div className={styles.controls}>
          <label className={styles.search}>
            <span className="label label-accent">{L('Buscar skill o Persona', 'Search skill or Persona')}</span>
            <input type="search" placeholder={L('Ej: Bufudyne', 'E.g.: Bufudyne')} value={query} onChange={(e) => { setQuery(e.target.value); reset(); }} />
          </label>
          <div className={styles.types} role="group" aria-label={L('Tipo', 'Type')}>
            {TYPES().map((t) => (
              <button key={t.id} type="button" aria-pressed={type === t.id} data-tone={t.tone} className={styles.typeBtn} onClick={() => { setType(t.id); reset(); }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.elements} role="group" aria-label={L('Elemento', 'Element')}>
          <span className="label label-accent">{L('Elemento', 'Element')}</span>
          {ELEMENTS.map((id) => (
            <button key={id} type="button" title={elementName(id)} aria-label={elementName(id)} aria-pressed={element === id} className={styles.elBtn}
              onClick={() => { setElement(element === id ? null : id); reset(); }}>
              <ElementIcon el={id} size={24} title={false} />
            </button>
          ))}
          {element && <button type="button" className={styles.clear} onClick={() => setElement(null)}>{L('Quitar filtro', 'Clear filter')}</button>}
        </div>

        <p className={styles.count} aria-live="polite"><strong>{list.length}</strong> skills</p>

        <div className={styles.head}>
          <span />
          <span>Skill</span>
          <span>{L('Skill card (Cafetería Chagall)', 'Skill card (Cafe Chagall)')}</span>
          <span>{L('La aprenden', 'Learned by')}</span>
        </div>
        {list.length ? (
          <ul className={styles.list}>{list.slice(0, limit).map((r) => <Row key={r.skill.name} row={r} />)}</ul>
        ) : (
          <p className="pending">{L('Ninguna skill coincide con esos filtros.', 'No skill matches those filters.')}</p>
        )}
        {list.length > limit && (
          <button type="button" className={`btn btn--light ${styles.moreBtn}`} onClick={() => setLimit(limit + PAGE)}>
            {L('Mostrar más', 'Show more')} ({list.length - limit} {L('restantes', 'left')})
          </button>
        )}
      </section>
    </>
  );
}
