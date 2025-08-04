// Simple cache using Map
const cache = new Map<string, any>();

// Generic cache function with caller-defined keys
export async function withCache<T>(key: string, fetcherFn: () => Promise<T>): Promise<T> {
  if (cache.has(key)) {
    return cache.get(key);
  }

  const result = await fetcherFn();
  cache.set(key, result);
  return result;
}
