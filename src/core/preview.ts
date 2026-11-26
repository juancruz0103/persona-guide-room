/**
 * Vista previa de secciones que todavía no se publican (por ahora, Persona 4 Revival).
 *
 * La sección está en el código pero no aparece en la web publicada: solo se ve
 * - mientras se desarrolla (npm run dev), o
 * - en un navegador donde se activó a mano, abriendo la web con `?preview=p4r`
 *   (se recuerda en ese navegador; `?preview=off` lo apaga).
 *
 * El día del lanzamiento: borrar este archivo y sacar la condición en src/core/games.ts.
 */
const KEY = 'pgr.preview';

function readFlag(): boolean {
  try {
    const q = new URLSearchParams(window.location.search).get('preview');
    if (q === 'p4r') localStorage.setItem(KEY, 'p4r');
    if (q === 'off') localStorage.removeItem(KEY);
    return localStorage.getItem(KEY) === 'p4r';
  } catch {
    return false;
  }
}

export const PREVIEW_P4R: boolean = import.meta.env.DEV || (typeof window !== 'undefined' && readFlag());
