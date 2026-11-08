import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Vuelve arriba de todo al cambiar de página. */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
