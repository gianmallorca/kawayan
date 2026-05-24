import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getCachedArticles, loadArticles, prefetchArticles } from '@/lib/articlesCache';
import { ArticleCard } from '@/components/public/ArticleCard';
import { BLOGS_PAGE_TITLE } from '@/lib/blogLabels';
import type { ArticleListItem } from '@/types';

export function ArticlesListPage() {
  const [articles, setArticles] = useState<ArticleListItem[]>(() => getCachedArticles() ?? []);
  const [loading, setLoading] = useState(() => getCachedArticles() === undefined);

  useEffect(() => {
    let cancelled = false;
    prefetchArticles();
    loadArticles()
      .then((data) => {
        if (!cancelled) setArticles(data);
      })
      .catch(() => {
        if (!cancelled) setArticles([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-12 lg:pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary mb-6 min-h-[44px]"
        >
          <ArrowLeft size={16} aria-hidden />
          Return to Home
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-10">{BLOGS_PAGE_TITLE}</h1>

        {loading && articles.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">Loading…</p>
        ) : articles.length === 0 ? (
          <p className="text-slate-400 text-center text-sm py-16">No blog posts published yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
