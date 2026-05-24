import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export function AdminFloatingBar() {
  const location = useLocation();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  const isAuthenticated = Boolean(accessToken && user);
  const isPublicSite =
    !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/login');

  if (!isAuthenticated || !isPublicSite) return null;

  return (
    <div
      className="fixed bottom-3 right-3 z-[60] flex items-center gap-1.5 bg-[var(--admin-sidebar-bg)] text-white text-[10px] font-medium px-2.5 py-1 rounded-full shadow-md border border-[var(--admin-sidebar-border)] mr-[max(0.25rem,env(safe-area-inset-right))] mb-[max(0.25rem,env(safe-area-inset-bottom))]"
      role="navigation"
      aria-label="Admin quick access"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" aria-hidden />
      <span className="text-white/70">Admin</span>
      <span className="text-white/20 text-[9px]" aria-hidden>
        |
      </span>
      <Link
        to="/admin"
        className="inline-flex items-center gap-0.5 text-white hover:text-brand active:opacity-80 transition-colors pl-0.5 pr-1 py-0.5 min-h-[32px] min-w-[32px] justify-center"
      >
        <span>Management</span>
        <ChevronRight className="w-3 h-3 opacity-80 shrink-0" aria-hidden />
      </Link>
    </div>
  );
}
