import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../core/account/AuthContext';
import {
  addComment,
  deleteBuild,
  formatDate,
  getBuild,
  hasLiked,
  listComments,
  report,
  setLike,
  type Build,
  type BuildComment,
} from '../../../core/account/builds';
import { authErrorText, supabase } from '../../../core/account/supabase';
import { BackButton } from '../../../shared/components/BackButton';
import { BuildGoalView, BuildRequirements, BuildTimeline } from '../components/BuildTimeline';
import styles from './Builds.module.css';

/** Una build: la línea de fusiones paso a paso, likes y comentarios. */
export default function BuildView() {
  const { buildId = '' } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [build, setBuild] = useState<Build | null | undefined>(undefined);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    getBuild(buildId).then((b) => {
      setBuild(b);
      setLikes(b?.likes ?? 0);
    });
  }, [buildId]);
  useEffect(() => {
    if (user) hasLiked(user.id, buildId).then(setLiked);
  }, [user, buildId]);

  if (build === undefined) return <div className="container" style={{ paddingBlock: 80 }}>Cargando…</div>;
  if (!build) {
    return (
      <section className="container" style={{ paddingBlock: 80 }}>
        <p className="pending">No encontramos esa build.</p>
        <Link to="/p5r/builds">← Volver a las builds</Link>
      </section>
    );
  }

  const mine = user?.id === build.user_id;
  const admin = !!profile?.is_admin;

  const toggleLike = async () => {
    if (!user) return navigate('/p5r/cuenta', { state: { from: `/p5r/builds/${build.id}` } });
    const on = !liked;
    setLiked(on);
    setLikes((n) => n + (on ? 1 : -1));
    await setLike(user.id, build.id, on);
  };
  const remove = async () => {
    if (!window.confirm('¿Borrar esta build? No se puede deshacer.')) return;
    await deleteBuild(build.id);
    navigate('/p5r/builds');
  };
  const toggleHidden = async () => {
    await supabase.from('builds').update({ hidden: !build.hidden }).eq('id', build.id);
    setBuild({ ...build, hidden: !build.hidden });
  };

  return (
    <article>
      <div className={`container ${styles.back}`}>
        <BackButton fallback="/p5r/builds" />
      </div>
      <section className={`container ${styles.viewHead}`}>
        <h1 className={styles.viewTitle}>{build.title}</h1>
        <p className={styles.cardMeta}>
          por <strong>{build.author?.username ?? 'anónimo'}</strong> · {formatDate(build.created_at)}
        </p>
        {build.hidden && <p className={styles.hiddenNote}>Esta build está oculta por moderación: solo la ves vos.</p>}
        {build.description && <p className={styles.desc}>{build.description}</p>}
        <div className={styles.actions}>
          <button type="button" className={`${styles.likeBtn} ${liked ? styles.liked : ''}`} aria-pressed={liked} onClick={toggleLike}>
            ♥ {likes}
          </button>
          {mine && (
            <Link to={`/p5r/builds/${build.id}/editar`} className={styles.smallBtn}>
              Editar
            </Link>
          )}
          {(mine || admin) && (
            <button type="button" className={styles.smallBtn} onClick={remove}>
              Borrar
            </button>
          )}
          {admin && !mine && (
            <button type="button" className={styles.smallBtn} onClick={toggleHidden}>
              {build.hidden ? 'Mostrar' : 'Ocultar'}
            </button>
          )}
          {user && !mine && <ReportButton type="build" id={build.id} />}
        </div>
      </section>

      <section className={`container ${styles.viewBody}`}>
        {build.goal && <BuildGoalView goal={build.goal} />}
        <BuildRequirements steps={build.steps} cards={build.skill_cards} />
        <BuildTimeline steps={build.steps} cards={build.skill_cards} />
      </section>

      <Comments buildId={build.id} />
    </article>
  );
}

function Comments({ buildId }: { buildId: string }) {
  const { user, profile } = useAuth();
  const [list, setList] = useState<BuildComment[] | null>(null);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const load = () => listComments(buildId).then(setList);
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildId]);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const t = body.trim();
    if (!t) return setError('Escribí algo primero.');
    if (!profile?.username) return setError('Elegí un nombre de usuario en «Mi perfil» antes de comentar.');
    const { error: err } = await addComment(user!.id, buildId, t);
    if (err) return setError(err.message.includes('row-level') ? 'Tu cuenta no puede comentar.' : authErrorText(err.message));
    setBody('');
    load();
  };
  const remove = async (id: string) => {
    await supabase.from('build_comments').delete().eq('id', id);
    load();
  };
  const hide = async (c: BuildComment) => {
    await supabase.from('build_comments').update({ hidden: !c.hidden }).eq('id', c.id);
    load();
  };

  return (
    <section className={`container ${styles.comments}`}>
      <h2 className={styles.h2}>Comentarios{list ? ` (${list.length})` : ''}</h2>
      {list?.map((c) => (
        <div key={c.id} className={`${styles.comment} ${c.hidden ? styles.commentHidden : ''}`}>
          <p className={styles.commentHead}>
            <strong>{c.author?.username ?? 'anónimo'}</strong> · {formatDate(c.created_at)}
            {c.hidden && ' · oculto'}
          </p>
          <p className={styles.commentBody}>{c.body}</p>
          <div className={styles.commentActions}>
            {(user?.id === c.user_id || profile?.is_admin) && (
              <button type="button" onClick={() => remove(c.id)}>Borrar</button>
            )}
            {profile?.is_admin && user?.id !== c.user_id && (
              <button type="button" onClick={() => hide(c)}>{c.hidden ? 'Mostrar' : 'Ocultar'}</button>
            )}
            {user && user.id !== c.user_id && <ReportButton type="comment" id={c.id} compact />}
          </div>
        </div>
      ))}
      {user ? (
        <form onSubmit={send} className={styles.commentForm}>
          <textarea value={body} onChange={(e) => { setBody(e.target.value); setError(''); }} maxLength={1000} rows={3} placeholder="¿Te sirvió? ¿Algún consejo?" />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className="btn btn--accent">Comentar</button>
        </form>
      ) : (
        <p className="pending">
          <Link to="/p5r/cuenta" state={{ from: `/p5r/builds/${buildId}` }}>Entrá</Link> para comentar.
        </p>
      )}
    </section>
  );
}

export function ReportButton({ type, id, compact }: { type: 'build' | 'comment' | 'user'; id: string; compact?: boolean }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('Lenguaje ofensivo');
  const [sent, setSent] = useState(false);
  if (sent) return <span className={styles.sent}>Reporte enviado</span>;
  if (!open) {
    return (
      <button type="button" className={compact ? undefined : styles.smallBtn} onClick={() => setOpen(true)}>
        Reportar
      </button>
    );
  }
  const send = async () => {
    await report(user!.id, type, id, reason);
    setSent(true);
  };
  return (
    <span className={styles.reportBox}>
      <select value={reason} onChange={(e) => setReason(e.target.value)}>
        <option>Lenguaje ofensivo</option>
        <option>Spam o publicidad</option>
        <option>Spoilers sin aviso</option>
        <option>Información incorrecta</option>
        <option>Otro</option>
      </select>
      <button type="button" onClick={send}>Enviar</button>
      <button type="button" onClick={() => setOpen(false)}>Cancelar</button>
    </span>
  );
}
