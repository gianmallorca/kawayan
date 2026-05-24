import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchServices } from '@/api/services';
import { publicAssetUrl } from '@/lib/utils';
import type { ServiceItem } from '@/types';

type Props = {
  headline: string;
  onChange: (data: { headline: string }) => void;
};

export function FeaturedProductsEditor({ headline, onChange }: Props) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchServices()
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [load]);

  const featured = services.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Section heading</label>
        <p className="text-xs text-gray-500">Shown above the cards on the home page.</p>
        <input
          className="admin-input"
          value={headline}
          onChange={(e) => onChange({ headline: e.target.value })}
          placeholder="Our Products"
        />
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-gray-900">Cards shown on the home page</p>
          <Link to="/admin/services" className="text-sm font-medium text-brand hover:underline">
            Manage in Services →
          </Link>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          The first four services appear here. Photos, titles, and descriptions come from Services Manager.
        </p>

        {loading ? (
          <p className="text-sm text-gray-500 py-2">Loading services…</p>
        ) : featured.length === 0 ? (
          <p className="text-sm text-gray-500 py-2">No services yet. Add services to populate this section.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {featured.map((s, i) => (
              <div key={s.id} className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3">
                <span className="text-xs font-medium text-gray-400 shrink-0 w-4 pt-0.5">{i + 1}</span>
                {s.imageUrl ? (
                  <img
                    src={publicAssetUrl(s.imageUrl)}
                    alt=""
                    className="h-16 w-20 rounded object-cover border border-gray-100 shrink-0"
                  />
                ) : (
                  <div className="h-16 w-20 rounded bg-gray-100 border border-gray-100 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{s.title}</p>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{s.description || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
