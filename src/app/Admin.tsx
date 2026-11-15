import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../core/account/AuthContext';
import { formatDate } from '../core/account/builds';
import { supabase } from '../core/account/supabase';
import styles from './Admin.module.css';

interface Report {
  id: string;
  target_type: 'build' | 'comment' | 'user';
  target_id: string;
  reason: string | null;
  created_at: string;
  reporter: { username: string | null } | null;
}
interface UserRow {
  id: string;
  username: string | null;
  banned: boolean;
  is_admin: boolean;
  created_at: string;
}

/** Panel de administración: reportes, usuarios y palabras prohibidas. */
export default function Admin() {
  const { profile, loading } = useAuth();
  const [tab, setTab] = useState<'reports' | 'users' | 'words'>('reports');
  if (loading) return <div className="container" style={{ paddingBlock: 80 }}>Cargando…</div>;
  if (!profile?.is_admin) return <Navigate to="/p5r" replace />;
  return (
    <section className={`container ${styles.page}`}>
      <h1 className={styles.title}>Administración</h1>
      <div className={styles.tabs} role="tablist">
        {([['reports', 'Reportes'], ['users', 'Usuarios'], ['words', 'Palabras prohibidas']] as const).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? styles.tabOn : styles.tab} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'reports' && <Reports />}
      {tab === 'users' && <Users />}
      {tab === 'words' && <Words />}
    </section>
  );
}

function Reports() {
  const [list, setList] = useState<Report[] | null>(null);
  const [previews, setPreviews] = useState<Record<string, { text: string; link?: string; userId?: string; hidden?: boolean }>>({});

  const load = async () => {
    const { data } = await supabase
      .from('reports')
      .select('id, target_type, target_id, reason, created_at, reporter:profiles!reports_reporter_id_fkey(username)')
      .eq('resolved', false)
      .order('created_at', { ascending: false });
    const rows = (data ?? []) as unknown as Report[];
    setList(rows);
    const ids = (t: Report['target_type']) => rows.filter((r) => r.target_type === t).map((r) => r.target_id);
    const p: typeof previews = {};
    const [b, c, u] = await Promise.all([
      ids('build').length ? supabase.from('builds').select('id, title, user_id, hidden').in('id', ids('build')) : { data: [] },
      ids('comment').length ? supabase.from('build_comments').select('id, body, user_id, build_id, hidden').in('id', ids('comment')) : { data: [] },
      ids('user').length ? supabase.from('profiles').select('id, username').in('id', ids('user')) : { data: [] },
    ]);
    for (const x of (b.data ?? []) as { id: string; title: string; user_id: string; hidden: boolean }[])
      p[x.id] = { text: `Build: «${x.title}»`, link: `/p5r/builds/${x.id}`, userId: x.user_id, hidden: x.hidden };
    for (const x of (c.data ?? []) as { id: string; body: string; user_id: string; build_id: string; hidden: boolean }[])
      p[x.id] = { text: `Comentario: «${x.body}»`, link: `/p5r/builds/${x.build_id}`, userId: x.user_id, hidden: x.hidden };
    for (const x of (u.data ?? []) as { id: string; username: string | null }[])
      p[x.id] = { text: `Usuario: ${x.username ?? 'sin nombre'}`, userId: x.id };
    setPreviews(p);
  };
  useEffect(() => {
    load();
  }, []);

  const resolve = async (id: string) => {
    await supabase.from('reports').update({ resolved: true }).eq('id', id);
    load();
  };
  const hide = async (r: Report) => {
    const table = r.target_type === 'build' ? 'builds' : 'build_comments';
    await supabase.from(table).update({ hidden: true }).eq('id', r.target_id);
    await resolve(r.id);
  };
  const remove = async (r: Report) => {
    if (!window.confirm('¿Borrar definitivamente? No se puede deshacer.')) return;
    const table = r.target_type === 'build' ? 'builds' : 'build_comments';
    await supabase.from(table).delete().eq('id', r.target_id);
    await resolve(r.id);
  };
  const ban = async (r: Report, userId: string) => {
    if (!window.confirm('¿Banear a este usuario? Su contenido deja de verse y no puede publicar más.')) return;
    await supabase.from('profiles').update({ banned: true }).eq('id', userId);
    await resolve(r.id);
  };

  if (list === null) return <p className="pending">Cargando…</p>;
  if (!list.length) return <p className="pending">No hay reportes pendientes.</p>;
  return (
    <ul className={styles.list}>
      {list.map((r) => {
        const pv = previews[r.target_id];
        return (
          <li key={r.id} className={styles.item}>
            <p className={styles.meta}>
              {formatDate(r.created_at)} · reportado por {r.reporter?.username ?? 'anónimo'} · <strong>{r.reason ?? 'Sin motivo'}</strong>
            </p>
            <p className={styles.text}>
              {pv ? pv.text : 'Ya no existe (fue borrado).'} {pv?.hidden && <em>(oculto)</em>}
            </p>
            <div className={styles.actions}>
              {pv?.link && <Link to={pv.link}>Ver</Link>}
              {pv && r.target_type !== 'user' && <button type="button" onClick={() => hide(r)}>Ocultar</button>}
              {pv && r.target_type !== 'user' && <button type="button" onClick={() => remove(r)}>Borrar</button>}
              {pv?.userId && <button type="button" onClick={() => ban(r, pv.userId!)}>Banear usuario</button>}
              <button type="button" onClick={() => resolve(r.id)}>Descartar reporte</button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Users() {
  const [q, setQ] = useState('');
  const [onlyBanned, setOnlyBanned] = useState(false);
  const [list, setList] = useState<UserRow[] | null>(null);
  const load = async () => {
    let query = supabase.from('profiles').select('id, username, banned, is_admin, created_at').order('created_at', { ascending: false }).limit(100);
    if (q.trim()) query = query.ilike('username', `%${q.trim()}%`);
    if (onlyBanned) query = query.eq('banned', true);
    const { data } = await query;
    setList((data ?? []) as UserRow[]);
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyBanned]);
  const toggleBan = async (u: UserRow) => {
    await supabase.from('profiles').update({ banned: !u.banned }).eq('id', u.id);
    load();
  };
  return (
    <>
      <form className={styles.row} onSubmit={(e) => { e.preventDefault(); load(); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nombre de usuario" />
        <button type="submit">Buscar</button>
        <label className={styles.check}>
          <input type="checkbox" checked={onlyBanned} onChange={(e) => setOnlyBanned(e.target.checked)} /> Solo baneados
        </label>
      </form>
      {list === null ? (
        <p className="pending">Cargando…</p>
      ) : (
        <ul className={styles.list}>
          {list.map((u) => (
            <li key={u.id} className={styles.item}>
              <p className={styles.text}>
                <strong>{u.username ?? 'sin nombre'}</strong> {u.is_admin && '· admin'} {u.banned && <em className={styles.banned}>· baneado</em>}
              </p>
              <p className={styles.meta}>Desde {formatDate(u.created_at)}</p>
              {!u.is_admin && (
                <div className={styles.actions}>
                  <button type="button" onClick={() => toggleBan(u)}>{u.banned ? 'Quitar ban' : 'Banear'}</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function Words() {
  const [list, setList] = useState<string[]>([]);
  const [word, setWord] = useState('');
  const load = async () => {
    const { data } = await supabase.from('banned_words').select('word').order('word');
    setList((data ?? []).map((r) => r.word as string));
  };
  useEffect(() => {
    load();
  }, []);
  const add = async () => {
    const w = word.trim().toLowerCase();
    if (!w) return;
    await supabase.from('banned_words').insert({ word: w });
    setWord('');
    load();
  };
  const remove = async (w: string) => {
    await supabase.from('banned_words').delete().eq('word', w);
    load();
  };
  return (
    <>
      <p className={styles.meta}>Si un comentario, una build o un nombre de usuario tiene alguna de estas palabras, no se guarda.</p>
      <form className={styles.row} onSubmit={(e) => { e.preventDefault(); add(); }}>
        <input value={word} onChange={(e) => setWord(e.target.value)} placeholder="Nueva palabra" />
        <button type="submit">Agregar</button>
      </form>
      <div className={styles.words}>
        {list.map((w) => (
          <button key={w} type="button" onClick={() => remove(w)} title="Quitar">
            {w} ×
          </button>
        ))}
      </div>
    </>
  );
}
