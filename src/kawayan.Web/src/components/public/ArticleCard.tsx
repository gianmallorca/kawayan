import { Link } from 'react-router-dom';
import { prefetchArticle } from '@/lib/articlesCache';
import { publicAssetUrl } from '@/lib/utils';
import type { ArticleListItem } from '@/types';

function formatPublishedAt(iso?: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function ArticleCard({ article }: { article: ArticleListItem }) {
  const publishedAt = formatPublishedAt(article.publishedAt);

  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 flex flex-col h-full">
      {article.imageUrl ? (
        <img
          src={publicAssetUrl(article.imageUrl)}
          alt=""
          className="aspect-[16/10] w-full object-cover"
          decoding="async"
        />
      ) : (
        <div className="aspect-[16/10] w-full bg-slate-100" aria-hidden />
      )}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs text-slate-500 mb-2">
          {article.fullName}
          {publishedAt ? ` · ${publishedAt}` : ''}
        </p>
        <h3 className="font-semibold text-lg mb-2 text-slate-900 line-clamp-2">{article.title}</h3>
        <p className="text-gray-700 text-sm mb-4 line-clamp-3 flex-1 leading-relaxed">{article.description}</p>
        <Link
          to={`/articles/${article.slug}`}
          onMouseEnter={() => prefetchArticle(article.slug)}
          onFocus={() => prefetchArticle(article.slug)}
          className="inline-flex items-center min-h-[44px] text-primary text-sm font-medium hover:underline active:opacity-80 mt-auto"
        >
          Read more →
        </Link>
      </div>
    </article>
  );
}
