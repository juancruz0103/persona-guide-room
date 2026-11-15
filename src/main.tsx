import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './shared/styles/global.css';

// Si se publicó una versión nueva mientras la página estaba abierta, los archivos viejos ya no existen: recargar una vez.
window.addEventListener('vite:preloadError', () => {
  const key = 'pgr.reloaded';
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');
  window.location.reload();
});
window.addEventListener('load', () => setTimeout(() => sessionStorage.removeItem('pgr.reloaded'), 5000));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
