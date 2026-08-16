const RECENTLY_VIEWED_KEY = 'luxue_recently_viewed_products';
const MAX_RECENT_ITEMS = 12;

interface RecentItem {
  id: string;
  timestamp: number;
}

/**
 * Adds a product ID to the recently viewed queue in localStorage
 */
export function addToRecentlyViewed(productId: string): void {
  if (!productId || typeof window === 'undefined') return;

  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    let list: RecentItem[] = [];
    if (raw) {
      list = JSON.parse(raw);
    }

    // Filter out current product to move it to the front
    list = list.filter(item => item.id !== productId);

    // Unshift to front
    list.unshift({ id: productId, timestamp: Date.now() });

    // Keep within limit
    list = list.slice(0, MAX_RECENT_ITEMS);

    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Could not save to recently viewed storage:', err);
  }
}

/**
 * Returns array of recently viewed product IDs (ordered from newest to oldest)
 */
export function getRecentlyViewedProductIds(currentProductId?: string): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return [];

    const list: RecentItem[] = JSON.parse(raw);
    return list
      .map(item => item.id)
      .filter(id => (currentProductId ? id !== currentProductId : true));
  } catch {
    return [];
  }
}

/**
 * Clears recently viewed history
 */
export function clearRecentlyViewed(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENTLY_VIEWED_KEY);
  } catch {}
}
