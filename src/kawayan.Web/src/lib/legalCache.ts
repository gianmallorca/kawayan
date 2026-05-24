import { fetchLegalPage } from '@/api/legal';
import type { LegalPagePublic } from '@/api/legal';

const cache = new Map<string, LegalPagePublic>();
const inflight = new Map<string, Promise<LegalPagePublic>>();

export const LEGAL_SLUGS = ['privacy-policy', 'terms', 'cookie-policy'] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export function isLegalPath(pathname: string) {
  return LEGAL_SLUGS.some((slug) => pathname === `/${slug}`);
}

export function legalSlugFromPath(pathname: string): LegalSlug | null {
  return LEGAL_SLUGS.find((slug) => pathname === `/${slug}`) ?? null;
}

export function getCachedLegalPage(slug: string) {
  return cache.get(slug);
}

export async function loadLegalPage(slug: string): Promise<LegalPagePublic> {
  const cached = cache.get(slug);
  if (cached) return cached;

  const pending = inflight.get(slug);
  if (pending) return pending;

  const promise = fetchLegalPage(slug)
    .then((data) => {
      cache.set(slug, data);
      inflight.delete(slug);
      return data;
    })
    .catch((err) => {
      inflight.delete(slug);
      throw err;
    });

  inflight.set(slug, promise);
  return promise;
}

export function prefetchLegalPage(slug: string) {
  if (cache.has(slug) || inflight.has(slug)) return;
  void loadLegalPage(slug).catch(() => undefined);
}

export function prefetchAllLegalPages() {
  for (const slug of LEGAL_SLUGS) prefetchLegalPage(slug);
}

export function invalidateLegalCache(slug?: string) {
  if (slug) {
    cache.delete(slug);
    inflight.delete(slug);
  } else {
    cache.clear();
    inflight.clear();
  }
}
