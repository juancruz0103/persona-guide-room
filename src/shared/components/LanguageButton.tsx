import { useEffect, useRef, useState } from 'react';
import styles from './LanguageButton.module.css';
import { L, setLang, useLang, type Lang } from '../../i18n';

const LANGS: { id: Lang; label: string }[] = [
  { id: 'es', label: 'Español' },
  { id: 'en', label: 'English' },
];

/**
 * Selector de idioma. Por ahora la web está solo en español:
 * el inglés aparece como "próximamente" hasta que se cargue la traducción.
 */
export function LanguageButton() {
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  return (
    <div ref={ref} className={styles.wrap}>
      <button
        type="button"
        className={styles.button}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={L('Idioma: Español. Cambiar idioma', 'Language: English. Change language')}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" />
          <path d="M2.5 12h19" />
          <path d="M12 2.5c2.6 2.7 3.9 5.9 3.9 9.5s-1.3 6.8-3.9 9.5c-2.6-2.7-3.9-5.9-3.9-9.5s1.3-6.8 3.9-9.5z" />
        </svg>
        {lang.toUpperCase()}
      </button>
      {open && (
        <ul className={styles.menu}>
          {LANGS.map((l) => (
            <li key={l.id}>
              <button type="button" className={styles.option} aria-current={l.id === lang} onClick={() => { setOpen(false); setLang(l.id); }}>
                {l.label}
                {l.id === lang && <span className={styles.state}>{L('Actual', 'Current')}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
