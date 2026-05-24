import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Building2,
  ChevronDown,
  FileText,
  Home,
  Image,
  Inbox,
  LogOut,
  Mail,
  Newspaper,
  Scale,
  UserCircle,
  Wrench,
} from "lucide-react";
import { logout } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { useCompany } from "@/contexts/CompanyContext";
import { AdminErrorBoundary } from "@/components/AdminErrorBoundary";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { companyNameInitials } from "@/lib/companyNameValidation";
import { companyAssetUrl } from "@/lib/utils";
import { pageManagerCards } from "@/lib/sectionDefaults";

type NavChild = { to: string; label: string; icon?: ReactNode };
type NavItem =
  | { to: string; label: string; icon: ReactNode; children?: never }
  | { label: string; icon: ReactNode; children: NavChild[]; to?: never };

type NavGroup = { label: string; items: NavItem[] };

const pageChildIcons: Record<string, ReactNode> = {
  home: <Home size={15} />,
  about: <UserCircle size={15} />,
  services: <Wrench size={15} />,
  contact: <Mail size={15} />,
};

const navGroups: NavGroup[] = [
  {
    label: "Content",
    items: [
      {
        label: "Page Manager",
        icon: <FileText size={16} />,
        children: pageManagerCards.map((p) => ({
          to: `/admin/pages/${p.key}`,
          label: p.name,
          icon: pageChildIcons[p.key] ?? <FileText size={15} />,
        })),
      },
      {
        to: "/admin/services",
        label: "Services Manager",
        icon: <Wrench size={16} />,
      },
      {
        to: "/admin/articles",
        label: "Blogs",
        icon: <Newspaper size={16} />,
      },
      { to: "/admin/media", label: "Media Library", icon: <Image size={16} /> },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        to: "/admin/company",
        label: "Company Details",
        icon: <Building2 size={16} />,
      },
      { to: "/admin/messages", label: "Messages", icon: <Inbox size={16} /> },
      { to: "/admin/legal", label: "Legal Pages", icon: <Scale size={16} /> },
    ],
  },
];

const navItems: NavItem[] = navGroups.flatMap((g) => g.items);

function resolvePageTitle(pathname: string): string | undefined {
  if (pathname === "/admin/company/edit") return "Edit Company Details";
  if (pathname === "/admin/services/new") return "Add Service";
  if (/^\/admin\/services\/\d+\/edit$/.test(pathname)) return "Edit Service";
  if (pathname === "/admin/articles/new") return "Add blog post";
  if (/^\/admin\/articles\/\d+\/edit$/.test(pathname)) return "Edit blog post";
  if (/^\/admin\/legal\/\d+$/.test(pathname)) return "Edit Legal Page";
  if (pathname === "/admin/legal") return "Legal Pages";
  return undefined;
}

function isRouteActive(pathname: string, to: string) {
  if (to === "/admin/company")
    return pathname === "/admin/company" || pathname === "/admin/company/edit";
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const company = useCompany();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const displayName = user?.displayName ?? "Admin";
  const companyLabel = company?.nameMain?.trim() || "Your Company";
  const initials =
    companyNameInitials(company?.nameMain) ||
    displayName
      .split(/\s+/)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    "AD";

  const toggleGroup = (label: string) =>
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    for (const item of navItems) {
      if (item.children?.some((c) => isRouteActive(location.pathname, c.to))) {
        setExpandedGroups((prev) => new Set([...prev, item.label]));
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const allLeafRoutes = useMemo(() => {
    const routes: { to: string; label: string }[] = [];
    for (const item of navItems) {
      if (item.children) {
        for (const child of item.children)
          routes.push({ to: child.to, label: child.label });
      } else if (item.to) {
        routes.push({ to: item.to, label: item.label });
      }
    }
    return routes;
  }, []);

  const currentTitle =
    resolvePageTitle(location.pathname) ??
    allLeafRoutes
      .filter((r) => isRouteActive(location.pathname, r.to))
      .sort((a, b) => b.to.length - a.to.length)[0]?.label ??
    companyLabel;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      useAuthStore.getState().clearAuth();
      navigate("/login");
    }
  };

  const linkClass = (isActive: boolean) =>
    `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors border-l-[3px] ${
      isActive
        ? "bg-[var(--admin-sidebar-active-bg)] text-white font-medium border-l-[var(--admin-sidebar-active-border)]"
        : "text-[var(--admin-sidebar-muted)] hover:text-white hover:bg-white/5 border-l-transparent"
    }`;

  const childLinkClass = (isActive: boolean) =>
    `flex items-center gap-3 pl-11 pr-4 py-2 text-sm transition-colors border-l-[3px] ${
      isActive
        ? "bg-[var(--admin-sidebar-active-bg)] text-white font-medium border-l-[var(--admin-sidebar-active-border)]"
        : "text-[var(--admin-sidebar-muted)] hover:text-white hover:bg-white/5 border-l-transparent"
    }`;

  return (
    <div className="flex h-screen max-h-[100dvh] overflow-hidden bg-gray-100">
      <header className="md:hidden fixed top-0 inset-x-0 z-30 h-14 bg-[var(--admin-sidebar-bg)] text-white flex items-center px-3 gap-3 shadow-sm border-b border-[var(--admin-sidebar-border)]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="p-2 -ml-1 rounded-lg hover:bg-white/10 active:bg-white/20"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {company?.logoUrl ? (
            <img
              src={companyAssetUrl(company.logoUrl, company.updatedAt)}
              alt=""
              className="w-7 h-7 rounded-md object-contain bg-white/5 shrink-0"
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
              style={{ backgroundColor: "var(--brand)" }}
            >
              {initials}
            </div>
          )}
          <span className="font-semibold text-sm truncate">{currentTitle}</span>
        </div>
      </header>

      {open && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px]"
        />
      )}

      <aside
        className={`fixed md:relative inset-y-0 left-0 z-50 flex h-full w-64 md:w-60 shrink-0 flex-col bg-[var(--admin-sidebar-bg)] text-white transition-transform duration-200 ease-out md:translate-x-0 border-r border-[var(--admin-sidebar-border)] ${
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-[var(--admin-sidebar-border)] flex items-center gap-2 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={() => setOpen(false)}
          >
            {company?.logoUrl ? (
              <img
                src={companyAssetUrl(company.logoUrl, company.updatedAt)}
                alt=""
                className="w-9 h-9 rounded-md object-contain bg-white/5 shrink-0"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: "var(--brand)" }}
              >
                {initials}
              </div>
            )}
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="font-semibold text-sm truncate">{companyLabel}</span>
              {company?.nameBaybayin?.trim() ? (
                <span
                  className="font-medium text-[10px] leading-tight tracking-tight truncate mt-0.5"
                  style={{ fontFamily: "'Noto Sans Tagalog', system-ui, sans-serif" }}
                >
                  {company.nameBaybayin.trim()}
                </span>
              ) : null}
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="md:hidden p-1.5 -mr-1 rounded-lg text-[var(--admin-sidebar-muted)] hover:text-white hover:bg-white/10"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto min-h-0">
          {navGroups.map((group, gi) => (
            <div key={group.label}>
              {group.label !== "General" && (
                <p
                  className={`px-4 pb-1 text-[10px] uppercase tracking-widest font-semibold text-[var(--admin-sidebar-section)] ${
                    gi === 0 ? "pt-2" : "pt-4"
                  }`}
                >
                  {group.label}
                </p>
              )}
              {group.items.map((item) => {
                if (item.children) {
                  const isGroupActive = item.children.some((c) =>
                    isRouteActive(location.pathname, c.to),
                  );
                  const isExpanded = expandedGroups.has(item.label);
                  return (
                    <div key={item.label}>
                      <button
                        type="button"
                        onClick={() => toggleGroup(item.label)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                          isGroupActive
                            ? "text-white font-medium hover:bg-white/5"
                            : "text-[var(--admin-sidebar-muted)] hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <span className="w-5 flex items-center justify-center shrink-0">
                          {item.icon}
                        </span>
                        <span className="truncate flex-1 text-left">
                          {item.label}
                        </span>
                        <ChevronDown
                          size={14}
                          className={`shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                      <div
                        className="admin-nav-collapse-grid"
                        data-open={isExpanded ? 'true' : 'false'}
                      >
                        <div className="min-h-0 overflow-hidden">
                          {item.children.map((child) => (
                            <NavLink
                              key={child.to}
                              to={child.to}
                              onClick={() => setOpen(false)}
                              className={({ isActive }) =>
                                childLinkClass(isActive)
                              }
                            >
                              <span className="w-4 shrink-0 flex items-center justify-center opacity-70">
                                {child.icon}
                              </span>
                              <span className="truncate">{child.label}</span>
                            </NavLink>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <NavLink
                    key={item.to}
                    to={item.to!}
                    end={item.to === "/admin"}
                    onClick={() => setOpen(false)}
                    className={() =>
                      linkClass(isRouteActive(location.pathname, item.to!))
                    }
                  >
                    <span className="w-5 flex items-center justify-center shrink-0">
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--admin-sidebar-border)] shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: "var(--brand)" }}
            >
              {displayName
                .split(/\s+/)
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "?"}
            </div>
            <span className="text-sm text-[var(--admin-sidebar-muted)] truncate flex-1">
              {displayName}
            </span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-[var(--admin-sidebar-muted)] hover:text-white transition-colors w-full rounded-lg px-2 py-1.5 hover:bg-white/5 mb-2"
          >
            <LogOut size={13} />
            Sign out
          </button>
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors"
          >
            <span className="flex items-center gap-2 text-xs text-[var(--admin-sidebar-muted)] hover:text-white">
              <Home size={13} />
              View live website
            </span>
          </Link>
        </div>
      </aside>

      <main className="flex flex-1 flex-col min-w-0 min-h-0 pt-14 md:pt-0">
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 md:p-6 touch-scroll">
          <AdminErrorBoundary>
            <Outlet />
          </AdminErrorBoundary>
        </div>
      </main>
      <ScrollToTopButton />
    </div>
  );
}
