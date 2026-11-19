import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../core/account/AuthContext';
import { useFavorites } from '../core/account/favorites';
import { getPersona as getP3Persona } from '../games/p3r/services/personas';
import { getLink } from '../games/p3r/services/links';
import { linkImage } from '../games/p3r/data/linkImages';
import { getArcana as getP3Arcana } from '../games/p3r/data/arcana';
import { personaName as p3Name } from '../games/p3r/services/text';
import { personaImage as p3Image, personaCardFocus as p3Focus } from '../games/p3r/services/images';
import { getPersona as getP4Persona } from '../games/p4g/services/personas';
import { getLink as getP4Link, maxPersona as p4MaxPersona } from '../games/p4g/services/links';
import { linkImage as p4LinkImage } from '../games/p4g/data/linkImages';
import { getArcana as getP4Arcana } from '../games/p4g/data/arcana';
import { personaName as p4Name } from '../games/p4g/services/text';
import { personaImage as p4Image } from '../games/p4g/services/images';
import { BuildCard as P4BuildCard } from '../games/p4g/pages/Builds';
import { BuildCard as P5SBuildCard } from '../games/p5s/pages/Builds';
import { fetchAllProgress } from '../core/account/progress';
import { listBuilds, translateBuild, pendingReports, type Build } from '../core/account/builds';
import { BuildCard } from '../games/p5r/pages/Builds';
import { BuildCard as P3BuildCard } from '../games/p3r/pages/Builds';
import { authErrorText, supabase } from '../core/account/supabase';
import { getConfidantSummary } from '../games/p5r/services/confidants';
import { confidantImage, personaCardFocus, personaImage } from '../games/p5r/services/images';
import { getPersona } from '../games/p5r/services/personas';
import { personaName } from '../games/p5r/services/gameText';
import { ARCANAS, getArcana } from '../games/p5r/data/arcana';
import styles from './MyProfile.module.css';
import { L } from '../i18n';
import { useGameBase } from '../shared/hooks/useGameBase';

type ConfRow = { confidant_id: string; rank: number; summary: ReturnType<typeof getConfidantSummary> };
const arcanaIndex = (r: ConfRow) => ARCANAS.findIndex((a) => a.id === r.summary?.arcana);
const byName = (a: ConfRow, b: ConfRow) => (a.summary?.name ?? '').localeCompare(b.summary?.name ?? '');
const SORTS = {
  most: { label: () => L('Más avanzados', 'Most advanced'), cmp: (a: ConfRow, b: ConfRow) => b.rank - a.rank || byName(a, b) },
  least: { label: () => L('Menos avanzados', 'Least advanced'), cmp: (a: ConfRow, b: ConfRow) => a.rank - b.rank || byName(a, b) },
  arcana: { label: () => L('Por arcano', 'By Arcana'), cmp: (a: ConfRow, b: ConfRow) => arcanaIndex(a) - arcanaIndex(b) || byName(a, b) },
  name: { label: () => 'A–Z', cmp: byName },
};
type SortKey = keyof typeof SORTS;

/** Mi perfil: nombre de usuario, confidentes en curso y Personas favoritas. */
export default function MyProfile() {
  const base = useGameBase();
  const { user, profile, loading, signOut, refreshProfile, recovering, doneRecovering } = useAuth();
  const { ids: favorites } = useFavorites();
  const [progress, setProgress] = useState<{ confidant_id: string; rank: number }[] | null>(null);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [pending, setPending] = useState(0);
  const [sort, setSortState] = useState<SortKey>(() => {
    try {
      const v = localStorage.getItem('pgr.confSort') as SortKey | null;
      return v && v in SORTS ? v : 'most';
    } catch {
      return 'most';
    }
  });
  const setSort = (k: SortKey) => {
    setSortState(k);
    try {
      localStorage.setItem('pgr.confSort', k);
    } catch {
      /* sin almacenamiento */
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchAllProgress(user.id).then(setProgress);
    listBuilds({ userId: user.id, game: 'all' }).then((l) => setBuilds(l.map(translateBuild)));
  }, [user]);
  useEffect(() => {
    if (profile?.is_admin) pendingReports().then(setPending);
  }, [profile?.is_admin]);

  if (loading) return <div className="container" style={{ paddingBlock: 80 }}>{L('Cargando…', 'Loading…')}</div>;
  if (!user) return <Navigate to={`${base}/cuenta`} replace />;

  const confidants = (progress ?? [])
    .map((r) => ({ ...r, summary: getConfidantSummary(r.confidant_id) }))
    .filter((r) => r.summary)
    .sort(SORTS[sort].cmp);
  const personas = favorites.map((id) => getPersona(id)).filter((p) => p !== undefined);
  const links = (progress ?? [])
    .filter((r) => r.confidant_id.startsWith('p3r-'))
    .map((r) => ({ ...r, link: getLink(r.confidant_id.slice(4)) }))
    .filter((r) => r.link)
    .sort((a, b) => (sort === 'least' ? a.rank - b.rank : b.rank - a.rank));
  const p4Links = (progress ?? [])
    .filter((r) => r.confidant_id.startsWith('p4g-'))
    .map((r) => ({ ...r, link: getP4Link(r.confidant_id.slice(4)) }))
    .filter((r) => r.link)
    .sort((a, b) => (sort === 'least' ? a.rank - b.rank : b.rank - a.rank));
  const p4gFavs = favorites.filter((id) => id.startsWith('p4g:')).map((id) => getP4Persona(id.slice(4))).filter((p) => p !== undefined);
  const p3rFavs = favorites.filter((id) => id.startsWith('p3r:')).map((id) => getP3Persona(id.slice(4))).filter((p) => p !== undefined);

  return (
    <section className={`container ${styles.page}`}>
      <header className={styles.head}>
        <div className={styles.avatar} aria-hidden="true">
          {(profile?.username ?? user.email ?? '?').slice(0, 2).toUpperCase()}
        </div>
        <div className={styles.who}>
          <h1 className={styles.title}>{profile?.username ?? L('Mi perfil', 'My profile')}</h1>
          <span className={styles.email}>{user.email}</span>
          {profile?.is_admin && (
            <Link to={`${base}/admin`} className={styles.admin}>
              {L('Administrador · Abrir panel →', 'Administrator · Open panel →')}
            </Link>
          )}
        </div>
        <button type="button" className="btn btn--dark" onClick={() => void signOut()}>
          {L('Cerrar sesión', 'Log out')}
        </button>
      </header>

      {pending > 0 && (
        <Link to={`${base}/admin`} className={styles.alert}>
          ⚠ {L(`Tenés ${pending} reporte${pending === 1 ? '' : 's'} sin revisar. Entrá al panel para ver si hace falta una sanción →`, `You have ${pending} unreviewed report${pending === 1 ? '' : 's'}. Open the panel to see if a sanction is needed →`)}
        </Link>
      )}
      {recovering && <NewPassword onDone={doneRecovering} />}
      <UsernameForm current={profile?.username ?? ''} onSaved={refreshProfile} />

      {(confidants.length > 0 || links.length + p4Links.length === 0) && (
      <div className={styles.block}>
        <div className={styles.blockHead}>
          <h2 className={styles.h2}>{L('Mis confidentes · Persona 5 Royal', 'My confidants · Persona 5 Royal')}</h2>
          {confidants.length > 1 && (
            <div className={styles.sorts} role="group" aria-label={L('Ordenar confidentes', 'Sort confidants')}>
              {(Object.keys(SORTS) as SortKey[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`${styles.sortBtn} ${sort === k ? styles.sortOn : ''}`}
                  aria-pressed={sort === k}
                  onClick={() => setSort(k)}
                >
                  {SORTS[k].label()}
                </button>
              ))}
            </div>
          )}
        </div>
        {progress === null ? (
          <p className={styles.empty}>{L('Cargando…', 'Loading…')}</p>
        ) : confidants.length === 0 ? (
          <p className={styles.empty}>
            {L('Todavía no seguís ningún confidente. Entrá a uno desde', 'You are not tracking any confidant yet. Open one from')}{' '}
            <Link to="/p5r/confidentes">{L('Confidentes', 'Confidants')}</Link>{' '}
            {L('y activá «Seguimiento de progreso».', 'and turn on «Progress tracking».')}
          </p>
        ) : (
          <ul className={styles.confList}>
            {confidants.map(({ confidant_id, rank, summary }) => (
              <li key={confidant_id}>
                <Link to={`/p5r/confidentes/${confidant_id}`} className={styles.conf}>
                  {confidantImage(confidant_id) ? (
                    <img src={confidantImage(confidant_id)} alt="" className={styles.confImg} />
                  ) : (
                    <span className={styles.confImg} />
                  )}
                  <span className={styles.confText}>
                    <strong>{summary!.name}</strong>
                    <span>{getArcana(summary!.arcana).name}</span>
                  </span>
                  <span className={styles.rank}>
                    {rank >= 10 ? L('Rango MAX', 'Rank MAX') : `${L('Rango', 'Rank')} ${rank}`}
                    <span className={styles.bar}>
                      <i style={{ width: `${Math.min(rank, 10) * 10}%` }} />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      )}

      {links.length > 0 && (
        <div className={styles.block}>
          <h2 className={styles.h2}>{L('Vínculos en curso · Persona 3 Reload', 'Social Links in progress · Persona 3 Reload')}</h2>
          <ul className={styles.confList}>
            {links.map(({ confidant_id, rank, link }) => {
              const a = getP3Arcana(link!.arcana);
              const img = link!.spoiler ? undefined : linkImage(link!.arcana);
              return (
                <li key={confidant_id}>
                  <Link to={`/p3r/vinculos/${link!.arcana}`} className={styles.conf}>
                    {img ? <img src={img} alt="" className={styles.confImg} style={{ objectPosition: 'top' }} /> : <span className={styles.confImg} />}
                    <span className={styles.confText}>
                      <strong>{link!.spoiler ? L('Spoiler', 'Spoiler') : L(link!.who[0], link!.who[1])}</strong>
                      <span>{a.name}</span>
                    </span>
                    <span className={styles.rank}>
                      {rank >= 10 ? L('Rango MAX', 'Rank MAX') : `${L('Rango', 'Rank')} ${rank}`}
                      <span className={styles.bar}>
                        <i style={{ width: `${Math.min(rank, 10) * 10}%` }} />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {p4Links.length > 0 && (
        <div className={styles.block}>
          <h2 className={styles.h2}>{L('Vínculos en curso · Persona 4 Golden', 'Social Links in progress · Persona 4 Golden')}</h2>
          <ul className={styles.confList}>
            {p4Links.map(({ confidant_id, rank, link }) => {
              const a = getP4Arcana(link!.arcana);
              const own = link!.spoiler ? undefined : p4LinkImage(link!.id);
              const mp = link!.spoiler ? undefined : p4MaxPersona(link!.arcana);
              const img = own ?? (mp ? p4Image(mp.id) : undefined);
              return (
                <li key={confidant_id}>
                  <Link to={`/p4g/vinculos/${link!.id}`} className={styles.conf}>
                    {img ? <img src={img} alt="" className={`${styles.confImg} ${own ? '' : 'p4g-art'}`} style={own ? { objectPosition: 'top' } : { objectFit: 'contain' }} /> : <span className={styles.confImg} />}
                    <span className={styles.confText}>
                      <strong>{link!.spoiler ? L('Spoiler', 'Spoiler') : L(link!.who[0], link!.who[1])}</strong>
                      <span>{a.name}</span>
                    </span>
                    <span className={styles.rank}>
                      {rank >= 10 ? L('Rango MAX', 'Rank MAX') : `${L('Rango', 'Rank')} ${rank}`}
                      <span className={styles.bar}>
                        <i style={{ width: `${Math.min(rank, 10) * 10}%` }} />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className={styles.block}>
        <h2 className={styles.h2}>{L('Personas favoritas', 'Favorite Personas')}</h2>
        {personas.length + p3rFavs.length + p4gFavs.length === 0 ? (
          <p className={styles.empty}>
            {L('Todavía no tenés favoritas. Tocá la estrella en el perfil de cualquier Persona del', 'No favorites yet. Tap the star on the profile of any Persona in the')}{' '}
            <Link to="/p5r/calculadora">{L('catálogo', 'catalog')}</Link>.
          </p>
        ) : personas.length === 0 ? null : (
          <>
          <h3 className={styles.h2} style={{ fontSize: 22, marginTop: 4 }}>Persona 5 Royal</h3>
          <ul className={styles.favGrid}>
            {personas.map((p) => (
              <li key={p.id}>
                <Link to={`/p5r/calculadora/persona/${p.id}`} className={styles.fav}>
                  {personaImage(p.id, 'side') ? (
                    <img src={personaImage(p.id, 'side')} alt="" style={{ objectPosition: personaCardFocus(p.id) }} />
                  ) : (
                    <span className={styles.favEmpty} />
                  )}
                  <span className={styles.favName}>{personaName(p)}</span>
                  <span className={styles.favLvl}>{L('Nv', 'Lv')} {p.level}</span>
                </Link>
              </li>
            ))}
          </ul>
          </>
        )}
        {p3rFavs.length > 0 && (
          <>
            <h3 className={styles.h2} style={{ fontSize: 22, marginTop: 18 }}>Persona 3 Reload</h3>
            <ul className={styles.favGrid}>
              {p3rFavs.map((p) => (
                <li key={p.id}>
                  <Link to={`/p3r/calculadora/persona/${p.id}`} className={styles.fav}>
                    {p3Image(p.id, 'side') ? (
                      <img src={p3Image(p.id, 'side')} alt="" style={{ objectPosition: p3Focus(p.id) }} />
                    ) : (
                      <span className={styles.favEmpty} />
                    )}
                    <span className={styles.favName}>{p3Name(p)}</span>
                    <span className={styles.favLvl}>{L('Nv', 'Lv')} {p.level}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
        {p4gFavs.length > 0 && (
          <>
            <h3 className={styles.h2} style={{ fontSize: 22, marginTop: 18 }}>Persona 4 Golden</h3>
            <ul className={styles.favGrid}>
              {p4gFavs.map((p) => (
                <li key={p.id}>
                  <Link to={`/p4g/calculadora/persona/${p.id}`} className={styles.fav}>
                    {p4Image(p.id) ? (
                      <img src={p4Image(p.id)} alt="" className="p4g-art" style={{ objectFit: 'contain', padding: 6 }} />
                    ) : (
                      <span className={styles.favEmpty} />
                    )}
                    <span className={styles.favName}>{p4Name(p)}</span>
                    <span className={styles.favLvl}>{L('Nv', 'Lv')} {p.level}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className={styles.block}>
        <h2 className={styles.h2}>{L('Mis builds', 'My builds')}</h2>
        {builds.length === 0 ? (
          <p className={styles.empty}>
            {L('Todavía no publicaste ninguna.', 'You have not published any yet.')} <Link to={`${base}/builds/nueva`}>{L('Crear una build', 'Create a build')}</Link>.
          </p>
        ) : (
          <ul className={styles.favGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            {builds.map((b) => (
              <li key={b.id}>
                {b.game === 'p3r' ? <P3BuildCard build={b} /> : b.game === 'p4g' ? <P4BuildCard build={b} /> : b.game === 'p5s' ? <P5SBuildCard build={b} /> : <BuildCard build={b} />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function UsernameForm({ current, onSaved }: { current: string; onSaved: () => Promise<void> }) {
  const { user } = useAuth();
  const [name, setName] = useState(current);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => setName(current), [current]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const v = name.trim();
    if (!/^[A-Za-z0-9_.-]{3,24}$/.test(v)) {
      return setMsg({ ok: false, text: L('Usá entre 3 y 24 letras, números, punto, guion o guion bajo.', 'Use 3 to 24 letters, numbers, dot, hyphen or underscore.') });
    }
    const { error } = await supabase.from('profiles').update({ username: v }).eq('id', user!.id);
    if (error) return setMsg({ ok: false, text: authErrorText(error.message) });
    setMsg({ ok: true, text: L('Nombre guardado.', 'Name saved.') });
    await onSaved();
  };

  return (
    <form onSubmit={save} className={styles.inline}>
      <label className={styles.field}>
        <span className="label">{L('Nombre de usuario', 'Username')}</span>
        <input value={name} onChange={(e) => { setName(e.target.value); setMsg(null); }} placeholder="joker_ar" maxLength={24} />
      </label>
      <button type="submit" className="btn btn--accent">{L('Guardar', 'Save')}</button>
      {msg && <p className={msg.ok ? styles.ok : styles.error}>{msg.text}</p>}
      {!current && <p className={styles.hint}>{L('Elegí un nombre: es el que se va a ver en tus builds y comentarios.', 'Choose a name: it is the one shown on your builds and comments.')}</p>}
    </form>
  );
}

function NewPassword({ onDone }: { onDone: () => void }) {
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (pw.length < 6) return setMsg({ ok: false, text: L('La contraseña tiene que tener al menos 6 caracteres.', 'The password must have at least 6 characters.') });
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return setMsg({ ok: false, text: authErrorText(error.message) });
    setMsg({ ok: true, text: L('Contraseña cambiada.', 'Password changed.') });
    setTimeout(onDone, 1500);
  };
  return (
    <form onSubmit={save} className={`${styles.inline} ${styles.recover}`}>
      <label className={styles.field}>
        <span className="label">{L('Nueva contraseña', 'New password')}</span>
        <input type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} />
      </label>
      <button type="submit" className="btn btn--accent">{L('Cambiar contraseña', 'Change password')}</button>
      {msg && <p className={msg.ok ? styles.ok : styles.error}>{msg.text}</p>}
    </form>
  );
}
