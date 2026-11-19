import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import type { GameInfo } from '../../core/types';
import { t } from '../../i18n/es';
import { L } from '../../i18n';
import { GameMenu } from './GameMenu';
import { LanguageButton } from './LanguageButton';
import { AccountButton } from './AccountButton';
import styles from './Header.module.css';

interface Props {
  game: GameInfo;
}

const MENU_ID = 'menu-juegos';

export function Header({ game }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const location = useLocation();

  // Cerrar el menú al navegar, con Escape o al hacer clic afuera.
  useEffect(() => setOpen(false), [location.pathname]);
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

  const base = `/${game.id}`;
  const links = [
    { to: base, label: t().nav.home, end: true },
    { to: `${base}/calculadora`, label: t().nav.calculator, end: false },
    { to: `${base}/confidentes`, label: t().nav.confidants, end: false },
    { to: `${base}/vinculos`, label: L('Vínculos', 'Social Links'), end: false },
    { to: `${base}/clases`, label: t().nav.school, end: false },
    { to: `${base}/ladrones`, label: L('Ladrones Fantasma', 'Phantom Thieves'), end: false },
    { to: `${base}/builds`, label: 'Builds', end: false },
  ].filter((l) => {
    if (l.end) return true;
    // P4G y los juegos nuevos muestran solo las secciones que ya tienen.
    if (game.id !== 'p5r' && game.id !== 'p3r') return game.tools.some((t) => l.to.endsWith(`/${t.path}`));
    return l.to.endsWith('/vinculos') ? game.id === 'p3r' : game.id === 'p5r' || l.to.endsWith('/calculadora') || l.to.endsWith('/clases') || l.to.endsWith('/builds');
  });

  return (
    <header ref={ref} className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <div className={styles.brand}>
          <button
            type="button"
            className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
            aria-label={t().nav.openGameMenu}
            aria-expanded={open}
            aria-controls={MENU_ID}
            onClick={() => setOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
          <Link to={base} className={styles.logo}>
            <span className={styles.logoMark}>PGR</span>
            <span className={styles.logoText}>Persona Guide Room</span>
          </Link>
        </div>

        <nav aria-label={t().nav.mainMenu} className={styles.nav}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `${styles.link} ${l.end ? styles.homeLink : ''} ${isActive ? styles.active : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.tools}>
          <AccountButton />
          <LanguageButton />
          <span className={styles.gameBadge}>{game.shortName}</span>
        </div>
      </div>

      {open && <GameMenu id={MENU_ID} current={game.id} onClose={() => setOpen(false)} />}
    </header>
  );
}
