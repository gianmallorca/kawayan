import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { deleteService, fetchAdminServices } from "@/api/services";
import {
  AdminEmptyState,
  AdminFormCard,
  AdminFormLayout,
  AdminPageHeader,
} from "@/components/admin/AdminForm";
import { TableCardPagination } from "@/components/ui/Pagination";
import { invalidateServicesCache } from "@/lib/servicesCache";
import { publicAssetUrl } from "@/lib/utils";
import type { ServiceItem } from "@/types";

function IconActionButton({
  to,
  label,
  variant,
  onClick,
  children,
}: {
  to?: string;
  label: string;
  variant: "secondary" | "danger";
  onClick?: () => void;
  children: ReactNode;
}) {
  const className = `inline-flex shrink-0 items-center justify-center size-9 min-h-0 p-0 rounded-lg border transition-colors ${
    variant === "danger"
      ? "border-red-200 text-red-600 hover:bg-red-50"
      : "border-gray-200 text-gray-600 hover:bg-gray-50"
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

function formatPrice(price?: number | null) {
  return price == null
    ? '—'
    : `₱${Number(price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function AdminServicesIndexPage() {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    setLoading(true);
    invalidateServicesCache();
    return fetchAdminServices({ page, pageSize, search: debouncedSearch || undefined })
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
  }, [page, pageSize, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = (s: ServiceItem) => {
    if (!window.confirm(`Delete "${s.title}"? This cannot be undone.`)) return;
    deleteService(s.id).then(load);
  };

  return (
    <AdminFormLayout fluid>
      <AdminPageHeader
        title="Services"
        subtitle="Manage services shown on the public Services page."
        action={
          <Link to="/admin/services/new" className="admin-btn-primary inline-flex items-center justify-center gap-2">
            <Plus size={16} aria-hidden />
            Add Service
          </Link>
        }
      />

      <AdminFormCard className="!p-0 overflow-hidden">
        <div className="border-b border-gray-100 px-4 py-3 sm:px-6">
          <label className="relative block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
            <input
              type="search"
              placeholder="Search services…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input !pl-9"
            />
          </label>
        </div>
        {loading ? (
          <p className="p-10 text-sm text-gray-500 text-center">Loading…</p>
        ) : items.length === 0 && totalCount === 0 ? (
          <AdminEmptyState
            title={debouncedSearch ? "No matching services" : "No services yet"}
            description={
              debouncedSearch
                ? "Try a different search term."
                : "Add your first service to show on the public Services page."
            }
            action={
              <Link to="/admin/services/new" className="admin-btn-primary inline-flex items-center gap-2">
                <Plus size={16} aria-hidden />
                Add Service
              </Link>
            }
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm table-fixed">
                <colgroup>
                  <col className="w-[140px]" />
                  <col className="w-[22%]" />
                  <col />
                  <col className="w-[120px]" />
                  <col className="w-[100px]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="px-6 py-4">Photo</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4 text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50/60 align-middle">
                      <td className="px-6 py-5">
                        {s.imageUrl ? (
                          <img
                            src={publicAssetUrl(s.imageUrl)}
                            alt=""
                            className="h-20 w-[120px] rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="h-20 w-[120px] rounded-lg border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                            No photo
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 font-medium text-gray-900">{s.title}</td>
                      <td className="px-6 py-5 text-gray-600">
                        <p className="line-clamp-3 leading-relaxed">{s.description || "—"}</p>
                      </td>
                      <td className="px-6 py-5 text-gray-900 font-medium">{formatPrice(s.price)}</td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <IconActionButton to={`/admin/services/${s.id}/edit`} label={`Edit ${s.title}`} variant="secondary">
                            <Pencil size={16} aria-hidden />
                          </IconActionButton>
                          <IconActionButton label={`Delete ${s.title}`} variant="danger" onClick={() => handleDelete(s)}>
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
              {items.map((s) => (
                <div key={s.id} className="p-5 space-y-4">
                  <div className="flex gap-4">
                    {s.imageUrl ? (
                      <img
                        src={publicAssetUrl(s.imageUrl)}
                        alt=""
                        className="h-20 w-28 rounded-lg object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="h-20 w-28 rounded-lg border border-dashed border-gray-200 bg-gray-50 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900">{s.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-3 mt-1 leading-relaxed">{s.description || "—"}</p>
                      <p className="text-sm font-medium text-gray-900 mt-2">{formatPrice(s.price)}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <IconActionButton to={`/admin/services/${s.id}/edit`} label={`Edit ${s.title}`} variant="secondary">
                      <Pencil size={16} aria-hidden />
                    </IconActionButton>
                    <IconActionButton label={`Delete ${s.title}`} variant="danger" onClick={() => handleDelete(s)}>
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
