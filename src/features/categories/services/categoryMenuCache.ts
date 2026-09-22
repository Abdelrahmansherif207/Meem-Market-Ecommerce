import type { CategoryMenuItem } from "../types";
import { categoryMenuService } from "./categoryMenuService";

interface CacheEntry {
  data: CategoryMenuItem[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
/** Client-session cache for the drawer menu; matches the server NAV TTL. */
const TTL = 2 * 60 * 1000;

function getCached(key: string): CategoryMenuItem[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: CategoryMenuItem[]) {
  cache.set(key, { data, timestamp: Date.now() });
}

export const categoryMenuWithCache = {
  getMenu: async (lang: string, level: number = 3): Promise<CategoryMenuItem[]> => {
    const cacheKey = `${lang}-${level}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const fresh = await categoryMenuService.getMenu(lang, level);
    setCache(cacheKey, fresh);
    return fresh;
  },
};
