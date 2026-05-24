import { useMemo, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange?: (size: number) => void;
  showPageSize?: boolean;
  variant?: 'standalone' | 'footer';
  className?: string;
  siblings?: number;
  compactOnMobile?: boolean;
  pageSizeOptions?: number[];
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

type PageToken = number | 'ellipsis';

function buildPageList(current: number, total: number, siblings: number): PageToken[] {
  if (total <= 0) return [];
  const totalShown = siblings * 2 + 5;
  if (total <= totalShown) return range(1, total);

  const leftSibling = Math.max(current - siblings, 2);
  const rightSibling = Math.min(current + siblings, total - 1);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;

  if (!showLeftDots && showRightDots) return [...range(1, 3 + siblings * 2), 'ellipsis', total];
  if (showLeftDots && !showRightDots) return [1, 'ellipsis', ...range(total - (2 + siblings * 2), total)];
  return [1, 'ellipsis', ...range(leftSibling, rightSibling), 'ellipsis', total];
}

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const fab =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[color:var(--brand)] shadow-[var(--pagination-fab-shadow)] transition hover:shadow-[var(--pagination-fab-shadow-hover)] active:bg-[color:var(--pagination-hover-bg)] touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pagination-ring)] disabled:cursor-not-allowed disabled:opacity-[0.38] disabled:shadow-none md:h-9 md:w-9';

const pillShell =
  'inline-flex max-w-[min(100%,16rem)] flex-wrap items-center justify-center gap-0.5 overflow-x-auto rounded-full border border-[color:var(--pagination-pill-border)] bg-[color:var(--pagination-pill-bg)] px-1.5 py-1 shadow-[var(--pagination-pill-shadow)] [-webkit-overflow-scrolling:touch] md:max-w-full md:gap-1 md:px-2.5 md:py-1.5';

const pageBtn =
  'flex h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors touch-manipulation md:h-8 md:min-w-8';

function PagePills({
  pages,
  page,
  onPageChange,
}: {
  pages: PageToken[];
  page: number;
  onPageChange: (p: number) => void;
}) {
  return (
    <div className={pillShell} role="group" aria-label="Page numbers">
      {pages.map((token, i) =>
        token === 'ellipsis' ? (
          <span
            key={`dots-${i}`}
            className="flex h-11 min-w-[1.25rem] shrink-0 items-center justify-center px-0.5 text-sm text-[color:var(--pagination-muted)] select-none md:h-8"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={token}
            type="button"
            className={cn(
              pageBtn,
              token === page
                ? 'pointer-events-none bg-[var(--brand)] text-white shadow-[0_1px_3px_rgba(5,22,16,0.18)]'
                : 'text-[color:var(--pagination-text)] hover:bg-[color:var(--pagination-hover-bg)] active:bg-[color:var(--pagination-active-ghost)]',
            )}
            aria-label={token === page ? `Page ${token}, current` : `Page ${token}`}
            aria-current={token === page ? 'page' : undefined}
            onClick={() => token !== page && onPageChange(token)}
          >
            {token}
          </button>
        ),
      )}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  showPageSize = true,
  variant = 'standalone',
  className,
  siblings = 1,
  compactOnMobile = true,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationProps) {
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);
  const pages = useMemo(() => buildPageList(page, totalPages, siblings), [page, totalPages, siblings]);

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between md:gap-5',
        variant === 'standalone' && 'border-t border-[color:var(--pagination-border)] pt-4 sm:pt-5',
        variant === 'footer' && 'px-0 py-0',
        className,
      )}
    >
      <p className="order-1 min-w-0 text-center text-xs text-[color:var(--pagination-text)] sm:text-sm md:flex-1 md:text-left">
        <span className="sm:hidden">
          {totalCount === 0 ? (
            'No items'
          ) : (
            <>
              <span className="font-medium text-gray-900">{start}</span>
              {'-'}
              <span className="font-medium text-gray-900">{end}</span>
              {' of '}
              <span className="font-medium text-gray-900">{totalCount}</span>
            </>
          )}
        </span>
        <span className="hidden sm:inline">
          Showing <span className="font-medium text-gray-900">{start}</span>
          {'-'}
          <span className="font-medium text-gray-900">{end}</span> of{' '}
          <span className="font-medium text-gray-900">{totalCount}</span> items
        </span>
      </p>

      {showPageSize && onPageSizeChange ? (
        <div className="order-2 flex w-full min-w-0 shrink-0 md:order-2 md:w-auto">
          <label className="flex w-full min-h-[48px] items-center justify-between gap-3 rounded-lg border border-[color:var(--pagination-border)] bg-white px-3 py-2 sm:min-h-0 sm:w-auto sm:justify-start sm:gap-2 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
            <span className="text-sm text-[color:var(--pagination-text)]">Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="min-h-[44px] min-w-[4.5rem] rounded-lg border border-[color:var(--pagination-border)] bg-white px-3 py-2 text-base text-gray-900 touch-manipulation focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-[color:var(--pagination-ring)] sm:min-h-0 sm:px-2 sm:py-1.5 sm:text-sm"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {compactOnMobile ? (
        <nav
          className="order-3 flex w-full min-w-0 items-center justify-center gap-3 md:hidden"
          aria-label="Page navigation"
        >
          <button
            type="button"
            className={fab}
            aria-label="Previous page"
            disabled={page <= 1 || totalPages === 0}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft />
          </button>
          <p className="min-w-[7.5rem] shrink-0 text-center text-sm font-medium tabular-nums text-gray-900" aria-live="polite">
            {totalPages === 0 ? (
              <span className="text-[color:var(--pagination-muted)]">No pages</span>
            ) : (
              <>
                Page {page} of {totalPages}
              </>
            )}
          </p>
          <button
            type="button"
            className={fab}
            aria-label="Next page"
            disabled={totalPages === 0 || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight />
          </button>
        </nav>
      ) : null}

      <nav
        className={cn(
          'order-3 flex w-full min-w-0 max-w-full items-center justify-center gap-2 sm:gap-3 md:w-auto md:justify-end',
          compactOnMobile && 'hidden md:flex',
        )}
        aria-label={compactOnMobile ? 'Page navigation (desktop)' : 'Page navigation'}
      >
        <button
          type="button"
          className={fab}
          aria-label="Previous page"
          disabled={page <= 1 || totalPages === 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
        </button>
        <PagePills pages={pages} page={page} onPageChange={onPageChange} />
        <button
          type="button"
          className={fab}
          aria-label="Next page"
          disabled={totalPages === 0 || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight />
        </button>
      </nav>
    </div>
  );
}

export interface TableCardPaginationProps extends Omit<PaginationProps, 'variant'> {
  footerExtra?: ReactNode;
  className?: string;
}

export function TableCardPagination({ footerExtra, className, ...pager }: TableCardPaginationProps) {
  return (
    <div
      className={cn(
        'min-w-0 overflow-hidden border-t border-[color:var(--pagination-border)] bg-[var(--admin-card-bg)] pt-4 sm:pt-5',
        className,
      )}
    >
      {footerExtra != null ? (
        <div className="border-b border-[color:var(--pagination-border)] px-3 pb-2.5 text-sm sm:px-4">
          {footerExtra}
        </div>
      ) : null}
      <div className="min-w-0 px-3 pb-3 sm:px-4 sm:pb-4">
        <Pagination {...pager} variant="footer" />
      </div>
    </div>
  );
}
