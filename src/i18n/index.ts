import { useSyncExternalStore } from 'react';
import dataEn from './data-en.json';

/**
 * Idioma de la web. La primera vez se toma del navegador; después, lo que eligió el usuario.
 * Los textos se escriben en el lugar con L('español', 'english').
 */
export type Lang = 'es' | 'en';
const KEY = 'pgr.lang';

function detect(): Lang {
  if (typeof window === 'undefined') return 'es';
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'es' || saved === 'en') return saved;
  } catch {
    /* sin almacenamiento */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'es';
  return nav.toLowerCase().startsWith('es') ? 'es' : 'en';
}

let current: Lang = detect();
const listeners = new Set<() => void>();
if (typeof document !== 'undefined') document.documentElement.lang = current;

export const getLang = (): Lang => current;
export const isEn = (): boolean => current === 'en';

export function setLang(l: Lang) {
  if (l === current) return;
  current = l;
  try {
    localStorage.setItem(KEY, l);
  } catch {
    /* sin almacenamiento */
  }
  document.documentElement.lang = l;
  listeners.forEach((f) => f());
}

export function useLang(): Lang {
  return useSyncExternalStore(
    (f) => {
      listeners.add(f);
      return () => listeners.delete(f);
    },
    getLang,
    getLang,
  );
}

/** Texto de la interfaz en el idioma actual. */
export const L = (es: string, en: string): string => (current === 'en' ? en : es);

/** Textos que vienen de los datos (confidentes, clases…): se buscan en la tabla de traducciones. */
const DATA = dataEn as Record<string, string>;
export const tr = (es: string | null | undefined): string => {
  if (!es) return es ?? '';
  return current === 'en' ? DATA[es] ?? es : es;
};

/** Fechas con el formato del idioma actual. */
export const locale = (): string => (current === 'en' ? 'en-US' : 'es-AR');

/**
 * Convierte propiedades de objetos de datos en bilingües sin cambiar a quien las usa:
 * `bilingual(obj, { name: 'Magician' })` hace que obj.name devuelva el inglés cuando corresponde.
 */
export function bilingual<T extends object>(obj: T, en: Partial<Record<keyof T, string>>): T {
  for (const key of Object.keys(en) as (keyof T)[]) {
    const es = obj[key];
    const enText = en[key];
    Object.defineProperty(obj, key, { get: () => (current === 'en' ? enText : es), enumerable: true, configurable: true });
  }
  return obj;
}
