import { useEffect, useRef, useState } from 'react';

/**
 * Borrador local del editor de builds: si la página se recarga sin querer mientras armás una build,
 * al volver se recupera lo que tenías. Queda solo en este navegador y vence a los 30 minutos
 * de la última modificación. Al publicar se borra.
 */
export const DRAFT_MINUTES = 30;
const PREFIX = 'pgr:draft:';

export type BuildDraft<T> = { savedAt: number; data: T };

const keyOf = (key: string) => PREFIX + key;

export function readDraft<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(keyOf(key));
    if (!raw) return null;
    const d = JSON.parse(raw) as BuildDraft<T>;
    if (!d || typeof d.savedAt !== 'number' || Date.now() - d.savedAt > DRAFT_MINUTES * 60_000) {
      localStorage.removeItem(keyOf(key));
      return null;
    }
    return d.data;
  } catch {
    return null;
  }
}

export function writeDraft<T>(key: string, data: T) {
  try {
    localStorage.setItem(keyOf(key), JSON.stringify({ savedAt: Date.now(), data } satisfies BuildDraft<T>));
  } catch {
    /* sin espacio o almacenamiento bloqueado: no pasa nada, solo no hay borrador */
  }
}

export function clearDraft(key: string) {
  try {
    localStorage.removeItem(keyOf(key));
  } catch {
    /* nada */
  }
}

/** Limpia borradores vencidos de cualquier juego, para que no se acumulen. */
function sweep() {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX)) readDraft(k.slice(PREFIX.length));
    }
  } catch {
    /* nada */
  }
}

/**
 * Guarda `data` como borrador cada vez que cambia (solo después de `start()` y si es distinto
 * de lo que había al empezar). `start()` se llama cuando el editor ya cargó la build (o enseguida
 * si es nueva): devuelve el borrador guardado, si hay, para que el editor lo aplique.
 */
export function useBuildDraft<T>(key: string, data: T) {
  const [ready, setReady] = useState(false);
  const [restored, setRestored] = useState(false);
  const baseline = useRef<string | null>(null);
  const json = JSON.stringify(data);

  useEffect(() => {
    if (!ready) return;
    if (baseline.current === null) {
      baseline.current = json;
      return;
    }
    if (json !== baseline.current) writeDraft(key, data);
    // `data` va por `json`: así no se guarda en cada render, solo cuando el contenido cambia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, json, key]);

  return {
    restored,
    start(): T | null {
      sweep();
      const d = readDraft<T>(key);
      setRestored(!!d);
      setReady(true);
      return d;
    },
    clear() {
      clearDraft(key);
      setRestored(false);
    },
  };
}
