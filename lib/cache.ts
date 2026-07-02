/**
 * Tiny in-memory TTL cache with single-flight de-duplication.
 * Used to avoid re-reading Google Sheets on every request.
 */

type Entry<T> = { value: T; expiresAt: number };

const store = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

/** Get a value, or compute & cache it via `loader` (de-duped across concurrent callers). */
export async function cached<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.value as T;
  }

  // Single-flight: avoid duplicate concurrent loads
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const p = (async () => {
    try {
      const value = await loader();
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, p);
  return p as unknown as Promise<T>;
}

/** Invalidate one or more keys (e.g. after a write). Supports prefix matching. */
export function bust(prefixOrKey: string): void {
  const keys = Array.from(store.keys()).concat(Array.from(inflight.keys()));
  for (const k of keys) {
    if (k === prefixOrKey || k.startsWith(prefixOrKey)) {
      store.delete(k);
      inflight.delete(k);
    }
  }
}
