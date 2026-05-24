import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { ChevronDown, Inbox, type LucideIcon } from 'lucide-react';

export function AdminFormLayout({
  children,
  wide = false,
  fluid = false,
}: {
  children: ReactNode;
  wide?: boolean;
  fluid?: boolean;
}) {
  const maxWidth = fluid ? 'max-w-6xl' : wide ? 'max-w-3xl' : 'max-w-2xl';
  return (
    <div className="w-full flex flex-col items-center">
      <div className={`w-full ${maxWidth} space-y-6`}>{children}</div>
    </div>
  );
}

export function AdminFormGrid({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${className}`}>{children}</div>;
}

export function AdminFormGridFull({ children }: { children: ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>;
}

export function AdminFormCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-8 space-y-8 ${className}`}
    >
      {children}
    </div>
  );
}

export function AdminPageHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
      <div className="flex gap-3 min-w-0">
        {Icon ? (
          <div
            className="shrink-0 w-10 h-10 rounded-lg bg-brand-muted flex items-center justify-center text-brand"
            aria-hidden
          >
            <Icon size={20} strokeWidth={2} />
          </div>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {subtitle ? <p className="text-sm text-gray-500 mt-1">{subtitle}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0 w-full sm:w-auto">{action}</div> : null}
    </div>
  );
}

export function AdminPageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <AdminPageHeader title={title} subtitle={subtitle} />;
}

export function AdminIndexHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return <AdminPageHeader icon={icon} title={title} subtitle={subtitle} action={action} />;
}

export function AdminSectionTitle({ icon: Icon, children }: { icon?: LucideIcon; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-4">
      {Icon ? <Icon size={16} className="text-brand shrink-0" aria-hidden /> : null}
      {children}
    </h2>
  );
}

export function AdminFormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4 border-t border-gray-100 pt-6 first:border-t-0 first:pt-0">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-400">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function AdminSectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">{label}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

export function AdminFormField({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputClass =
  'w-full min-h-[44px] h-11 px-3 rounded-lg border border-gray-200 bg-white text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] focus:border-[var(--color-primary)] transition-colors';
const inputErrorClass =
  'border-red-400 focus:ring-red-100 focus:border-red-400';

export const AdminInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { error?: boolean }
>(function AdminInput({ error, className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`${inputClass} ${error ? inputErrorClass : ''} ${className}`}
      {...props}
    />
  );
});

export function AdminTextarea({
  error,
  className = '',
  rows = 4,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      rows={rows}
      className={`w-full min-h-[7rem] px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-base text-gray-900 placeholder:text-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] focus:border-[var(--color-primary)] transition-colors ${error ? inputErrorClass : ''} ${className}`}
      {...props}
    />
  );
}

export function AdminSelect({
  error,
  children,
  className = '',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <div className="relative">
      <select
        className={`${inputClass} appearance-none pr-10 ${error ? inputErrorClass : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}

export function AdminFormActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-gray-100 [&>button]:w-full sm:[&>button]:w-auto [&>a]:w-full sm:[&>a]:w-auto">
      {children}
    </div>
  );
}

export function AdminEmptyState({
  icon: Icon = Inbox,
  title = 'No items yet',
  description = 'Add your first item to get started.',
  action,
}: {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 gap-3 text-center min-h-[200px]">
      <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
        <Icon className="w-7 h-7 text-gray-300" strokeWidth={1.5} aria-hidden />
      </div>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="text-sm text-gray-500 max-w-sm">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
