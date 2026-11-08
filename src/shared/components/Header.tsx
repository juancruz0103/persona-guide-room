import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import type { GameInfo } from '../../core/types';
import { es } from '../../i18n/es';
import { GameMenu } from './GameMenu';
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
    { to: base, label: es.nav.home, end: true },
    { to: `${base}/calculadora`, label: es.nav.calculator, end: false },
    { to: `${base}/confidentes`, label: es.nav.confidants, end: false },
  ];

  return (
    <header ref={ref} className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <div className={styles.brand}>
          <button
            type="button"
            className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
            aria-label={es.nav.openGameMenu}
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

        <nav aria-label={es.nav.mainMenu} className={styles.nav}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <span className={styles.gameBadge}>{game.shortName}</span>
      </div>

      {open && <GameMenu id={MENU_ID} current={game.id} onClose={() => setOpen(false)} />}
    </header>
  );
}
