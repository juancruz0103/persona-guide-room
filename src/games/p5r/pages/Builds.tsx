import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../core/account/AuthContext';
import { formatDate, listBuilds, translateBuild, type Build } from '../../../core/account/builds';
import { getCatalogPersonas, getPersona } from '../services/personas';
import { personaName } from '../services/gameText';
import { personaCardFocus, personaImage } from '../services/images';
import { PersonaSelect } from '../components/PersonaSelect';
import styles from './Builds.module.css';
import { L } from '../../../i18n';

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
    listBuilds({ personaId: personaId || undefined }).then((l) => setBuilds(l.map(translateBuild)));
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
          <span className={styles.kicker}>{L('Comunidad', 'Community')}</span>
          <h1 className={styles.title}>{L('Builds de Personas', 'Persona builds')}</h1>
          <p className={styles.lead}>
            {L('Rutas de fusión paso a paso: qué Personas fusionar y qué habilidades heredar en cada paso hasta llegar a la Persona final.', 'Step-by-step fusion routes: which Personas to fuse and which skills to inherit at each step until you reach the final Persona.')}
          </p>
          <Link to={user ? '/p5r/builds/nueva' : '/p5r/cuenta'} state={{ from: '/p5r/builds/nueva' }} className="btn btn--dark">
            {L('+ Crear build', '+ Create build')}
          </Link>
        </div>
      </section>

      <section className={`container ${styles.controls}`}>
        <label className={styles.field}>
          <span className="label label-accent">{L('Persona final', 'Final Persona')}</span>
          <PersonaSelect
            id="build-persona"
            value={personaId}
            options={personas}
            placeholder={L('Todas las Personas', 'All Personas')}
            onChange={(v) => setParams(v ? { persona: v } : {})}
          />
        </label>
        <label className={styles.field}>
          <span className="label label-accent">{L('Ordenar', 'Sort')}</span>
          <select value={order} onChange={(e) => setOrder(e.target.value as 'new' | 'likes')}>
            <option value="new">{L('Más nuevas', 'Newest')}</option>
            <option value="likes">{L('Más votadas', 'Most liked')}</option>
          </select>
        </label>
      </section>

      <section className={`container ${styles.list}`}>
        {sorted === null ? (
          <p className="pending">{L('Cargando…', 'Loading…')}</p>
        ) : sorted.length === 0 ? (
          <p className="pending">
            {personaId
              ? L('Todavía no hay builds para esta Persona. ¡Sé el primero en crear una!', 'There are no builds for this Persona yet. Be the first to create one!')
              : L('Todavía no hay builds. ¡Sé el primero en crear una!', 'There are no builds yet. Be the first to create one!')}
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
        <img loading="lazy" decoding="async" src={img} alt="" className={styles.cardImg} style={{ objectPosition: personaCardFocus(b.persona_id) }} />
      ) : (
        <span className={styles.cardImg} />
      )}
      <span className={styles.cardBody}>
        <span className={styles.cardPersona}>{p ? personaName(p) : b.persona_id}</span>
        <strong className={styles.cardTitle}>{b.title}</strong>
        <span className={styles.cardMeta}>
          {L('por', 'by')} {b.author?.username ?? L('anónimo', 'anonymous')} · {formatDate(b.created_at)}
        </span>
        <span className={styles.cardStats}>
          <span>♥ {b.likes ?? 0}</span>
          <span>{b.comments ?? 0} {L('coment.', 'comments')}</span>
          <span>{b.steps.length} {b.steps.length === 1 ? L('paso', 'step') : L('pasos', 'steps')}</span>
          {b.hidden && <span className={styles.hiddenTag}>{L('Oculta', 'Hidden')}</span>}
        </span>
      </span>
    </Link>
  );
}
