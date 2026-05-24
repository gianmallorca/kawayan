import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { LegalPagePublic } from '@/api/legal';
import { getCachedLegalPage, legalSlugFromPath, loadLegalPage } from '@/lib/legalCache';

function formatDate(iso?: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function LegalPageSkeleton() {
  return (
    <article className="py-16 lg:py-20 min-h-[calc(100dvh-12rem)]" aria-busy="true" aria-label="Loading legal page">
      <div className="max-w-3xl mx-auto px-4 animate-pulse space-y-4">
        <div className="h-10 bg-slate-200 rounded-lg w-2/3 max-w-md" />
        <div className="h-4 bg-slate-100 rounded w-1/3 max-w-xs" />
        <div className="space-y-3 pt-6">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-4 bg-slate-100 rounded" style={{ width: `${92 - i * 6}%` }} />
          ))}
        </div>
      </div>
    </article>
  );
}

function LegalPageContent({ page }: { page: LegalPagePublic }) {
  return (
    <article className="py-16 lg:py-20">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">{page.title}</h1>
        {page.lastRevised ? (
          <p className="text-sm text-slate-500 mb-8">Last revised: {formatDate(page.lastRevised)}</p>
        ) : (
          <div className="mb-8" />
        )}
        <div className="prose prose-slate max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
          {page.body}
        </div>
      </div>
    </article>
  );
}

export function LegalPage() {
  const { pathname } = useLocation();
  const slug = legalSlugFromPath(pathname);
  const [page, setPage] = useState<LegalPagePublic | null>(null);
  const [notFound, setNotFound] = useState(false);

  const displayPage = slug ? (getCachedLegalPage(slug) ?? (page?.slug === slug ? page : null)) : null;

  useEffect(() => {
    if (!slug) return;

    const cached = getCachedLegalPage(slug);
    if (cached) {
      setPage(cached);
      setNotFound(false);
      return;
    }

    setNotFound(false);
    let cancelled = false;
    loadLegalPage(slug)
      .then((data) => {
        if (!cancelled) {
          setPage(data);
          setNotFound(false);
        }
      })
      .catch(() => {
        if (!cancelled && !getCachedLegalPage(slug)) {
          setPage(null);
          setNotFound(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!slug) return null;

  if (displayPage) return <LegalPageContent page={displayPage} />;

  if (notFound) {
    return (
      <section className="py-16 lg:py-20 min-h-[calc(100dvh-12rem)]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-slate-600 mb-6">This page is not available.</p>
          <Link to="/" className="text-primary text-sm font-medium hover:underline">
            Back to Home
          </Link>
        </div>
      </section>
    );
  }

  return <LegalPageSkeleton />;
}
