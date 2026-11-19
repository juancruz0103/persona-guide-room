import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../core/account/AuthContext';
import {
  addComment,
  deleteBuild,
  formatDate,
  getBuild, translateBuild,
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
import styles from '../../p3r/pages/Builds.module.css';
import { L } from '../../../i18n';

/** Una build: la línea de fusiones paso a paso, likes y comentarios. */
export default function BuildView() {
  const { buildId = '' } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [build, setBuild] = useState<Build | null | undefined>(undefined);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    getBuild(buildId).then((raw) => {
      const b = raw && raw.game === 'p5s' ? translateBuild(raw) : null;
      setBuild(b);
      setLikes(b?.likes ?? 0);
    });
  }, [buildId]);
  useEffect(() => {
    if (user) hasLiked(user.id, buildId).then(setLiked);
  }, [user, buildId]);

  if (build === undefined) return <div className="container" style={{ paddingBlock: 80 }}>{L('Cargando…', 'Loading…')}</div>;
  if (!build) {
    return (
      <section className="container" style={{ paddingBlock: 80 }}>
        <p className="pending">{L('No encontramos esa build.', 'We could not find that build.')}</p>
        <Link to="/p5s/builds">{L('← Volver a las builds', '← Back to builds')}</Link>
      </section>
    );
  }

  const mine = user?.id === build.user_id;
  const admin = !!profile?.is_admin;

  const toggleLike = async () => {
    if (!user) return navigate('/p5s/cuenta', { state: { from: `/p5s/builds/${build.id}` } });
    const on = !liked;
    setLiked(on);
    setLikes((n) => n + (on ? 1 : -1));
    const { error } = await setLike(user.id, build.id, on);
    if (error) {
      setLiked(!on);
      setLikes((n) => n - (on ? 1 : -1));
    }
  };
  const remove = async () => {
    if (!window.confirm(L('¿Borrar esta build? No se puede deshacer.', 'Delete this build? This cannot be undone.'))) return;
    await deleteBuild(build.id);
    navigate('/p5s/builds');
  };
  const toggleHidden = async () => {
    await supabase.from('builds').update({ hidden: !build.hidden }).eq('id', build.id);
    setBuild({ ...build, hidden: !build.hidden });
  };

  return (
    <article>
      <div className={`container ${styles.back}`}>
        <BackButton fallback="/p5s/builds" />
      </div>
      <section className={`container ${styles.viewHead}`}>
        <h1 className={styles.viewTitle}>{build.title}</h1>
        <p className={styles.cardMeta}>
          {L('por', 'by')} <strong>{build.author?.username ?? L('anónimo', 'anonymous')}</strong> · {formatDate(build.created_at)}
        </p>
        {build.hidden && <p className={styles.hiddenNote}>{L('Esta build está oculta por moderación: solo la ves vos.', 'This build is hidden by moderation: only you can see it.')}</p>}
        {build.description && <p className={styles.desc}>{build.description}</p>}
        <div className={styles.actions}>
          <button type="button" className={`${styles.likeBtn} ${liked ? styles.liked : ''}`} aria-pressed={liked} onClick={toggleLike}>
            ♥ {likes}
          </button>
          {mine && (
            <Link to={`/p5s/builds/${build.id}/editar`} className={styles.smallBtn}>
              {L('Editar', 'Edit')}
            </Link>
          )}
          {(mine || admin) && (
            <button type="button" className={styles.smallBtn} onClick={remove}>
              {L('Borrar', 'Delete')}
            </button>
          )}
          {admin && !mine && (
            <button type="button" className={styles.smallBtn} onClick={toggleHidden}>
              {build.hidden ? L('Mostrar', 'Show') : L('Ocultar', 'Hide')}
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
    if (!t) return setError(L('Escribí algo primero.', 'Write something first.'));
    if (!profile?.username) return setError(L('Elegí un nombre de usuario en «Mi perfil» antes de comentar.', 'Choose a username in «My profile» before commenting.'));
    const { error: err } = await addComment(user!.id, buildId, t);
    if (err) return setError(err.message.includes('row-level') ? L('Tu cuenta no puede comentar.', 'Your account cannot comment.') : authErrorText(err.message));
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
      <h2 className={styles.h2}>{L('Comentarios', 'Comments')}{list ? ` (${list.length})` : ''}</h2>
      {list?.map((c) => (
        <div key={c.id} className={`${styles.comment} ${c.hidden ? styles.commentHidden : ''}`}>
          <p className={styles.commentHead}>
            <strong>{c.author?.username ?? L('anónimo', 'anonymous')}</strong> · {formatDate(c.created_at)}
            {c.hidden && L(' · oculto', ' · hidden')}
          </p>
          <p className={styles.commentBody}>{c.body}</p>
          <div className={styles.commentActions}>
            {(user?.id === c.user_id || profile?.is_admin) && (
              <button type="button" onClick={() => remove(c.id)}>{L('Borrar', 'Delete')}</button>
            )}
            {profile?.is_admin && user?.id !== c.user_id && (
              <button type="button" onClick={() => hide(c)}>{c.hidden ? L('Mostrar', 'Show') : L('Ocultar', 'Hide')}</button>
            )}
            {user && user.id !== c.user_id && <ReportButton type="comment" id={c.id} compact />}
          </div>
        </div>
      ))}
      {user ? (
        <form onSubmit={send} className={styles.commentForm}>
          <textarea value={body} onChange={(e) => { setBody(e.target.value); setError(''); }} maxLength={1000} rows={3} placeholder={L('¿Te sirvió? ¿Algún consejo?', 'Did it help? Any tips?')} />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className="btn btn--accent">{L('Comentar', 'Comment')}</button>
        </form>
      ) : (
        <p className="pending">
          <Link to="/p5s/cuenta" state={{ from: `/p5s/builds/${buildId}` }}>{L('Entrá', 'Log in')}</Link> {L('para comentar.', 'to comment.')}
        </p>
      )}
    </section>
  );
}

const REASONS: [string, string][] = [
  ['Lenguaje ofensivo', 'Offensive language'],
  ['Spam o publicidad', 'Spam or advertising'],
  ['Spoilers sin aviso', 'Unmarked spoilers'],
  ['Información incorrecta', 'Wrong information'],
  ['Otro', 'Other'],
];

export function ReportButton({ type, id, compact }: { type: 'build' | 'comment' | 'user'; id: string; compact?: boolean }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('Lenguaje ofensivo');
  const [details, setDetails] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errText, setErrText] = useState('');
  if (state === 'sent') return <span className={styles.sent}>{L('Reporte enviado. Lo va a revisar un administrador.', 'Report sent. An administrator will review it.')}</span>;
  if (!open) {
    return (
      <button type="button" className={compact ? undefined : styles.smallBtn} onClick={() => setOpen(true)}>
        {L('Reportar', 'Report')}
      </button>
    );
  }
  const send = async () => {
    setState('sending');
    const { error } = await report(user!.id, type, id, reason, details);
    setErrText(error?.message?.includes('RATE_LIMIT') ? authErrorText(error.message) : L('No se pudo enviar. Probá de nuevo.', 'It could not be sent. Try again.'));
    setState(error ? 'error' : 'sent');
  };
  return (
    <span className={styles.reportBox}>
      <span className={styles.reportTitle}>{L('¿Por qué lo reportás?', 'Why are you reporting it?')}</span>
      <select value={reason} onChange={(e) => setReason(e.target.value)}>
        {REASONS.map(([es, en]) => (
          <option key={es} value={es}>{L(es, en)}</option>
        ))}
      </select>
      <textarea
        value={details}
        maxLength={500}
        rows={2}
        onChange={(e) => setDetails(e.target.value)}
        placeholder={L('Contanos qué pasa (opcional)', 'Tell us what is wrong (optional)')}
      />
      {state === 'error' && <span className={styles.error}>{errText}</span>}
      <span className={styles.reportActions}>
        <button type="button" onClick={send} disabled={state === 'sending'}>{L('Enviar reporte', 'Send report')}</button>
        <button type="button" onClick={() => setOpen(false)}>{L('Cancelar', 'Cancel')}</button>
      </span>
    </span>
  );
}
