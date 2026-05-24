import { fetchPageContent } from '@/api/content';
import type { PageSection } from '@/types';

const cache = new Map<string, PageSection[]>();
const inflight = new Map<string, Promise<PageSection[]>>();

export function getCachedPageContent(page: string) {
  return cache.get(page);
}

export async function loadPageContent(page: string): Promise<PageSection[]> {
  const cached = cache.get(page);
  if (cached) return cached;

  const pending = inflight.get(page);
  if (pending) return pending;

  const promise = fetchPageContent(page)
    .then((data) => {
      cache.set(page, data);
      inflight.delete(page);
      return data;
    })
    .catch((err) => {
      inflight.delete(page);
      throw err;
    });

  inflight.set(page, promise);
  return promise;
}

export function prefetchPageContent(page: string) {
  if (cache.has(page) || inflight.has(page)) return;
  void loadPageContent(page).catch(() => undefined);
}

export const PUBLIC_PAGES = ['home', 'about', 'services', 'contact'] as const;

export function prefetchAllPublicPages() {
  PUBLIC_PAGES.forEach(prefetchPageContent);
}

export function invalidatePageContent(page?: string) {
  if (page) {
    cache.delete(page);
    inflight.delete(page);
  } else {
    cache.clear();
    inflight.clear();
  }
}
