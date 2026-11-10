import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImagePlaceholder } from '../../../shared/components/ImagePlaceholder';
import { confidantImage } from '../services/images';
import { getArcana } from '../data/arcana';
import { CONFIDANTS, KIND_LABEL, TAG_LABEL, type ConfidantTag } from '../services/confidants';
import { normalize } from '../services/gameText';
import styles from './Confidants.module.css';

type Group = 'all' | 'normal' | 'special';
const FILTER_TAGS: ConfidantTag[] = ['romance', 'royal', 'deadline', 'locked', 'mementos', 'stat'];
const TAG_CLASS: Partial<Record<ConfidantTag, string>> = {
  thief: 'tag--special',
  romance: 'tag--romance',
  royal: 'tag--royal',
  deadline: 'tag--paper',
};

const isSpecial = (kind: string) => kind !== 'normal';

export default function Confidants() {
  const [group, setGroup] = useState<Group>('all');
  const [tag, setTag] = useState<ConfidantTag | null>(null);
  const [q, setQ] = useState('');

  const counts = {
    all: CONFIDANTS.length,
    normal: CONFIDANTS.filter((c) => !isSpecial(c.kind)).length,
    special: CONFIDANTS.filter((c) => isSpecial(c.kind)).length,
  };

  const list = useMemo(() => {
    const query = normalize(q.trim());
    return CONFIDANTS.filter((c) => {
      if (group !== 'all' && (group === 'special') !== isSpecial(c.kind)) return false;
      if (tag && !c.tags.includes(tag)) return false;
      if (!query) return true;
      const a = getArcana(c.arcana);
      return [c.name, a.name, a.nameEn].some((s) => normalize(s).includes(query));
    });
  }, [group, tag, q]);

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Confidentes</h1>
          <p className={styles.lead}>
            Los 23 confidentes de Persona 5 Royal. La mayoría sube de rango hablando con ellos y eligiendo bien las
            respuestas; los marcados como <strong>especiales</strong> funcionan distinto.
          </p>
        </div>
      </section>

      <div className={`container ${styles.page}`}>
        <div className={styles.filters}>
          <div className={styles.groups} role="group" aria-label="Mostrar">
            {(['all', 'normal', 'special'] as Group[]).map((g) => (
              <button
                key={g}
                type="button"
                aria-pressed={group === g}
                data-tone={g === 'special' ? 'gold' : 'red'}
                className={styles.groupBtn}
                onClick={() => setGroup(g)}
              >
                {{ all: 'Todos', normal: 'Normales', special: 'Especiales' }[g]} <span>({counts[g]})</span>
              </button>
            ))}
          </div>
          <label className={styles.search}>
            <span className="visually-hidden">Buscar por nombre o Arcana</span>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar: Ryuji, Carro…" />
          </label>
        </div>
        <div className={styles.tagFilters} role="group" aria-label="Filtrar por etiqueta">
          <span className="label label-accent">Filtrar por</span>
          {FILTER_TAGS.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tag === t}
              className={styles.tagBtn}
              onClick={() => setTag(tag === t ? null : t)}
            >
              {TAG_LABEL[t]}
            </button>
          ))}
        </div>

        {group !== 'normal' && (
          <section className={styles.legend} aria-label="Tipos de confidente especial">
            <div className={styles.legendCard}>
              <span className={styles.legendTitle}>Automático por la historia</span>
              <span>Sube solo al avanzar la trama. No hay respuestas que elegir: la ficha muestra cuándo sube cada rango y qué desbloquea.</span>
              <span className={styles.legendWho}>Igor · Morgana · Sae Niijima</span>
            </div>
            <div className={styles.legendCard}>
              <span className={styles.legendTitle}>Pedidos de fusión</span>
              <span>Cada rango pide una Persona con una skill concreta. La ficha muestra el pedido, un armado rápido y la recompensa.</span>
              <span className={styles.legendWho}>Caroline y Justine</span>
            </div>
            <div className={`${styles.legendCard} ${styles.legendPlain}`}>
              <span className={styles.legendTitle}>Normal con reglas extra</span>
              <span>Tienen respuestas como cualquiera, pero además una fecha límite, un rango bloqueado, días fijos o pedidos de Mementos.</span>
              <span className={styles.legendWho}>Akechi · Maruki · Kasumi · Sojiro · Kawakami · Mishima · Yoshida · Chihaya · Oda</span>
            </div>
          </section>
        )}

        <p className={styles.count} aria-live="polite">
          Mostrando <strong>{list.length}</strong> confidentes
        </p>

        <ul className={styles.grid}>
          {list.map((c) => {
            const arcana = getArcana(c.arcana);
            const special = isSpecial(c.kind);
            return (
              <li key={c.id}>
                <Link to={`/p5r/confidentes/${c.id}`} className={`${styles.card} ${special ? styles.cardSpecial : ''}`}>
                  <ImagePlaceholder
                    className={styles.portrait}
                    src={confidantImage(c.id)}
                    focus="50% 30%"
                    label={confidantImage(c.id) ? c.name : 'Retrato'}
                    icon="person"
                    corner={arcana.numeral}
                    badge={special ? <span className="tag tag--dlc">Especial</span> : undefined}
                  />
                  <div className={styles.body}>
                    <span className={styles.arcana}>{arcana.name}</span>
                    <span className={styles.name}>{c.name}</span>
                    {special && <span className={styles.kind}>{KIND_LABEL[c.kind]}</span>}
                    <span className={styles.tags}>
                      {c.tags.map((t) => (
                        <span key={t} className={`tag ${TAG_CLASS[t] ?? 'tag--muted'}`}>
                          {TAG_LABEL[t]}
                        </span>
                      ))}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className={styles.note}>
          Al llegar al rango 10, cada confidente desbloquea la fusión de una Persona: se ve en su ficha. Las fechas
          límite y los requisitos de atributo se confirman con varias fuentes antes de cargarlos.
        </p>
      </div>
    </>
  );
}
