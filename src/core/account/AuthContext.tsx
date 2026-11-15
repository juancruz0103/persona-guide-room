import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, takeDestination } from './supabase';

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
    const { data } = await supabase.from('profiles').select('id, username, is_admin, banned').eq('id', u.id).maybeSingle();
    setProfile((data as Profile | null) ?? null);
  }, []);

  useEffect(() => {
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
    return () => sub.subscription.unsubscribe();
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
