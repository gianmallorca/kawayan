import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, Inbox, Search, Trash2 } from 'lucide-react';
import { deleteInquiry, fetchInquiries, markInquiryRead } from '@/api/inquiries';
import { AdminEmptyState, AdminFormCard, AdminFormLayout, AdminPageHeader } from '@/components/admin/AdminForm';
import { TableCardPagination } from '@/components/ui/Pagination';
import { INQUIRY_SUBJECTS } from '@/lib/inquirySubjects';
import type { Inquiry } from '@/types';

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function MessagesIndexPage() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    setLoading(true);
    return fetchInquiries({
      page,
      pageSize,
      search: debouncedSearch || undefined,
      subject: subjectFilter || undefined,
    })
      .then((data) => {
        setItems(data.items);
        setTotalCount(data.totalCount);
        setTotalPages(data.totalPages);
      })
      .catch(() => {
        setItems([]);
        setTotalCount(0);
        setTotalPages(0);
      })
      .finally(() => setLoading(false));
  }, [page, pageSize, debouncedSearch, subjectFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleExpand = async (item: Inquiry) => {
    const opening = expandedId !== item.id;
    setExpandedId(opening ? item.id : null);
    if (opening && !item.isRead) {
      try {
        const updated = await markInquiryRead(item.id);
        setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      } catch {
        /* keep expanded */
      }
    }
  };

  const handleDelete = (item: Inquiry) => {
    if (!window.confirm(`Delete message from "${item.senderName}"? This cannot be undone.`)) return;
    deleteInquiry(item.id).then(load);
  };

  const hasFilters = Boolean(debouncedSearch || subjectFilter);

  return (
    <AdminFormLayout fluid>
      <AdminPageHeader
        title="Messages"
        subtitle="Inquiries submitted from your website contact form."
      />

      <AdminFormCard className="!p-0 overflow-hidden">
        <div className="border-b border-gray-100 px-4 py-3 sm:px-6 flex flex-col sm:flex-row gap-3">
          <label className="relative block flex-1 min-w-0">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
            <input
              type="search"
              placeholder="Search name, email, phone, subject, message…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input !pl-9"
            />
          </label>
          <label className="block sm:w-52 shrink-0">
            <span className="sr-only">Filter by subject</span>
            <select
              value={subjectFilter}
              onChange={(e) => {
                setSubjectFilter(e.target.value);
                setPage(1);
              }}
              className="admin-input"
            >
              <option value="">All subjects</option>
              {INQUIRY_SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <p className="p-10 text-sm text-gray-500 text-center">Loading…</p>
        ) : items.length === 0 && totalCount === 0 ? (
          <AdminEmptyState
            icon={Inbox}
            title={hasFilters ? 'No matching messages' : 'No messages yet'}
            description={
              hasFilters
                ? 'Try a different search or subject filter.'
                : 'When visitors submit the contact form, their messages will appear here.'
            }
          />
        ) : (
          <>
            <ul className="divide-y divide-gray-100">
              {items.map((item) => {
                const isOpen = expandedId === item.id;
                return (
                  <li key={item.id} className={item.isRead ? 'bg-white' : 'bg-brand-muted/30'}>
                    <button
                      type="button"
                      className="w-full text-left px-5 sm:px-6 py-4 flex items-start gap-3 hover:bg-gray-50/80 transition-colors"
                      onClick={() => toggleExpand(item)}
                      aria-expanded={isOpen}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${item.isRead ? 'bg-gray-300' : 'bg-brand'}`}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1 grid gap-1 sm:grid-cols-[1fr_1fr_auto] sm:gap-4 sm:items-center">
                        <span className={item.isRead ? 'text-sm text-gray-900' : 'text-sm font-semibold text-gray-900'}>
                          {item.senderName}
                        </span>
                        <span className="text-sm text-gray-500 truncate">{item.senderEmail}</span>
                        <span className="text-xs text-gray-400 sm:text-right">{formatWhen(item.createdAt)}</span>
                      </span>
                      <span className="hidden sm:block text-sm text-gray-600 truncate max-w-[200px]">{item.subject}</span>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </button>

                    <div
                      className="page-manager-collapse-grid border-t border-gray-100"
                      data-open={isOpen ? 'true' : 'false'}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="px-5 sm:px-6 pb-5 pt-2 space-y-4 bg-gray-50/40">
                          <div className="grid sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-xs font-medium text-gray-500">Email</p>
                              <p className="text-gray-900 mt-0.5">{item.senderEmail}</p>
                            </div>
                            {item.phone?.trim() ? (
                              <div>
                                <p className="text-xs font-medium text-gray-500">Phone</p>
                                <p className="text-gray-900 mt-0.5">{item.phone}</p>
                              </div>
                            ) : null}
                            <div className="sm:col-span-2">
                              <p className="text-xs font-medium text-gray-500">Subject</p>
                              <p className="text-gray-900 mt-0.5">{item.subject}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 mb-1">Message</p>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed rounded-lg border border-gray-200 bg-white p-4">
                              {item.message}
                            </p>
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                              aria-label={`Delete message from ${item.senderName}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item);
                              }}
                            >
                              <Trash2 size={16} aria-hidden />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <TableCardPagination
              page={page}
              totalPages={totalPages}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
            />
          </>
        )}
      </AdminFormCard>
    </AdminFormLayout>
  );
}
