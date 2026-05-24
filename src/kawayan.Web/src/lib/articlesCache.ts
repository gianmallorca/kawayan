import { fetchPublishedArticle, fetchPublishedArticles } from '@/api/articles';
import type { ArticleDetail, ArticleListItem } from '@/types';

let listCached: ArticleListItem[] | undefined;
let listInflight: Promise<ArticleListItem[]> | undefined;

const detailCache = new Map<string, ArticleDetail>();
const detailInflight = new Map<string, Promise<ArticleDetail>>();

export function getCachedArticles() {
  return listCached;
}

export function getCachedArticle(slug: string) {
  return detailCache.get(slug);
}

export function isArticleDetailPath(pathname: string) {
  return /^\/articles\/[^/]+$/.test(pathname);
}

export function articleSlugFromPath(pathname: string) {
  const match = pathname.match(/^\/articles\/([^/]+)$/);
  return match?.[1] ?? null;
}

export async function loadArticles(): Promise<ArticleListItem[]> {
  if (listCached) return listCached;
  if (listInflight) return listInflight;

  listInflight = fetchPublishedArticles()
    .then((data) => {
      listCached = data;
      listInflight = undefined;
      return data;
    })
    .catch((err) => {
      listInflight = undefined;
      throw err;
    });

  return listInflight;
}

export async function loadArticle(slug: string): Promise<ArticleDetail> {
  const cached = detailCache.get(slug);
  if (cached) return cached;

  const pending = detailInflight.get(slug);
  if (pending) return pending;

  const promise = fetchPublishedArticle(slug)
    .then((data) => {
      detailCache.set(slug, data);
      detailInflight.delete(slug);
      return data;
    })
    .catch((err) => {
      detailInflight.delete(slug);
      throw err;
    });

  detailInflight.set(slug, promise);
  return promise;
}

export function prefetchArticles() {
  if (listCached || listInflight) return;
  void loadArticles()
    .then((articles) => {
      for (const article of articles) prefetchArticle(article.slug);
    })
    .catch(() => undefined);
}

export function prefetchArticle(slug: string) {
  if (detailCache.has(slug) || detailInflight.has(slug)) return;
  void loadArticle(slug).catch(() => undefined);
}

export function invalidateArticlesCache(slug?: string) {
  if (slug) {
    detailCache.delete(slug);
    detailInflight.delete(slug);
    return;
  }
  listCached = undefined;
  listInflight = undefined;
  detailCache.clear();
  detailInflight.clear();
}
