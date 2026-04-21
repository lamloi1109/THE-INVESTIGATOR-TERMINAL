// app/src/lib/cache.ts

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  isRevalidating: boolean;
}

const cache = new Map<string, CacheEntry<any>>();

export async function withSWR<T>(
  key: string,
  fetcher: () => Promise<T>,
  maxAgeMs = 300 * 1000, // 5 phút
  staleWhileRevalidateMs = 3600 * 1000 // 1 giờ
): Promise<T> {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached) {
    const age = now - cached.timestamp;

    // Trường hợp 1: Cache còn rất mới (Fresh) -> Trả về ngay
    if (age <= maxAgeMs) {
      console.log(`[Cache Hit] ${key} (Fresh)`);
      return cached.data;
    }

    // Trường hợp 2: Cache cũ nhưng còn trong hạn Stale -> Trả về ngay, nhưng fetch ngầm (Revalidate)
    if (age <= maxAgeMs + staleWhileRevalidateMs) {
      console.log(`[Cache Hit] ${key} (Stale) - Triggering background revalidate`);
      if (!cached.isRevalidating) {
        cached.isRevalidating = true;
        // Background fetch không chặn luồng chính
        fetcher().then(newData => {
          cache.set(key, { data: newData, timestamp: Date.now(), isRevalidating: false });
          console.log(`[Cache Updated] ${key} revalidated successfully`);
        }).catch(err => {
          cached.isRevalidating = false;
          console.error(`[Cache Error] Revalidation failed for ${key}`, err);
        });
      }
      return cached.data;
    }
  }

  // Trường hợp 3: Không có cache hoặc đã quá hạn Stale -> Fetch đồng bộ
  console.log(`[Cache Miss] ${key} - Fetching synchronous`);
  const data = await fetcher();
  cache.set(key, { data, timestamp: Date.now(), isRevalidating: false });
  return data;
}