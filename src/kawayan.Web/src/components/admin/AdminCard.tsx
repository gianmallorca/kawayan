import type { ReactNode } from 'react';

export function AdminCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`admin-card ${className}`}>{children}</div>;
}

export function AdminPageHeader({ title, breadcrumb }: { title: string; breadcrumb?: string }) {
  return (
    <div className="mb-6">
      {breadcrumb && <p className="text-sm text-gray-400 mb-1">{breadcrumb}</p>}
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
    </div>
  );
}
