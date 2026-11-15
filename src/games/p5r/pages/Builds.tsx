import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../core/account/AuthContext';
import { formatDate, listBuilds, type Build } from '../../../core/account/builds';
import { getCatalogPersonas, getPersona } from '../services/personas';
import { personaName } from '../services/gameText';
import { personaCardFocus, personaImage } from '../services/images';
import { PersonaSelect } from '../components/PersonaSelect';
import styles from './Builds.module.css';

/** Guía de builds: lista de builds de la comunidad, filtrable por Persona final. */
export default function Builds() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const personaId = params.get('persona') ?? '';
  const [builds, setBuilds] = useState<Build[] | null>(null);
  const [order, setOrder] = useState<'new' | 'likes'>('new');
  const personas = useMemo(() => getCatalogPersonas(), []);

  useEffect(() => {
    setBuilds(null);
    listBuilds({ personaId: personaId || undefined }).then(setBuilds);
  }, [personaId]);

  const sorted = useMemo(() => {
    if (!builds) return null;
    return order === 'likes' ? [...builds].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)) : builds;
  }, [builds, order]);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroSlab} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <span className={styles.kicker}>Comunidad</span>
          <h1 className={styles.title}>Builds de Personas</h1>
          <p className={styles.lead}>
            Rutas de fusión paso a paso: qué Personas fusionar y qué habilidades heredar en cada paso hasta llegar a la
            Persona final.
          </p>
          <Link to={user ? '/p5r/builds/nueva' : '/p5r/cuenta'} state={{ from: '/p5r/builds/nueva' }} className="btn btn--dark">
            + Crear build
          </Link>
        </div>
      </section>

      <section className={`container ${styles.controls}`}>
        <label className={styles.field}>
          <span className="label label-accent">Persona final</span>
          <PersonaSelect
            id="build-persona"
            value={personaId}
            options={personas}
            placeholder="Todas las Personas"
            onChange={(v) => setParams(v ? { persona: v } : {})}
          />
        </label>
        <label className={styles.field}>
          <span className="label label-accent">Ordenar</span>
          <select value={order} onChange={(e) => setOrder(e.target.value as 'new' | 'likes')}>
            <option value="new">Más nuevas</option>
            <option value="likes">Más votadas</option>
          </select>
        </label>
      </section>

      <section className={`container ${styles.list}`}>
        {sorted === null ? (
          <p className="pending">Cargando…</p>
        ) : sorted.length === 0 ? (
          <p className="pending">
            Todavía no hay builds{personaId ? ' para esta Persona' : ''}. ¡Sé el primero en crear una!
          </p>
        ) : (
          <ul className={styles.grid}>
            {sorted.map((b) => (
              <li key={b.id}>
                <BuildCard build={b} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

export function BuildCard({ build: b }: { build: Build }) {
  const p = getPersona(b.persona_id);
  const img = personaImage(b.persona_id, 'side');
  return (
    <Link to={`/p5r/builds/${b.id}`} className={styles.card}>
      {img ? (
        <img src={img} alt="" className={styles.cardImg} style={{ objectPosition: personaCardFocus(b.persona_id) }} />
      ) : (
        <span className={styles.cardImg} />
      )}
      <span className={styles.cardBody}>
        <span className={styles.cardPersona}>{p ? personaName(p) : b.persona_id}</span>
        <strong className={styles.cardTitle}>{b.title}</strong>
        <span className={styles.cardMeta}>
          por {b.author?.username ?? 'anónimo'} · {formatDate(b.created_at)}
        </span>
        <span className={styles.cardStats}>
          <span>♥ {b.likes ?? 0}</span>
          <span>{b.comments ?? 0} coment.</span>
          <span>{b.steps.length} {b.steps.length === 1 ? 'paso' : 'pasos'}</span>
          {b.hidden && <span className={styles.hiddenTag}>Oculta</span>}
        </span>
      </span>
    </Link>
  );
}
