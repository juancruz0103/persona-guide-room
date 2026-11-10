import { useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const KEY = (k: string) => `pgr.scroll.${k}`;

function read(key: string): number {
  try {
    return Number(sessionStorage.getItem(KEY(key))) || 0;
  } catch {
    return 0;
  }
}

/**
 * Al cambiar de página vuelve arriba de todo. Si se vuelve atrás (o adelante)
 * con el navegador o con el botón «Volver», deja la página donde estaba.
 */
export function ScrollToTop() {
  const location = useLocation();
  const navType = useNavigationType();

  // Guarda la posición de esta página mientras se recorre
  useLayoutEffect(() => {
    const save = () => {
      try {
        sessionStorage.setItem(KEY(location.key), String(Math.round(window.scrollY)));
      } catch {
        /* sin almacenamiento: no pasa nada */
      }
    };
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, [location.key]);

  useEffect(() => {
    if (navType !== 'POP') {
      window.scrollTo(0, 0);
      return;
    }
    // La página puede tardar en armarse: se reintenta hasta que haya lugar para bajar
    const y = read(location.key);
    let tries = 0;
    const id = window.setInterval(() => {
      tries++;
      const room = document.documentElement.scrollHeight - window.innerHeight;
      if (room >= y || tries > 40) {
        window.scrollTo(0, y);
        window.clearInterval(id);
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [location.key, navType]);

  return null;
}
