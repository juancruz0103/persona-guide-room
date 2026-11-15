import { createClient } from '@supabase/supabase-js';
import { L } from '../../i18n';

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
  if (m.includes('rate_limit:comments')) return L('Estás comentando muy rápido. Esperá un minuto y probá de nuevo.', 'You are commenting too fast. Wait a minute and try again.');
  if (m.includes('rate_limit:builds')) return L('Ya publicaste varias builds seguidas. Esperá un rato antes de publicar otra.', 'You have published several builds in a row. Wait a while before publishing another.');
  if (m.includes('rate_limit:reports')) return L('Enviaste muchos reportes en poco tiempo. Probá de nuevo en una hora.', 'You sent many reports in a short time. Try again in an hour.');
  if (m.includes('bad_words')) return L('Ese texto tiene palabras que no están permitidas.', 'That text contains words that are not allowed.');
  if (m.includes('invalid login')) return L('El email o la contraseña no son correctos.', 'The email or password is not correct.');
  if (m.includes('email not confirmed')) return L('Todavía no confirmaste tu email. Revisá tu correo.', 'You have not confirmed your email yet. Check your inbox.');
  if (m.includes('already registered')) return L('Ya existe una cuenta con ese email.', 'An account with that email already exists.');
  if (m.includes('password should be')) return L('La contraseña tiene que tener al menos 6 caracteres.', 'The password must have at least 6 characters.');
  if (m.includes('rate limit')) return L('Demasiados intentos. Esperá unos minutos y probá de nuevo.', 'Too many attempts. Wait a few minutes and try again.');
  if (m.includes('duplicate key') && m.includes('username')) return L('Ese nombre de usuario ya está en uso.', 'That username is already taken.');
  if (m.includes('username_check')) return L('El nombre tiene que tener entre 3 y 24 caracteres.', 'The name must have 3 to 24 characters.');
  return L('Algo salió mal. Probá de nuevo en un rato.', 'Something went wrong. Try again in a while.');
}
