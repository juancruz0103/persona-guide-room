import { supabase } from './supabase';

/** Una parte de la fusión: la Persona y las habilidades que pasa al resultado. */
export interface BuildPart {
  persona: string;
  skills: string[];
}
/** Un paso: A + B = resultado (que hereda las habilidades marcadas de A y B). */
export interface BuildStep {
  a: BuildPart;
  b: BuildPart;
  result: string;
  note?: string;
}

export interface Build {
  id: string;
  user_id: string;
  persona_id: string;
  title: string;
  description: string | null;
  steps: BuildStep[];
  skill_cards: string[];
  hidden: boolean;
  created_at: string;
  updated_at: string;
  author?: { username: string | null } | null;
  likes?: number;
  comments?: number;
}

export interface BuildComment {
  id: string;
  build_id: string;
  user_id: string;
  body: string;
  hidden: boolean;
  created_at: string;
  author?: { username: string | null } | null;
}

export const MAX_STEPS = 10;
export const MAX_SKILLS = 8;

/** Habilidades que tiene el resultado de un paso. */
export const inherited = (s: BuildStep): string[] => [...new Set([...s.a.skills, ...s.b.skills])];

const SELECT =
  'id, user_id, persona_id, title, description, steps, skill_cards, hidden, created_at, updated_at, author:profiles!builds_user_id_fkey(username), build_likes(count), build_comments(count)';

type Row = Omit<Build, 'likes' | 'comments'> & {
  build_likes: { count: number }[];
  build_comments: { count: number }[];
};
const toBuild = (r: Row): Build => ({
  ...r,
  likes: r.build_likes?.[0]?.count ?? 0,
  comments: r.build_comments?.[0]?.count ?? 0,
});

export async function listBuilds(opts: { personaId?: string; userId?: string } = {}): Promise<Build[]> {
  let q = supabase.from('builds').select(SELECT).order('created_at', { ascending: false }).limit(100);
  if (opts.personaId) q = q.eq('persona_id', opts.personaId);
  if (opts.userId) q = q.eq('user_id', opts.userId);
  const { data } = await q;
  return ((data ?? []) as unknown as Row[]).map(toBuild);
}

export async function getBuild(id: string): Promise<Build | null> {
  const { data } = await supabase.from('builds').select(SELECT).eq('id', id).maybeSingle();
  return data ? toBuild(data as unknown as Row) : null;
}

export async function saveBuild(
  userId: string,
  b: Pick<Build, 'title' | 'description' | 'steps' | 'skill_cards'> & { id?: string },
): Promise<{ id?: string; error?: string }> {
  const last = b.steps[b.steps.length - 1];
  const row = {
    user_id: userId,
    title: b.title,
    description: b.description,
    steps: b.steps,
    skill_cards: b.skill_cards,
    persona_id: last?.result ?? '',
  };
  const res = b.id
    ? await supabase.from('builds').update(row).eq('id', b.id).select('id').single()
    : await supabase.from('builds').insert(row).select('id').single();
  if (res.error) return { error: res.error.message };
  return { id: (res.data as { id: string }).id };
}

export async function deleteBuild(id: string) {
  return supabase.from('builds').delete().eq('id', id);
}

export async function listComments(buildId: string): Promise<BuildComment[]> {
  const { data } = await supabase
    .from('build_comments')
    .select('id, build_id, user_id, body, hidden, created_at, author:profiles!build_comments_user_id_fkey(username)')
    .eq('build_id', buildId)
    .order('created_at', { ascending: true });
  return (data ?? []) as unknown as BuildComment[];
}

export async function addComment(userId: string, buildId: string, body: string) {
  return supabase.from('build_comments').insert({ user_id: userId, build_id: buildId, body });
}

export async function hasLiked(userId: string, buildId: string): Promise<boolean> {
  const { data } = await supabase.from('build_likes').select('build_id').eq('user_id', userId).eq('build_id', buildId).maybeSingle();
  return !!data;
}
export async function setLike(userId: string, buildId: string, on: boolean) {
  return on
    ? supabase.from('build_likes').insert({ user_id: userId, build_id: buildId })
    : supabase.from('build_likes').delete().eq('user_id', userId).eq('build_id', buildId);
}

export async function report(userId: string, targetType: 'build' | 'comment' | 'user', targetId: string, reason: string) {
  const res = await supabase.from('reports').insert({ reporter_id: userId, target_type: targetType, target_id: targetId, reason });
  if (res.error?.message.includes('duplicate')) return { error: null };
  return res;
}

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
