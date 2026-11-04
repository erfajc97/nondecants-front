import { useEffect, useState } from 'react';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';

/**
 * Ajustes públicos del sitio (tabla `settings` del backend, editable desde el
 * admin). Cada bloque de contenido vive en una clave y se guarda como texto:
 * número, texto plano o JSON. Los valores por defecto viven junto a cada
 * consumidor y son lo que había antes en código, así que si el ajuste no existe
 * (o la API falla) el sitio se ve igual que siempre.
 */
export type SettingsMap = Record<string, string>;

const TTL_MS = 60_000;
let serverCache: { at: number; data: SettingsMap } | null = null;

function toMap(payload: unknown): SettingsMap {
  const list = Array.isArray(payload) ? payload : [];
  const map: SettingsMap = {};
  for (const row of list) {
    if (row && typeof (row as { key?: unknown }).key === 'string') {
      map[(row as { key: string }).key] = String((row as { value?: unknown }).value ?? '');
    }
  }
  return map;
}

export async function fetchAllSettings(): Promise<SettingsMap> {
  try {
    const { data } = await axiosInstance.get(API_ENDPOINTS.SETTINGS);
    return toMap(data?.data ?? data);
  } catch {
    return {};
  }
}

/** Versión para páginas `.astro` (servidor): una sola lectura cada minuto. */
export async function getSettingsServer(): Promise<SettingsMap> {
  if (serverCache && Date.now() - serverCache.at < TTL_MS) return serverCache.data;
  const data = await fetchAllSettings();
  serverCache = { at: Date.now(), data };
  return data;
}

/** Convierte el texto guardado al tipo del valor por defecto (JSON, número o texto). */
export function parseSetting<T>(raw: string | undefined, fallback: T): T {
  if (raw === undefined || raw.trim() === '') return fallback;
  try {
    if (typeof fallback === 'string') return raw as unknown as T;
    if (typeof fallback === 'number') {
      const n = Number(raw);
      return (Number.isFinite(n) ? n : fallback) as unknown as T;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback)) {
      return (Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback) as unknown as T;
    }
    return (parsed && typeof parsed === 'object' ? { ...fallback, ...parsed } : fallback) as T;
  } catch {
    return fallback;
  }
}

export function getSetting<T>(map: SettingsMap, key: string, fallback: T): T {
  return parseSetting(map[key], fallback);
}

const CLIENT_TTL_MS = 5 * 60_000;
let clientLoad: { at: number; promise: Promise<SettingsMap> } | null = null;

/** Una sola lectura compartida por todas las islas (no necesita QueryClientProvider). */
function loadSettingsClient(): Promise<SettingsMap> {
  if (!clientLoad || Date.now() - clientLoad.at > CLIENT_TTL_MS) {
    clientLoad = { at: Date.now(), promise: fetchAllSettings() };
  }
  return clientLoad.promise;
}

/**
 * Todos los ajustes, o `null` mientras cargan. El primer render siempre es
 * `null` (igual que en el servidor) para no desajustar la hidratación.
 */
export function useSettingsMap(): SettingsMap | null {
  const [map, setMap] = useState<SettingsMap | null>(null);
  useEffect(() => {
    let alive = true;
    loadSettingsClient().then((m) => alive && setMap(m));
    return () => {
      alive = false;
    };
  }, []);
  return map;
}

/** Valor de un ajuste; mientras carga (o si no existe) devuelve `fallback`. */
export function useSetting<T>(key: string, fallback: T): T {
  const map = useSettingsMap();
  return map ? getSetting(map, key, fallback) : fallback;
}
