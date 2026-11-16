import type { ReactElement } from 'react';
import type { SkillElement } from '../types';
import { elementName } from '../data/elements';
import { L } from '../../../i18n';

/**
 * Íconos de elementos de Persona 4 Golden — diseño propio inspirado en el juego (disco negro con el símbolo de color).
 * No son los íconos oficiales.
 */
const GLYPHS: Record<SkillElement, ReactElement> = {
  phy: <><g fill="#E9D6A0"><rect x="8" y="10" width="4.6" height="8" rx="2"/><rect x="13" y="8.5" width="4.6" height="9.5" rx="2"/><rect x="18" y="9.5" width="4.6" height="8.5" rx="2"/><path d="M8 17h15v3a5 5 0 0 1-5 5h-5a5 5 0 0 1-5-5z"/></g></>,
  fir: <><path d="M16 5c1 5 7 7 7 13a7 7 0 0 1-14 0c0-3.5 2-5 3-8 1.2 1.4 2 2.8 2 4.6C15.5 12 16.6 9 16 5z" fill="#F04A3A"/><path d="M16 15c.5 2.4 3 3.4 3 5.8a3 3 0 0 1-6 0c0-1.6 1-2.4 1.6-3.6.6.6.9 1.2.9 2 .5-1.2.7-2.6.5-4.2z" fill="#FFB25A"/></>,
  ice: <><g fill="#38C6F4"><path d="M16 4l2.6 10H13.4z"/><path d="M7 11l8 5.4-3.6 3.8z"/><path d="M25 11l-8 5.4 3.6 3.8z"/><path d="M11 26l3.5-8.6h3L21 26l-5-2.6z"/></g></>,
  ele: <><path d="M18.5 4 8 18h6.5L12 28l12-15h-7z" fill="#E4F03A"/></>,
  win: <><g fill="none" stroke="#5EE68A" strokeWidth="2.6" strokeLinecap="round"><path d="M6 12h13a3.4 3.4 0 1 0-3.4-3.4"/><path d="M6 17h17a3.4 3.4 0 1 1-3.4 3.4"/><path d="M6 22h8"/></g></>,
  lig: <><g fill="#FFFFFF"><path d="M16 4l2.4 9.6L28 16l-9.6 2.4L16 28l-2.4-9.6L4 16l9.6-2.4z"/></g><circle cx="16" cy="16" r="2.4" fill="#9BE3FF"/></>,
  dar: <><g><path d="M4 16c4-6 8-8.5 12-8.5S24 10 28 16c-4 6-8 8.5-12 8.5S8 22 4 16z" fill="#A24BEA"/><circle cx="16" cy="16" r="5" fill="#111"/><circle cx="16" cy="16" r="2.6" fill="#E9B8FF"/></g></>,
  alm: <><g><circle cx="16" cy="16" r="9" fill="none" stroke="#F3D9FF" strokeWidth="2"/><path d="M16 5l1.8 8.2L26 15l-8.2 1.8L16 27l-1.8-10.2L6 15l8.2-1.8z" fill="#FFFFFF"/></g></>,
  ail: <><path d="M16 5c3 5 7 8.5 7 13a7 7 0 0 1-14 0c0-4.5 4-8 7-13z" fill="#C25BE0"/><circle cx="13.5" cy="18" r="1.6" fill="#111"/><circle cx="18.5" cy="18" r="1.6" fill="#111"/></>,
  rec: <><path d="M13 6h6v7h7v6h-7v7h-6v-7H6v-6h7z" fill="#4BE07A"/></>,
  sup: <><g fill="#3D9BFF"><path d="M16 5l8 9h-5v4h-6v-4H8z"/><rect x="10" y="21" width="12" height="3" rx="1"/></g></>,
  pas: <><g fill="none" stroke="#D6B65C" strokeWidth="2.6"><circle cx="16" cy="16" r="8"/><circle cx="16" cy="16" r="3" fill="#D6B65C"/></g></>,
};

/** Estrella: habilidades especiales de los compañeros. */
const STAR = <path d="M16 4.5l3.4 7.1 7.8 1-5.7 5.4 1.4 7.7L16 22l-6.9 3.7 1.4-7.7-5.7-5.4 7.8-1z" fill="#3D9BFF" />;

export function ElementIcon({ el, size = 28, title = true, special = false }: { el: SkillElement; size?: number; title?: boolean; special?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} style={{ flex: 'none' }}>
      {title && <title>{special ? L('Pasiva especial', 'Special passive') : elementName(el)}</title>}
      <circle cx="16" cy="16" r="15.5" fill="#0b0f18" />
      {special ? STAR : GLYPHS[el]}
    </svg>
  );
}
