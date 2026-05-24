import type { ReactNode } from 'react';

export function PageManagerPageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="space-y-1">
      <h1 className="text-xl font-semibold text-gray-900 tracking-tight">{title}</h1>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </header>
  );
}

export function PageManagerBlock({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {description ? <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p> : null}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}
