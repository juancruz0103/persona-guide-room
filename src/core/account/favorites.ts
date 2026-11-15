import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

/** Personas favoritas del usuario (requiere sesión). */
export function useFavorites() {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIds([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    supabase
      .from('favorite_personas')
      .select('persona_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!alive) return;
        setIds((data ?? []).map((r) => r.persona_id as string));
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  const toggle = useCallback(
    async (personaId: string) => {
      if (!user) return;
      if (ids.includes(personaId)) {
        setIds((v) => v.filter((x) => x !== personaId));
        await supabase.from('favorite_personas').delete().eq('user_id', user.id).eq('persona_id', personaId);
      } else {
        setIds((v) => [personaId, ...v]);
        await supabase.from('favorite_personas').insert({ user_id: user.id, persona_id: personaId });
      }
    },
    [user, ids],
  );

  return { ids, loading, toggle, isFavorite: (id: string) => ids.includes(id) };
}
