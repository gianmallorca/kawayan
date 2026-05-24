import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { Link } from 'react-router-dom';

import { Newspaper, Pencil, Plus, Trash2 } from 'lucide-react';

import { invalidateArticlesCache } from '@/lib/articlesCache';

import { deleteArticle, fetchAdminArticles } from '@/api/articles';

import {

  AdminEmptyState,

  AdminFormCard,

  AdminFormLayout,

  AdminPageHeader,

} from '@/components/admin/AdminForm';

import { TableCardPagination } from '@/components/ui/Pagination';

import type { ArticleAdmin } from '@/types';



function IconActionButton({

  to,

  label,

  variant,

  onClick,

  children,

}: {

  to?: string;

  label: string;

  variant: 'secondary' | 'danger';

  onClick?: () => void;

  children: ReactNode;

}) {

  const className = `inline-flex items-center justify-center h-9 w-9 rounded-lg border transition-colors ${

    variant === 'danger'

      ? 'border-red-200 text-red-600 hover:bg-red-50'

      : 'border-gray-200 text-gray-600 hover:bg-gray-50'

  }`;



  if (to) {

    return (

      <Link to={to} className={className} aria-label={label}>

        {children}

      </Link>

    );

  }



  return (

    <button type="button" className={className} aria-label={label} onClick={onClick}>

      {children}

    </button>

  );

}



function StatusBadge({ published }: { published: boolean }) {

  return (

    <span

      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${

        published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'

      }`}

    >

      {published ? 'Published' : 'Draft'}

    </span>

  );

}



function formatDate(iso?: string | null) {

  if (!iso) return '—';

  return new Date(iso).toLocaleDateString();

}



export function AdminArticlesIndexPage() {

  const [items, setItems] = useState<ArticleAdmin[]>([]);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(10);

  const [totalCount, setTotalCount] = useState(0);

  const [totalPages, setTotalPages] = useState(0);



  const load = useCallback(() => {

    setLoading(true);

    return fetchAdminArticles({ page, pageSize })

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

  }, [page, pageSize]);



  useEffect(() => {

    load();

  }, [load]);



  const handleDelete = (a: ArticleAdmin) => {

    if (!window.confirm(`Delete "${a.title}"? This cannot be undone.`)) return;

    deleteArticle(a.id).then(() => {

      invalidateArticlesCache();

      load();

    });

  };



  return (

    <AdminFormLayout fluid>

      <AdminPageHeader

        icon={Newspaper}

        title="Blogs"

        subtitle="Manage blog posts shown on the home page and blogs listing."

        action={

          <Link to="/admin/articles/new" className="admin-btn-primary inline-flex items-center justify-center gap-2">

            <Plus size={16} aria-hidden />

            Add blog post

          </Link>

        }

      />



      <AdminFormCard className="!p-0 overflow-hidden">

        {loading ? (

          <p className="p-10 text-sm text-gray-500 text-center">Loading…</p>

        ) : items.length === 0 && totalCount === 0 ? (

          <AdminEmptyState

            title="No blog posts yet"

            description="Publish your first blog post to show it on the home page."

            action={

              <Link to="/admin/articles/new" className="admin-btn-primary inline-flex items-center gap-2">

                <Plus size={16} aria-hidden />

                Add blog post

              </Link>

            }

          />

        ) : (

          <>

            <div className="hidden md:block overflow-x-auto">

              <table className="w-full text-sm">

                <thead>

                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">

                    <th className="px-6 py-4">Title</th>

                    <th className="px-6 py-4">Status</th>

                    <th className="px-6 py-4">Published</th>

                    <th className="px-6 py-4 text-right">

                      <span className="sr-only">Actions</span>

                    </th>

                  </tr>

                </thead>

                <tbody>

                  {items.map((a) => (

                    <tr key={a.id} className="border-b border-gray-100 hover:bg-gray-50/60">

                      <td className="px-6 py-5 font-medium text-gray-900">{a.title}</td>

                      <td className="px-6 py-5">

                        <StatusBadge published={a.isPublished} />

                      </td>

                      <td className="px-6 py-5 text-gray-600">{formatDate(a.publishedAt)}</td>

                      <td className="px-6 py-5">

                        <div className="flex justify-end gap-2">

                          <IconActionButton to={`/admin/articles/${a.id}/edit`} label={`Edit ${a.title}`} variant="secondary">

                            <Pencil size={16} aria-hidden />

                          </IconActionButton>

                          <IconActionButton label={`Delete ${a.title}`} variant="danger" onClick={() => handleDelete(a)}>

                            <Trash2 size={16} aria-hidden />

                          </IconActionButton>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            <div className="md:hidden divide-y divide-gray-100">
              {items.map((a) => (
                <div key={a.id} className="p-5 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-gray-900">{a.title}</p>
                      <StatusBadge published={a.isPublished} />
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(a.publishedAt)}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <IconActionButton to={`/admin/articles/${a.id}/edit`} label={`Edit ${a.title}`} variant="secondary">
                      <Pencil size={16} aria-hidden />
                    </IconActionButton>
                    <IconActionButton label={`Delete ${a.title}`} variant="danger" onClick={() => handleDelete(a)}>
                      <Trash2 size={16} aria-hidden />
                    </IconActionButton>
                  </div>
                </div>
              ))}
            </div>

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



