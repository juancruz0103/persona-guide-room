import { useSyncExternalStore } from 'react';

/**
 * Modo Episodio Aigis: en el DLC no hay vínculos ni calendario, así que las
 * Personas que en el juego base piden un requisito se liberan avanzando en
 * la historia. La tabla de fusión es la misma. Se recuerda entre visitas.
 */
const KEY = 'pgr.p3r.aigis';
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

let current = read();

export const isAigisMode = () => current;

export function setAigisMode(on: boolean) {
  current = on;
  try {
    localStorage.setItem(KEY, on ? '1' : '0');
  } catch {
    /* sin almacenamiento */
  }
  listeners.forEach((l) => l());
}

export function useAigisMode(): [boolean, (on: boolean) => void] {
  const on = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    isAigisMode,
    isAigisMode,
  );
  return [on, setAigisMode];
}
