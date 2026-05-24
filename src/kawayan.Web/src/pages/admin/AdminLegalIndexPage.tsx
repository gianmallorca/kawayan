import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Scale } from 'lucide-react';
import { fetchAdminLegalPages } from '@/api/legal';
import {
  AdminEmptyState,
  AdminFormCard,
  AdminFormLayout,
  AdminPageHeader,
} from '@/components/admin/AdminForm';
import type { LegalPageAdmin } from '@/api/legal';

function formatDate(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString();
}

const slugPaths: Record<string, string> = {
  'privacy-policy': '/privacy-policy',
  terms: '/terms',
  'cookie-policy': '/cookie-policy',
};

export function AdminLegalIndexPage() {
  const [pages, setPages] = useState<LegalPageAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminLegalPages()
      .then(setPages)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminFormLayout>
      <AdminPageHeader
        title="Legal Pages"
        subtitle="Edit privacy policy, terms of service, and cookie policy. Use {{company_name}} in the body to insert your company name on the public site."
      />
      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : pages.length === 0 ? (
        <AdminEmptyState
          icon={Scale}
          title="No legal pages yet"
          description="Run database deploy or restart the API with seeding enabled."
        />
      ) : (
        <AdminFormCard>
          <ul className="divide-y divide-gray-100">
            {pages.map((page) => (
              <li key={page.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-4 first:pt-0 last:pb-0">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{page.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Revised {formatDate(page.lastRevised)} ·{' '}
                    {page.isPublished ? (
                      <span className="text-emerald-700">Published</span>
                    ) : (
                      <span className="text-slate-500">Draft</span>
                    )}
                  </p>
                  {slugPaths[page.slug] ? (
                    <a
                      href={slugPaths[page.slug]}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                    >
                      View public page
                    </a>
                  ) : null}
                </div>
                <Link
                  to={`/admin/legal/${page.id}`}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 shrink-0"
                >
                  <Pencil size={15} aria-hidden />
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        </AdminFormCard>
      )}
    </AdminFormLayout>
  );
}
