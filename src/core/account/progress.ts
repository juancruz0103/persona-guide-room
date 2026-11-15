import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

/**
 * Progreso de un confidente.
 * Siempre se guarda en el navegador; si hay sesión, además en la cuenta (y la cuenta manda).
 */
export interface Progress {
  tracking: boolean;
  reached: number;
}
const EMPTY: Progress = { tracking: false, reached: 0 };
const key = (id: string) => `pgr.progress.${id}`;

export function loadLocal(id: string): Progress {
  try {
    const raw = localStorage.getItem(key(id));
    if (raw) return JSON.parse(raw) as Progress;
  } catch {
    /* sin almacenamiento */
  }
  return EMPTY;
}
function saveLocal(id: string, p: Progress) {
  try {
    localStorage.setItem(key(id), JSON.stringify(p));
  } catch {
    /* sin almacenamiento */
  }
}

async function saveRemote(userId: string, id: string, p: Progress) {
  if (p.tracking) {
    await supabase
      .from('confidant_progress')
      .upsert({ user_id: userId, confidant_id: id, rank: p.reached, updated_at: new Date().toISOString() });
  } else {
    await supabase.from('confidant_progress').delete().eq('user_id', userId).eq('confidant_id', id);
  }
}

/** Todos los confidentes que el usuario sigue, ordenados del más avanzado al menos. */
export async function fetchAllProgress(userId: string): Promise<{ confidant_id: string; rank: number }[]> {
  const { data } = await supabase
    .from('confidant_progress')
    .select('confidant_id, rank')
    .eq('user_id', userId)
    .order('rank', { ascending: false });
  return data ?? [];
}

/** Al entrar por primera vez, sube lo que ya estaba guardado en este navegador. */
export async function uploadLocalProgress(userId: string) {
  const remote = new Set((await fetchAllProgress(userId)).map((r) => r.confidant_id));
  const rows: { user_id: string; confidant_id: string; rank: number }[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k?.startsWith('pgr.progress.')) continue;
      const id = k.slice('pgr.progress.'.length);
      const p = loadLocal(id);
      if (p.tracking && !remote.has(id)) rows.push({ user_id: userId, confidant_id: id, rank: p.reached });
    }
  } catch {
    return;
  }
  if (rows.length) await supabase.from('confidant_progress').upsert(rows);
}

export function useConfidantProgress(id: string): [Progress, (p: Progress) => void] {
  const { user } = useAuth();
  const [p, setP] = useState<Progress>(() => loadLocal(id));

  useEffect(() => {
    setP(loadLocal(id));
    if (!user) return;
    let alive = true;
    supabase
      .from('confidant_progress')
      .select('rank')
      .eq('user_id', user.id)
      .eq('confidant_id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (!alive) return;
        const remote: Progress = data ? { tracking: true, reached: data.rank } : EMPTY;
        setP(remote);
        saveLocal(id, remote);
      });
    return () => {
      alive = false;
    };
  }, [id, user]);

  const save = useCallback(
    (next: Progress) => {
      setP(next);
      saveLocal(id, next);
      if (user) void saveRemote(user.id, id, next);
    },
    [id, user],
  );

  return [p, save];
}

/**
 * Rango alcanzado de varios confidentes a la vez (para las listas).
 * Lee el navegador y, si hay sesión, la cuenta manda.
 */
export function useAllProgress(ids: string[]): Record<string, number> {
  const { user } = useAuth();
  const read = () => Object.fromEntries(ids.map((id) => { const p = loadLocal(id); return [id, p.tracking ? p.reached : 0]; }));
  const [map, setMap] = useState<Record<string, number>>(read);
  const sig = ids.join(',');
  useEffect(() => {
    setMap(read());
    if (!user) return;
    let alive = true;
    fetchAllProgress(user.id).then((rows) => {
      if (!alive) return;
      const remote = Object.fromEntries(rows.map((r) => [r.confidant_id, r.rank]));
      setMap(Object.fromEntries(ids.map((id) => [id, remote[id] ?? 0])));
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig, user]);
  return map;
}
