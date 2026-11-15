import { createClient } from '@supabase/supabase-js';

// Clave pública (publishable): está pensada para ir en la web. La seguridad la dan las reglas (RLS) de la base.
const URL = 'https://shokulyavsrpjrjtpiyf.supabase.co';
const KEY = 'sb_publishable_qgurhJfrrAGXQwDF1plm7g_FkRV9CYZ';

export const supabase = createClient(URL, KEY, {
  auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
});

/** Adónde vuelve Google o el mail de confirmación: la raíz del sitio (el destino real se guarda aparte). */
export const authRedirect = () => `${window.location.origin}${import.meta.env.BASE_URL}`;

const AFTER = 'pgr.afterLogin';
export const rememberDestination = (hash: string) => {
  try {
    sessionStorage.setItem(AFTER, hash);
  } catch {
    /* sin almacenamiento */
  }
};
export const takeDestination = (): string | null => {
  try {
    const v = sessionStorage.getItem(AFTER);
    sessionStorage.removeItem(AFTER);
    return v;
  } catch {
    return null;
  }
};

/** Pasa los errores de Supabase a mensajes en castellano. */
export function authErrorText(msg: string | undefined): string {
  const m = (msg ?? '').toLowerCase();
  if (m.includes('bad_words')) return 'Ese texto tiene palabras que no están permitidas.';
  if (m.includes('invalid login')) return 'El email o la contraseña no son correctos.';
  if (m.includes('email not confirmed')) return 'Todavía no confirmaste tu email. Revisá tu correo.';
  if (m.includes('already registered')) return 'Ya existe una cuenta con ese email.';
  if (m.includes('password should be')) return 'La contraseña tiene que tener al menos 6 caracteres.';
  if (m.includes('rate limit')) return 'Demasiados intentos. Esperá unos minutos y probá de nuevo.';
  if (m.includes('duplicate key') && m.includes('username')) return 'Ese nombre de usuario ya está en uso.';
  if (m.includes('username_check')) return 'El nombre tiene que tener entre 3 y 24 caracteres.';
  return 'Algo salió mal. Probá de nuevo en un rato.';
}
