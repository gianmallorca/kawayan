import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { formatArticleCredits } from '@/lib/articleCredits';
import { BLOGS_PAGE_TITLE } from '@/lib/blogLabels';
import { getCachedArticle, loadArticle } from '@/lib/articlesCache';
import { publicAssetUrl } from '@/lib/utils';
import type { ArticleDetail } from '@/types';

function ArticleDetailSkeleton() {
  return (
    <article className="pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-12 lg:pb-20 min-h-[calc(100dvh-12rem)]" aria-busy="true" aria-label={`Loading ${BLOGS_PAGE_TITLE.toLowerCase()} post`}>
      <div className="max-w-3xl mx-auto px-4 animate-pulse space-y-4">
        <div className="h-5 bg-slate-100 rounded w-40" />
        <div className="aspect-[16/10] w-full bg-slate-200 rounded-xl" />
        <div className="h-10 bg-slate-200 rounded-lg w-3/4 max-w-md" />
        <div className="h-4 bg-slate-100 rounded w-1/2 max-w-xs" />
        <div className="space-y-3 pt-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-4 bg-slate-100 rounded" style={{ width: `${92 - i * 6}%` }} />
          ))}
        </div>
      </div>
    </article>
  );
}

function ArticleDetailContent({ article }: { article: ArticleDetail }) {
  const credits = formatArticleCredits(article.fullName, article.publishedAt);
  const imageCaption = article.imageDescription?.trim();

  return (
    <article className="pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-12 lg:pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <Link
          to="/articles"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary mb-8 min-h-[44px]"
        >
          <ArrowLeft size={16} aria-hidden />
          Return to {BLOGS_PAGE_TITLE}
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">{article.title}</h1>
        {credits ? <p className="text-sm text-slate-500 mb-8">{credits}</p> : <div className="mb-8" />}

        {article.imageUrl ? (
          <figure className="mb-8 text-center">
            <img
              src={publicAssetUrl(article.imageUrl)}
              alt={imageCaption || ''}
              className="aspect-[16/10] w-full object-cover rounded-xl"
              decoding="async"
            />
            {imageCaption ? (
              <figcaption className="mt-2 text-xs leading-snug text-slate-500 text-center px-2">
                {imageCaption}
              </figcaption>
            ) : null}
          </figure>
        ) : null}

        <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
          {article.content}
        </div>
      </div>
    </article>
  );
}

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  const displayArticle = slug ? (getCachedArticle(slug) ?? (article?.slug === slug ? article : null)) : null;

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      return;
    }

    const cached = getCachedArticle(slug);
    if (cached) {
      setArticle(cached);
      setNotFound(false);
      return;
    }

    setNotFound(false);
    let cancelled = false;
    loadArticle(slug)
      .then((data) => {
        if (!cancelled) {
          setArticle(data);
          setNotFound(false);
        }
      })
      .catch(() => {
        if (!cancelled && !getCachedArticle(slug)) {
          setArticle(null);
          setNotFound(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!slug || notFound) {
    return (
      <section className="pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-12 lg:pb-20 min-h-[calc(100dvh-12rem)]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-slate-600 mb-6">This post could not be found.</p>
          <Link to="/articles" className="text-primary text-sm font-medium hover:underline">
            Back to {BLOGS_PAGE_TITLE}
          </Link>
        </div>
      </section>
    );
  }

  if (displayArticle) return <ArticleDetailContent article={displayArticle} />;

  return <ArticleDetailSkeleton />;
}
