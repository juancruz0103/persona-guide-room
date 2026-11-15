import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../core/account/AuthContext';
import { authErrorText, authRedirect, rememberDestination, supabase } from '../core/account/supabase';
import styles from './Account.module.css';
import { L } from '../i18n';

type Mode = 'login' | 'signup' | 'forgot';

/** Entrar, crear cuenta u olvidé mi contraseña. */
export default function Account() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/p5r/perfil';
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to={from} replace />;

  const google = async () => {
    setError('');
    rememberDestination(`#${from}`);
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: authRedirect() },
    });
    if (e) setError(authErrorText(e.message));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (!email.includes('@')) return setError(L('Escribí un email válido.', 'Enter a valid email.'));
    if (mode !== 'forgot' && password.length < 6) return setError(L('La contraseña tiene que tener al menos 6 caracteres.', 'The password must have at least 6 characters.'));
    setBusy(true);
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) setError(authErrorText(err.message));
      } else if (mode === 'signup') {
        rememberDestination(`#${from}`);
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: authRedirect() },
        });
        if (err) setError(authErrorText(err.message));
        else setInfo(L('Te mandamos un mail para confirmar la cuenta. Abrí el enlace y listo.', 'We sent you an email to confirm your account. Open the link and you are done.'));
      } else {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: authRedirect() });
        if (err) setError(authErrorText(err.message));
        else setInfo(L('Si existe una cuenta con ese email, te llega un enlace para cambiar la contraseña.', 'If an account with that email exists, you will get a link to change the password.'));
      }
    } finally {
      setBusy(false);
    }
  };

  const title = mode === 'login' ? L('Iniciar sesión', 'Log in') : mode === 'signup' ? L('Crear cuenta', 'Create account') : L('Olvidé mi contraseña', 'Forgot my password');
  const go = (m: Mode) => {
    setMode(m);
    setError('');
    setInfo('');
  };

  return (
    <section className={`container ${styles.wrap}`}>
      <div className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.lead}>{L('Con tu cuenta guardás el progreso de tus confidentes y tus Personas favoritas.', 'With your account you save your confidant progress and your favorite Personas.')}</p>

        {mode !== 'forgot' && (
          <>
            <button type="button" className={`btn btn--light ${styles.full}`} onClick={google}>
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
              </svg>
              {L('Entrar con Google', 'Log in with Google')}
            </button>
            <p className={styles.or}>{L('o con tu email', 'or with your email')}</p>
          </>
        )}

        <form onSubmit={submit} className={styles.form} noValidate>
          <label className={styles.field}>
            <span className="label">Email</span>
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={L('tu@email.com', 'you@email.com')} />
          </label>
          {mode !== 'forgot' && (
            <label className={styles.field}>
              <span className="label">{L('Contraseña', 'Password')}</span>
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          )}
          {error && <p className={styles.error} role="alert">{error}</p>}
          {info && <p className={styles.info} role="status">{info}</p>}
          <button type="submit" className={`btn ${styles.full} ${styles.primary}`} disabled={busy}>
            {mode === 'login' ? L('Entrar', 'Log in') : mode === 'signup' ? L('Crear cuenta', 'Create account') : L('Mandar enlace', 'Send link')}
          </button>
        </form>

        <div className={styles.links}>
          {mode === 'login' && (
            <>
              <button type="button" onClick={() => go('signup')}>{L('¿No tenés cuenta? Crear cuenta', 'No account? Create one')}</button>
              <button type="button" onClick={() => go('forgot')}>{L('Olvidé mi contraseña', 'Forgot my password')}</button>
            </>
          )}
          {mode !== 'login' && <button type="button" onClick={() => go('login')}>{L('← Volver a iniciar sesión', '← Back to log in')}</button>}
        </div>
      </div>
    </section>
  );
}
