import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DRAFT_MINUTES, clearDraft, readDraft, writeDraft } from './buildDraft';

const store = new Map<string, string>();
beforeEach(() => {
  store.clear();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  });
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('borrador de builds', () => {
  it('se recupera después de recargar', () => {
    writeDraft('p3r:nueva', { title: 'Kidd' });
    expect(readDraft('p3r:nueva')).toEqual({ title: 'Kidd' });
    expect(readDraft('p5r:nueva')).toBeNull();
  });
  it(`vence a los ${DRAFT_MINUTES} minutos de la última modificación`, () => {
    writeDraft('p3r:nueva', { title: 'Kidd' });
    vi.advanceTimersByTime((DRAFT_MINUTES - 1) * 60_000);
    writeDraft('p3r:nueva', { title: 'Kidd 2' });
    vi.advanceTimersByTime((DRAFT_MINUTES - 1) * 60_000);
    expect(readDraft('p3r:nueva')).toEqual({ title: 'Kidd 2' });
    vi.advanceTimersByTime(2 * 60_000);
    expect(readDraft('p3r:nueva')).toBeNull();
    expect(store.size).toBe(0);
  });
  it('se borra al publicar', () => {
    writeDraft('p3r:abc', { title: 'x' });
    clearDraft('p3r:abc');
    expect(readDraft('p3r:abc')).toBeNull();
  });
});
