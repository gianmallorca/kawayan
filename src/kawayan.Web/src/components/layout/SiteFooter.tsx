import { Link } from 'react-router-dom';
import { CompanyNameFromDetails } from '@/components/CompanyName';
import { useCompany } from '@/contexts/CompanyContext';
import { legalNavItems, publicNavItems } from '@/lib/publicNav';
import { companyNameInitials } from '@/lib/companyNameValidation';
import { SocialIconLinks } from '@/components/public/SocialIconLinks';
import { prefetchArticles } from '@/lib/articlesCache';
import { prefetchLegalPage } from '@/lib/legalCache';
import { companyAssetUrl } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

function formatWebsiteHref(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function SiteFooter() {
  const company = useCompany();
  const isLoggedIn = useAuthStore((s) => Boolean(s.accessToken && s.user));
  const year = new Date().getFullYear();
  const copyrightName = company?.nameMain?.trim();
  const socials = company
    ? Object.entries(company.socialLinks || {}).filter(([, url]) => url?.trim())
    : [];
  const hasBrand = Boolean(company?.logoUrl || company?.nameMain || company?.nameBaybayin);
  const hasContact = Boolean(
    company?.fullAddress?.trim() ||
      company?.email?.trim() ||
      company?.phone?.trim() ||
      company?.website?.trim(),
  );

  const footerLinkClass =
    'block py-0.5 leading-snug text-slate-600 hover:text-primary transition-colors break-words';

  const footerContactLinkClass = `${footerLinkClass} break-all`;

  return (
    <footer className="w-full overflow-x-hidden border-t border-gray-200 bg-slate-50 mt-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="max-w-6xl mx-auto w-full min-w-0 px-4 sm:px-6 py-8 sm:py-9 lg:py-10">
        <div className="grid gap-8 sm:gap-9 lg:grid-cols-4 lg:gap-10">
          {hasBrand ? (
            <div className="min-w-0 lg:col-span-1 text-center sm:text-left">
              <Link to="/" className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-3 min-w-0 max-w-full group">
                {company?.logoUrl ? (
                  <img
                    src={companyAssetUrl(company.logoUrl, company.updatedAt)}
                    alt=""
                    className="h-9 w-auto max-w-[100px] sm:h-10 sm:max-w-[120px] object-contain shrink-0"
                    decoding="async"
                  />
                ) : (
                  <span className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold shrink-0">
                    {companyNameInitials(company?.nameMain, 'Co')}
                  </span>
                )}
                <CompanyNameFromDetails
                  company={company}
                  className="min-w-0 flex-1 font-semibold text-slate-900 text-sm sm:text-base break-words text-center sm:text-left group-hover:text-primary transition-colors"
                />
              </Link>
              {company?.tagline?.trim() ? (
                <p className="mt-3 text-sm text-slate-600 leading-relaxed break-words max-w-full sm:max-w-sm mx-auto sm:mx-0">
                  {company.tagline}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-x-6 gap-y-8 min-w-0 sm:gap-x-8 lg:contents text-center sm:text-left">
            <nav aria-label="Footer navigation" className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 sm:mb-3">Pages</p>
              <ul className="space-y-1 text-sm flex flex-col items-center sm:items-start">
                {publicNavItems.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onMouseEnter={item.to === '/articles' ? prefetchArticles : undefined}
                      onFocus={item.to === '/articles' ? prefetchArticles : undefined}
                      className={footerLinkClass}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Legal" className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 sm:mb-3">Legal</p>
              <ul className="space-y-1 text-sm flex flex-col items-center sm:items-start">
                {legalNavItems.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onMouseEnter={() => prefetchLegalPage(item.slug)}
                      onFocus={() => prefetchLegalPage(item.slug)}
                      className={footerLinkClass}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {hasContact || socials.length > 0 ? (
            <div className="min-w-0 col-span-full lg:col-span-1 text-center sm:text-left">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2 sm:mb-3">Contact</p>
              <div className="space-y-2 text-sm text-slate-600 break-words">
                {company?.fullAddress?.trim() ? <p className="leading-relaxed">{company.fullAddress}</p> : null}
                {company?.email?.trim() ? (
                  <p className="min-w-0">
                    <a href={`mailto:${company.email}`} className={footerContactLinkClass}>
                      {company.email}
                    </a>
                  </p>
                ) : null}
                {company?.phone?.trim() ? (
                  <p>
                    <a href={`tel:${company.phone.replace(/\s/g, '')}`} className={footerLinkClass}>
                      {company.phone}
                    </a>
                  </p>
                ) : null}
                {company?.website?.trim() ? (
                  <p className="min-w-0">
                    <a
                      href={formatWebsiteHref(company.website)}
                      className={footerContactLinkClass}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {company.website.replace(/^https?:\/\//i, '')}
                    </a>
                  </p>
                ) : null}
              </div>
              {socials.length > 0 ? (
                <SocialIconLinks
                  className="flex flex-wrap justify-center sm:justify-start gap-2 mt-4 max-w-full"
                  entries={socials as [string, string][]}
                  linkClassName="inline-flex items-center justify-center w-11 h-11 sm:w-9 sm:h-9 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-primary transition-colors shrink-0"
                  iconClassName="w-4 h-4"
                />
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col items-center gap-4 text-center text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:text-left">
          <p className="max-w-full break-words text-pretty">
            {copyrightName ? `© ${year} ${copyrightName}. All rights reserved.` : `© ${year}. All rights reserved.`}
          </p>
          {!isLoggedIn ? (
            <Link
              to="/login"
              className="inline-flex items-center justify-center min-h-11 min-w-[44px] px-3 -mx-1 text-slate-400 hover:text-slate-600 transition-colors sm:px-1 sm:mx-0"
            >
              Admin
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </footer>
  );
}
