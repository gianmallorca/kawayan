import { memo, useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AdminFloatingBar } from '@/components/public/AdminFloatingBar';
import { useCompany } from '@/contexts/CompanyContext';
import { preloadImage } from '@/lib/imagePreload';
import { CONTACT_HEADER_FALLBACK, SERVICE_HEADER_FALLBACK } from '@/lib/pageHeader';
import { isArticleDetailPath, prefetchArticles } from '@/lib/articlesCache';
import { isLegalPath, prefetchAllLegalPages } from '@/lib/legalCache';
import { prefetchAllPublicPages } from '@/lib/pageContentCache';
import { prefetchServices } from '@/lib/servicesCache';
import { companyAssetUrl } from '@/lib/utils';
import { CompanyNameFromDetails } from '@/components/CompanyName';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { ScrollToTopButton } from '@/components/layout/ScrollToTopButton';
import { companyNameInitials } from '@/lib/companyNameValidation';
import { publicNavItems } from '@/lib/publicNav';
import type { CompanyDetails } from '@/types';

const PublicSiteHeader = memo(function PublicSiteHeader({ company }: { company: CompanyDetails | null }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-30 w-full shrink-0 self-start border-0 bg-white pt-[env(safe-area-inset-top)] shadow-md transform-gpu">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            {company?.logoUrl ? (
              <img
                src={companyAssetUrl(company.logoUrl, company.updatedAt)}
                alt=""
                className="h-9 w-auto max-w-[120px] object-contain"
                decoding="async"
              />
            ) : (
              <span className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold shrink-0">
                {companyNameInitials(company?.nameMain, 'BS')}
              </span>
            )}
            {(company?.nameMain || company?.nameBaybayin) && (
              <CompanyNameFromDetails
                company={company}
                className="font-semibold text-slate-900 truncate text-sm sm:text-base min-w-0"
              />
            )}
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            {publicNavItems.map((item) => {
              const active =
                item.to === '/articles'
                  ? location.pathname === '/articles' || location.pathname.startsWith('/articles/')
                  : location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onMouseEnter={item.to === '/articles' ? prefetchArticles : undefined}
                  onFocus={item.to === '/articles' ? prefetchArticles : undefined}
                  className={`hover:text-primary ${active ? 'text-primary font-medium' : 'text-slate-600'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 active:bg-slate-200"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-xl md:hidden transform transition-transform duration-200 ease-out pt-[env(safe-area-inset-top)] ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-between px-4 py-3 shadow-[0_1px_0_rgba(15,23,42,0.06)]">
          <span className="font-semibold text-slate-900">Menu</span>
          <button
            type="button"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100 active:bg-slate-200"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-4 py-3 touch-scroll">
          {publicNavItems.map((item) => {
            const active =
              item.to === '/articles'
                ? location.pathname === '/articles' || location.pathname.startsWith('/articles/')
                : location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onMouseEnter={item.to === '/articles' ? prefetchArticles : undefined}
                onFocus={item.to === '/articles' ? prefetchArticles : undefined}
                className={`block py-3 px-3 text-base font-medium rounded-lg active:bg-slate-100 ${
                  active ? 'bg-primary/10 text-primary' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
});

export function PublicLayout() {
  const company = useCompany();
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    prefetchAllPublicPages();
    prefetchAllLegalPages();
    prefetchServices();
    prefetchArticles();
    preloadImage(SERVICE_HEADER_FALLBACK);
    preloadImage(CONTACT_HEADER_FALLBACK);
  }, []);

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = location.pathname;
    if (isLegalPath(prev) && isLegalPath(location.pathname)) return;
    if (isArticleDetailPath(prev) && isArticleDetailPath(location.pathname)) return;
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      <PublicSiteHeader company={company} />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
      <SiteFooter />
      <AdminFloatingBar />
      <ScrollToTopButton />
    </div>
  );
}
