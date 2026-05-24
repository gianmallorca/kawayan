import { ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';

export function PageSectionAccordion({
  label,
  hint,
  isOpen,
  onToggle,
  children,
  footer,
}: {
  label: string;
  hint?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const panelId = `page-section-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <button
        type="button"
        id={`${panelId}-trigger`}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-gray-50/80 transition-colors"
        onClick={onToggle}
      >
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <ChevronDown
          size={18}
          className={`text-gray-400 shrink-0 transition-transform duration-300 ease-out ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      <div className="page-manager-collapse-grid border-t border-gray-100" data-open={isOpen ? 'true' : 'false'}>
        <div className="min-h-0 overflow-hidden">
          <div
            id={panelId}
            role="region"
            aria-labelledby={`${panelId}-trigger`}
            className="px-4 pb-4 pt-4 space-y-4 bg-gray-50/30"
          >
            {hint ? <p className="text-sm text-gray-500 leading-relaxed">{hint}</p> : null}
            {children}
            {footer ? (
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">{footer}</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
