import type { ReactElement } from 'react';

/**
 * Íconos de elementos — diseño propio (no son los íconos oficiales del juego).
 * Mantienen el código de colores del juego para que se reconozcan.
 */
export type IconKey =
  | 'phy' | 'gun' | 'fir' | 'ice' | 'ele' | 'win' | 'psy' | 'nuk' | 'ble' | 'cur'
  | 'alm' | 'ail' | 'rec' | 'sup' | 'pas' | 'any';

const PATHS: Record<IconKey, ReactElement> = {
  phy: (
    <g fill="none" stroke="#F28C28" strokeWidth="2.6" strokeLinecap="round">
      <path d="M4 13L10 3" /><path d="M6 20L17 4" /><path d="M12 21L20 9" />
    </g>
  ),
  gun: (
    <g fill="none" stroke="#F2B134" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="7" />
      <path d="M12 1v6M12 17v6M1 12h6M17 12h6" />
      <circle cx="12" cy="12" r="1.6" fill="#F2B134" />
    </g>
  ),
  fir: (
    <g>
      <path fill="#EE4130" d="M12 1.5c.6 4 5.5 6.2 5.5 12a5.5 5.5 0 0 1-11 0c0-3.2 1.8-4.6 2.4-7.4 1.2 1.2 2 2.6 2 4.4 1.4-2.4 1.6-5.6 1.1-9z" />
      <path fill="#FFB347" d="M12 12c.3 2 2.6 3 2.6 5.2a2.6 2.6 0 0 1-5.2 0c0-1.6 1.2-2.4 1.6-3.6.6.6 1 1.2 1 2 .4-1.2.2-2.4 0-3.6z" />
    </g>
  ),
  ice: (
    <g fill="none" stroke="#3BB2F0" strokeWidth="2" strokeLinecap="round">
      <path d="M12 2v20M3.3 7l17.4 10M3.3 17l17.4-10" />
      <path d="M9.5 3.5L12 6l2.5-2.5M9.5 20.5L12 18l2.5 2.5M3.6 10.6l3.4-.9-.9-3.4M20.4 13.4l-3.4.9.9 3.4M3.6 13.4l3.4.9-.9 3.4M20.4 10.6l-3.4-.9.9-3.4" />
    </g>
  ),
  ele: <path fill="#F7E23B" d="M14.5 1L4 13.5h6.5L8.5 23 20 9.5h-6.8z" />,
  win: (
    <g fill="none" stroke="#82DC5A" strokeWidth="2.4" strokeLinecap="round">
      <path d="M2 8h12a3 3 0 1 0-3-3" /><path d="M2 12.5h17a3 3 0 1 1-3 3" /><path d="M2 17h8" />
    </g>
  ),
  psy: (
    <path fill="none" stroke="#DA66EA" strokeWidth="2.2" strokeLinecap="round"
      d="M12 12a1.5 1.5 0 0 1 3 0 4.5 4.5 0 0 1-9 0 7.5 7.5 0 0 1 15 0 10.5 10.5 0 0 1-10.5 10.5" />
  ),
  nuk: (
    <g fill="none" stroke="#45DDE4" strokeWidth="1.8">
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
      <circle cx="12" cy="12" r="2" fill="#45DDE4" />
    </g>
  ),
  ble: (
    <g fill="none" stroke="#F8EFB8" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" fill="#F8EFB8" />
      <path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4M4.6 4.6l2.8 2.8M16.6 16.6l2.8 2.8M4.6 19.4l2.8-2.8M16.6 7.4l2.8-2.8" />
    </g>
  ),
  cur: (
    <g>
      <path fill="#FF5468" d="M12 2a8.5 8.5 0 0 0-8.5 8.5c0 3 1.7 5 3.3 5.8V20a1 1 0 0 0 1 1h8.4a1 1 0 0 0 1-1v-3.7c1.6-.8 3.3-2.8 3.3-5.8A8.5 8.5 0 0 0 12 2z" />
      <circle cx="8.6" cy="11" r="2.2" fill="var(--icon-bg, #141414)" />
      <circle cx="15.4" cy="11" r="2.2" fill="var(--icon-bg, #141414)" />
      <path fill="var(--icon-bg, #141414)" d="M12 13.6l1.2 2.4h-2.4z" />
    </g>
  ),
  alm: (
    <g>
      <path fill="#F5F5F0" d="M12 1l2.2 7.3L21 6l-4.6 5.4L23 14l-7.1.6L17 22l-5-5.6L7 22l1.1-7.4L1 14l6.6-2.6L3 6l6.8 2.3z" />
      <circle cx="12" cy="12" r="2.4" fill="var(--icon-bg, #141414)" />
    </g>
  ),
  ail: (
    <g fill="#B866EE">
      <path d="M12 4c2 0 2.4 2.4 4.3 2.7s3.6-.9 4.3.9-1.4 2.9-1 4.8 2.6 3.2 1.2 4.8-3.6-.2-5 1.1S14.8 21 12 21s-1.9-2.7-3.8-3-3.8 1.3-4.8-.4 1.1-3.2.8-5.1S1.8 9.4 2.7 7.6 6 7.3 7.4 5.6 10 4 12 4z" />
      <circle cx="21.5" cy="3" r="1.5" />
      <circle cx="2.5" cy="21.5" r="1.3" />
    </g>
  ),
  rec: (
    <g fill="#5FE08A">
      <path d="M10 2l1.7 5.6L17 9.3l-5.3 1.7L10 16.6 8.3 11 3 9.3l5.3-1.7z" />
      <path d="M18 13l1 3.2 3 1-3 1-1 3.3-1-3.3-3-1 3-1z" />
      <circle cx="4" cy="19" r="1.4" />
    </g>
  ),
  sup: (
    <g>
      <path fill="#4C7DF0" d="M12 1.5l8.5 3.2v6.5c0 5.3-3.7 9.6-8.5 11.3-4.8-1.7-8.5-6-8.5-11.3V4.7z" />
      <path d="M12 17V8M8 11.5L12 7.5l4 4" fill="none" stroke="#0B0B0B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  pas: (
    <g fill="none" stroke="#EBD25A" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12a8 8 0 0 1-13.6 5.7" /><path d="M4 12a8 8 0 0 1 13.6-5.7" />
      <path d="M17.8 2.5v4h-4" /><path d="M6.2 21.5v-4h4" />
    </g>
  ),
  any: (
    <path fill="none" stroke="#D4AF37" strokeWidth="2.4" strokeLinecap="round"
      d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
  ),
};

interface Props {
  element: IconKey;
  size?: number;
  /** Si se pasa, el ícono se anuncia a lectores de pantalla con este texto */
  label?: string;
}

export function ElementIcon({ element, size = 28, label }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {PATHS[element]}
    </svg>
  );
}
