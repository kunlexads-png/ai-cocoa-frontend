
interface CacheEntry<T> {
  value: T;
  expiry: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Simple in-memory cache with TTL (Time To Live).
 * Used to store expensive model predictions or API responses.
 */
export const cacheService = {
  /**
   * Retrieve item from cache. Returns null if missing or expired.
   */
  get: <T>(key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiry) {
      cache.delete(key);
      return null;
    }
    
    console.debug(`[Cache] Hit for key: ${key}`);
    return entry.value;
  },

  /**
   * Set item in cache with TTL in minutes.
   */
  set: <T>(key: string, value: T, ttlMinutes: number = 5) => {
    cache.set(key, {
      value,
      expiry: Date.now() + (ttlMinutes * 60 * 1000)
    });
    console.debug(`[Cache] Set key: ${key} (TTL: ${ttlMinutes}m)`);
  },

  /**
   * Clear all cache entries.
   */
  clear: () => {
    cache.clear();
  }
};
