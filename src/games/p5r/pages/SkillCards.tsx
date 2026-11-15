import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ElementIcon } from '../../../shared/components/ElementIcon';
import { CalculatorHeader } from '../components/CalculatorHeader';
import { SKILL_CARD_PATH } from '../components/ItemIcon';
import { SkillCardKindIcon } from '../components/SkillCardKindIcon';
import { SkillTip } from '../components/SkillTip';
import { PersonaPeek } from '../components/PersonaPeek';
import { TraitList } from '../components/TraitList';
import { ELEMENTS } from '../data/elements';
import { NO_DAMAGE, filterSkillCardRows, getSkillCardRows, sortByPower, type SkillCardFilter, type SkillCardRow } from '../services/items';
import { describeCost, skillMeta } from '../services/skillText';
import type { Persona, SkillElement } from '../types';
import styles from './SkillCards.module.css';
import { personaName, skillName, skillNameEn } from '../services/gameText';
import { L } from '../../../i18n';

const TYPES = (): { id: SkillCardFilter; label: string; tone: 'red' | 'white' | 'gold' }[] => [
  { id: 'all', label: L('Todas', 'All'), tone: 'red' },
  { id: 'normal', label: L('Fusión normal', 'Normal fusion'), tone: 'white' },
  { id: 'alarm', label: L('Alarma de fusión', 'Fusion Alarm'), tone: 'red' },
  { id: 'excl', label: L('Exclusivas', 'Exclusive'), tone: 'gold' },
];

function KindIcon({ kind }: { kind: SkillCardFilter }) {
  return <SkillCardKindIcon kind={kind} className={styles.kindIcon} />;
}

const ELEMENT_FILTER = Object.keys(ELEMENTS) as SkillElement[];
const PAGE = 50;
const MAX_LEARNERS = 4;

const personaLink = (p: Persona) => `/p5r/calculadora/persona/${p.id}`;

function Row({ row, showPower }: { row: SkillCardRow; showPower?: boolean }) {
  const { skill, cards, learners, exclusive } = row;
  const [showAll, setShowAll] = useState(false);
  const cost = describeCost(skill);
  const meta = skillMeta(skill);

  return (
    <li className={`${styles.row} ${exclusive ? styles.rowExcl : ''}`}>
      <SkillTip skill={skill} />
      <span className={styles.skill}>
        <span className={styles.skillName} title={`${L('En inglés', 'In Spanish')}: ${skillNameEn(skill.name)}`}>
          {skillName(skill.name)}
        </span>
        <span className={styles.skillMeta}>
          {meta}
          {showPower && (
            <>
              {' · '}
              <strong className={styles.power}>{row.skill.power != null ? `${L('Daño', 'Power')} ${row.skill.power}` : L('Daño sin dato', 'No power data')}</strong>
            </>
          )}
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
          <span className={styles.exclTag}>{L('Exclusiva · no existe como skill card', 'Exclusive · it does not exist as a skill card')}</span>
        ) : cards.length ? (
          cards.map((c) => (
            <Link
              key={`${c.persona.id}-${c.alarm}`}
              to={personaLink(c.persona)}
              className={`${styles.card} ${c.alarm ? styles.cardAlarm : styles.cardNormal}`}
              title={c.alarm ? L('Ejecutar con la Alarma de fusión activa', 'Execute with the Fusion Alarm active') : L('Ejecución normal', 'Normal execution')}
            >
              <svg width="14" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" fillRule="evenodd" d={SKILL_CARD_PATH} />
              </svg>
              {personaName(c.persona)}
              {c.alarm && <span className={styles.alarmBadge}>{L('Alarma', 'Alarm')}</span>}
            </Link>
          ))
        ) : (
          <span className={styles.none}>{L('Ninguna Persona la da por silla eléctrica', 'No Persona gives it through the electric chair')}</span>
        )}
      </span>

      <span className={styles.learn}>
        <span className={styles.mobileLabel}>{L('La aprenden', 'Learned by')}</span>
        {learners.length ? (
          <>
            {(showAll ? learners : learners.slice(0, MAX_LEARNERS)).map((p) => (
              <PersonaPeek key={p.id} persona={p} />
            ))}
            {learners.length > MAX_LEARNERS && (
              <button
                type="button"
                className={styles.more}
                aria-expanded={showAll}
                onClick={() => setShowAll((v) => !v)}
              >
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
  const [view, setView] = useState<'cards' | 'traits'>('cards');
  const [query, setQuery] = useState('');
  const [type, setType] = useState<SkillCardFilter>('all');
  const [element, setElement] = useState<SkillElement | null>(null);
  const [limit, setLimit] = useState(PAGE);
  const [powerSort, setPowerSort] = useState<'desc' | 'asc' | null>(null);
  const [typeMenu, setTypeMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const canSortPower = element !== null && !NO_DAMAGE.has(element);
  useEffect(() => {
    if (!canSortPower) setPowerSort(null);
  }, [canSortPower]);

  // El menú del título se cierra al tocar afuera o con Escape
  useEffect(() => {
    if (!typeMenu) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !menuRef.current?.contains(e.target as Node)) setTypeMenu(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [typeMenu]);

  const all = getSkillCardRows();
  const list = useMemo(() => {
    const filtered = filterSkillCardRows(all, { query, type, element });
    return powerSort ? sortByPower(filtered, powerSort) : filtered;
  }, [all, query, type, element, powerSort]);
  const reset = () => setLimit(PAGE);
  // Cada clic: más daño primero → menos daño primero → orden normal
  const cyclePower = () => setPowerSort((s) => (s === null ? 'desc' : s === 'desc' ? 'asc' : null));
  const chooseType = (t: SkillCardFilter) => {
    setType(t);
    setTypeMenu(false);
    reset();
  };

  return (
    <>
      <CalculatorHeader />

      <section className={`container ${styles.page}`}>
        <div className={styles.views} role="tablist" aria-label={L('Qué ver', 'What to see')}>
          <button type="button" role="tab" aria-selected={view === 'cards'} className={styles.viewBtn} onClick={() => setView('cards')}>
            Skill cards
          </button>
          <button type="button" role="tab" aria-selected={view === 'traits'} className={styles.viewBtn} onClick={() => setView('traits')}>
            {L('Rasgos', 'Traits')}
          </button>
        </div>

        {view === 'traits' ? (
          <TraitList />
        ) : (
          <>
        <p className={styles.intro}>
          {L('Qué Persona tenés que ejecutar en la', 'Which Persona you have to execute in the')} <strong>{L('silla eléctrica', 'electric chair')}</strong>{' '}
          {L('para conseguir la skill card de cada habilidad, y cuáles son', 'to get the skill card of each skill, and which ones are')}{' '}
          <strong>{L('exclusivas', 'exclusive')}</strong> {L('(no existen como skill card).', '(they do not exist as skill cards).')}
        </p>

        <div className={styles.legend}>
          <span className="label label-accent">{L('Referencias', 'Legend')}</span>
          <span><i className={styles.swatch} style={{ background: 'var(--c-paper)' }} /> {L('Ejecución normal', 'Normal execution')}</span>
          <span><i className={styles.swatch} style={{ background: 'var(--c-primary)' }} /> {L('Requiere Alarma de fusión', 'Requires Fusion Alarm')}</span>
          <span><i className={styles.swatch} style={{ background: 'var(--c-accent)' }} /> {L('Exclusiva de Persona', 'Persona exclusive')}</span>
          <span>
            {L('Costo:', 'Cost:')} <strong className="cost-hp">HP</strong> / <strong className="cost-sp">SP</strong>
          </span>
        </div>

        <div className={styles.controls}>
          <label className={styles.search}>
            <span className="label label-accent">{L('Buscar skill o Persona', 'Search skill or Persona')}</span>
            <input
              type="search"
              placeholder={L('Ej: Bufudyne', 'E.g.: Bufudyne')}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                reset();
              }}
            />
          </label>
          <div className={styles.types} role="group" aria-label="Tipo">
            {TYPES().map((t) => (
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
                <KindIcon kind={t.id} />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.elements} role="group" aria-label="Elemento">
          <span className="label label-accent">{L('Elemento', 'Element')}</span>
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
              {L('Quitar filtro', 'Clear filter')}
            </button>
          )}
        </div>

        <p className={styles.count} aria-live="polite">
          <strong>{list.length}</strong> skills
        </p>

        <div className={styles.head}>
          <span />
          {canSortPower ? (
            <button
              type="button"
              className={`${styles.headBtn} ${powerSort ? styles.headActive : ''}`}
              onClick={cyclePower}
              title={L('Ordenar por daño', 'Sort by power')}
            >
              {L('Skill · daño', 'Skill · power')}
              <span aria-hidden="true" className={styles.headArrow}>{powerSort === 'desc' ? '▼' : powerSort === 'asc' ? '▲' : '↕'}</span>
              <span className="visually-hidden">
                {powerSort === 'desc' ? L('(de más a menos daño)', '(highest power first)') : powerSort === 'asc' ? L('(de menos a más daño)', '(lowest power first)') : L('(sin ordenar)', '(unsorted)')}
              </span>
            </button>
          ) : (
            <span title={L('Elegí un elemento de daño para ordenar por daño', 'Choose a damage element to sort by power')}>Skill</span>
          )}
          <div className={styles.headMenuWrap} ref={menuRef}>
            <button
              type="button"
              className={`${styles.headBtn} ${type !== 'all' ? styles.headActive : ''}`}
              aria-haspopup="menu"
              aria-expanded={typeMenu}
              onClick={() => setTypeMenu((v) => !v)}
            >
              {L('Skill card (silla eléctrica)', 'Skill card (electric chair)')}
              {type !== 'all' && <KindIcon kind={type} />}
              <span aria-hidden="true" className={styles.headArrow}>▾</span>
            </button>
            {typeMenu && (
              <div className={styles.headMenu} role="menu">
                {TYPES().map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={type === t.id}
                    className={styles.headMenuItem}
                    onClick={() => chooseType(t.id)}
                  >
                    <span className={styles.menuIconSlot}><KindIcon kind={t.id} /></span>
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span>{L('La aprenden', 'Learned by')}</span>
        </div>
        {list.length ? (
          <ul className={styles.list}>
            {list.slice(0, limit).map((r) => (
              <Row key={r.skill.name} row={r} showPower={powerSort !== null} />
            ))}
          </ul>
        ) : (
          <p className="pending">{L('Ninguna skill coincide con esos filtros.', 'No skill matches those filters.')}</p>
        )}
        {list.length > limit && (
          <button type="button" className={`btn btn--light ${styles.moreBtn}`} onClick={() => setLimit(limit + PAGE)}>
            {L('Mostrar más', 'Show more')} ({list.length - limit} {L('restantes', 'left')})
          </button>
        )}

        <p className={styles.note}>
          {L('Pasá el mouse por el nombre de una skill para verlo en inglés.', 'Hover over a skill name to see it in Spanish.')}
        </p>
          </>
        )}
      </section>
    </>
  );
}
