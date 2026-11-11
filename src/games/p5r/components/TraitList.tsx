import { useMemo, useState } from 'react';
import { TRAITS, type TraitGroup } from '../data/traits';
import { matches, personaName, skillName, skillNameEn } from '../services/gameText';
import { getAllPersonas } from '../services/personas';
import type { Persona } from '../types';
import { PersonaPeek } from './PersonaPeek';
import styles from './TraitList.module.css';

const GROUPS: { id: TraitGroup | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'persona', label: 'De Persona' },
  { id: 'ally', label: 'De compañeros' },
  { id: 'treasure', label: 'Tesoro' },
];
const GROUP_TAG: Record<TraitGroup, string> = { persona: 'Persona', ally: 'Compañeros', treasure: 'Tesoro' };
const MAX_OWNERS = 4;
const collator = new Intl.Collator('es', { sensitivity: 'base' });

interface TraitRow {
  key: string;
  name: string;
  description: string;
  group: TraitGroup;
  owners: Persona[];
}

function Row({ row }: { row: TraitRow }) {
  const [showAll, setShowAll] = useState(false);
  const owners = showAll ? row.owners : row.owners.slice(0, MAX_OWNERS);
  return (
    <li className={`${styles.row} ${styles[`g_${row.group}`]}`}>
      <span className={styles.name}>
        <span title={`En inglés: ${skillNameEn(row.key)}`}>{row.name}</span>
        <span className={styles.tag}>{GROUP_TAG[row.group]}</span>
      </span>
      <span className={styles.desc}>{row.description}</span>
      <span className={styles.owners}>
        <span className={styles.mobileLabel}>Lo tienen</span>
        {owners.map((p) => (
          <PersonaPeek key={p.id} persona={p} />
        ))}
        {row.owners.length > MAX_OWNERS && (
          <button type="button" className={styles.more} aria-expanded={showAll} onClick={() => setShowAll((v) => !v)}>
            {showAll ? 'Ver menos' : `+${row.owners.length - MAX_OWNERS} más`}
          </button>
        )}
      </span>
    </li>
  );
}

/** Todos los rasgos (pasivas especiales de cada Persona en Royal), con buscador y orden alfabético. */
export function TraitList() {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<TraitGroup | 'all'>('all');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const rows = useMemo<TraitRow[]>(() => {
    const byTrait = new Map<string, Persona[]>();
    for (const p of getAllPersonas()) {
      if (!p.trait) continue;
      byTrait.set(p.trait, [...(byTrait.get(p.trait) ?? []), p]);
    }
    return Object.entries(TRAITS).map(([key, t]) => ({
      key,
      name: skillName(key),
      description: t.description,
      group: t.group,
      owners: (byTrait.get(key) ?? []).sort((a, b) => collator.compare(personaName(a), personaName(b))),
    }));
  }, []);

  const list = useMemo(() => {
    const q = query.trim();
    const out = rows.filter(
      (r) =>
        (group === 'all' || r.group === group) &&
        (!q || matches(q, r.name, skillNameEn(r.key), r.description, ...r.owners.map(personaName))),
    );
    out.sort((a, b) => collator.compare(a.name, b.name) * (order === 'asc' ? 1 : -1));
    return out;
  }, [rows, query, group, order]);

  return (
    <>
      <p className={styles.intro}>
        En Royal cada Persona tiene un <strong>rasgo</strong>: una pasiva especial que no ocupa hueco de habilidad. Al
        fusionar podés elegir qué rasgo hereda la Persona nueva.
      </p>

      <div className={styles.controls}>
        <label className={styles.search}>
          <span className="label label-accent">Buscar rasgo o Persona</span>
          <input type="search" placeholder="Ej: Linaje" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className={styles.groups} role="group" aria-label="Tipo de rasgo">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              aria-pressed={group === g.id}
              className={styles.groupBtn}
              onClick={() => setGroup(g.id)}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.count} aria-live="polite">
        <strong>{list.length}</strong> rasgos
      </p>

      <div className={styles.head}>
        <button
          type="button"
          className={styles.headBtn}
          onClick={() => setOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
          title="Ordenar por nombre"
        >
          Rasgo
          <span aria-hidden="true" className={styles.headArrow}>{order === 'asc' ? 'A→Z' : 'Z→A'}</span>
          <span className="visually-hidden">{order === 'asc' ? '(de la A a la Z)' : '(de la Z a la A)'}</span>
        </button>
        <span>Qué hace</span>
        <span>Lo tienen</span>
      </div>

      {list.length ? (
        <ul className={styles.list}>
          {list.map((r) => (
            <Row key={r.key} row={r} />
          ))}
        </ul>
      ) : (
        <p className="pending">Ningún rasgo coincide con esa búsqueda.</p>
      )}

      <p className={styles.note}>
        Nombres de los rasgos: textos oficiales del juego. Qué hace cada uno: Megami Tensei Wiki y
        aqiu384/megaten-fusion-tool, en redacción propia. Pasá el mouse por el nombre para verlo en inglés.
      </p>
    </>
  );
}
