/**
 * Caché en memoria SOLO para el SSR (el proceso de Node de la web).
 *
 * El servidor de la web pide a la API desde una sola IP; sin caché, cada visita
 * a la home es una petición y la API termina respondiendo 429. Aquí:
 *  - una respuesta buena se reutiliza `ttlMs`;
 *  - peticiones simultáneas comparten una sola llamada;
 *  - si la API falla, se sirve la última respuesta buena (aunque esté vencida);
 *  - un error nunca se guarda: si no hay respuesta buena previa, el error sube.
 */
interface Entry<T> {
  at: number;
  value: T;
}

const store = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export async function cachedServerFetch<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
  /** Respuestas que no se guardan (p. ej. listas vacías por un fallo silencioso). */
  isCacheable: (value: T) => boolean = () => true,
): Promise<T> {
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && Date.now() - hit.at < ttlMs) return hit.value;

  const pending = inflight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const run = load()
    .then((value) => {
      if (isCacheable(value)) store.set(key, { at: Date.now(), value });
      else if (hit) return hit.value; // vacío sospechoso: mejor la última buena
      return value;
    })
    .catch((error) => {
      if (hit) return hit.value;
      throw error;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, run);
  return run;
}
