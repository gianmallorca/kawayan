import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Building2, Clock, FileText, Image, LayoutGrid, Plus, Upload } from 'lucide-react';
import { AdminFormLayout, AdminPageHeader } from '@/components/admin/AdminForm';
import { fetchAllContent } from '@/api/content';
import { fetchMedia } from '@/api/media';
import { fetchAdminServices } from '@/api/services';
import { useAuthStore } from '@/store/authStore';
import type { PageSection } from '@/types';

const MANAGED_PAGES = 4;

function formatRelative(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [serviceCount, setServiceCount] = useState(0);
  const [mediaCount, setMediaCount] = useState(0);

  useEffect(() => {
    fetchAllContent().then(setSections).catch(() => setSections([]));
    fetchAdminServices({ page: 1, pageSize: 1 })
      .then((s) => setServiceCount(s.totalCount))
      .catch(() => setServiceCount(0));
    fetchMedia({ page: 1, pageSize: 1 })
      .then((m) => setMediaCount(m.totalCount))
      .catch(() => setMediaCount(0));
  }, []);

  const lastUpdated = useMemo(() => {
    if (!sections.length) return null;
    const latest = sections.reduce((a, s) => (new Date(s.updatedAt) > new Date(a.updatedAt) ? s : a));
    return formatRelative(new Date(latest.updatedAt));
  }, [sections]);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Admin';

  const stats = [
    { label: 'Active services', value: serviceCount, icon: Briefcase },
    { label: 'Pages managed', value: MANAGED_PAGES, icon: FileText },
    { label: 'Media files', value: mediaCount, icon: Image },
    { label: 'Last updated', value: lastUpdated ?? '—', icon: Clock, isText: true },
  ];

  return (
    <AdminFormLayout wide>
      <AdminPageHeader
        icon={LayoutGrid}
        title="Management"
        subtitle={`Welcome back, ${displayName}. Here is an overview of your site content.`}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, isText }) => (
          <div key={label} className="admin-card flex items-start gap-3">
            <div className="rounded-lg bg-brand-muted p-2 text-brand">
              <Icon size={20} />
            </div>
            <div>
              <p className={`font-semibold text-gray-900 ${isText ? 'text-lg' : 'text-2xl'}`}>{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-4">Quick actions</h2>
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
          <Link to="/admin/company" className="admin-btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2">
            <Building2 size={16} aria-hidden />
            Edit company details
          </Link>
          <Link to="/admin/services/new" className="admin-btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2">
            <Plus size={16} aria-hidden />
            Add new service
          </Link>
          <Link to="/admin/media" className="admin-btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2">
            <Upload size={16} aria-hidden />
            Upload media
          </Link>
          <Link to="/admin/pages/home" className="admin-btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2">
            <FileText size={16} aria-hidden />
            Edit home page
          </Link>
        </div>
      </div>
    </AdminFormLayout>
  );
}
