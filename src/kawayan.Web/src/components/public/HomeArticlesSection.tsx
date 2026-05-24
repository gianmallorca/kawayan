import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { prefetchArticles } from '@/lib/articlesCache';
import { fetchPublishedArticles } from '@/api/articles';
import { ArticleCard } from '@/components/public/ArticleCard';
import { BLOGS_SECTION_TITLE } from '@/lib/blogLabels';
import type { ArticleListItem } from '@/types';

export function HomeArticlesSection() {
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [showSeeMore, setShowSeeMore] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetchPublishedArticles(4)
      .then((items) => {
        setShowSeeMore(items.length > 3);
        setArticles(items.slice(0, 3));
        prefetchArticles();
      })
      .catch(() => {
        setArticles([]);
        setShowSeeMore(false);
      })
      .finally(() => setReady(true));
  }, []);

  if (!ready || articles.length === 0) return null;

  return (
    <section className="bg-white py-16 lg:py-20 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-2 text-slate-900">{BLOGS_SECTION_TITLE}</h2>
        <p className="text-center text-sm text-slate-600 mb-10">Stories and updates from our team</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
        {showSeeMore ? (
          <div className="text-center mt-10">
            <Link
              to="/articles"
              onMouseEnter={prefetchArticles}
              onFocus={prefetchArticles}
              className="inline-flex items-center justify-center min-h-[44px] px-6 text-primary text-sm font-medium hover:underline"
            >
              See more…
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
