import { useEffect, useState } from 'react';

/**
 * Como useState, pero recuerda el valor mientras la pestaña esté abierta
 * (para volver a una lista con los mismos filtros).
 */
export function useSessionState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = sessionStorage.getItem(`pgr.state.${key}`);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      sessionStorage.setItem(`pgr.state.${key}`, JSON.stringify(value));
    } catch {
      /* sin almacenamiento */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
