import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';

/**
 * Supabase pesa más que el resto de la portada junto, así que no va en la carga inicial.
 * Se trae solo si hay una sesión guardada, si se vuelve del login, o cuando alguna página lo usa
 * (supabase.ts avisa con el evento `pgr:supabase`). Sin cuenta, la mayoría de las visitas nunca lo baja.
 */
const sb = () => import('./supabase');
const needsAuthNow = () => {
  try {
    if (/[?&#](code|error_description|access_token)=/.test(window.location.href)) return true;
    for (let i = 0; i < localStorage.length; i++) if (localStorage.key(i)?.startsWith('sb-')) return true;
  } catch {
    return true;
  }
  return false;
};

export interface Profile {
  id: string;
  username: string | null;
  is_admin: boolean;
  banned: boolean;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  /** true cuando el usuario entró desde el mail de «olvidé mi contraseña» */
  recovering: boolean;
  doneRecovering: () => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recovering, setRecovering] = useState(false);

  const loadProfile = useCallback(async (u: User | null) => {
    if (!u) return setProfile(null);
    const { supabase } = await sb();
    const { data } = await supabase.from('profiles').select('id, username, is_admin, banned').eq('id', u.id).maybeSingle();
    setProfile((data as Profile | null) ?? null);
  }, []);

  useEffect(() => {
    let alive = true;
    let unsubscribe = () => {};
    const start = async () => {
      window.removeEventListener('pgr:supabase', start);
      const { supabase, takeDestination } = await sb();
      if (!alive) return;
      supabase.auth.getSession().then(({ data }) => {
        const u = data.session?.user ?? null;
        setUser(u);
        loadProfile(u).finally(() => setLoading(false));
      });
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (event === 'PASSWORD_RECOVERY') {
        setRecovering(true);
        window.location.hash = '#/p5r/perfil';
      }
      if (event === 'SIGNED_IN' && u) {
        const dest = takeDestination();
        if (dest) window.location.hash = dest;
        setTimeout(() => void import('./progress').then((m) => m.uploadLocalProgress(u.id)), 0);
      }
      // Fuera del callback: Supabase no permite otra consulta dentro de él.
      setTimeout(() => loadProfile(u), 0);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    };
    if (needsAuthNow()) void start();
    else {
      setLoading(false);
      window.addEventListener('pgr:supabase', start);
    }
    return () => {
      alive = false;
      window.removeEventListener('pgr:supabase', start);
      unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      profile,
      loading,
      recovering,
      doneRecovering: () => setRecovering(false),
      refreshProfile: () => loadProfile(user),
      signOut: async () => {
        const { supabase } = await sb();
        await supabase.auth.signOut();
      },
    }),
    [user, profile, loading, recovering, loadProfile],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth fuera de AuthProvider');
  return v;
}
