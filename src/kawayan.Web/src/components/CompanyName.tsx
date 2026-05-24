import type { CompanyDetails } from '@/types';

type CompanyNameProps = {
  nameMain?: string;
  nameBaybayin?: string;
  className?: string;
  /** Smaller Baybayin line so it matches Latin visually (default true). */
  compactBaybayin?: boolean;
};

export function CompanyName({
  nameMain,
  nameBaybayin,
  className,
  compactBaybayin = true,
}: CompanyNameProps) {
  if (!nameMain?.trim() && !nameBaybayin?.trim()) return null;

  const cn = ['company-name', compactBaybayin && 'company-name--compact-bb', className]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={cn}>
      {nameMain?.trim() ? <span className="company-name__main">{nameMain}</span> : null}
      {nameBaybayin?.trim() ? <span className="company-name__baybayin">{nameBaybayin}</span> : null}
    </span>
  );
}

export function CompanyNameFromDetails({ company, className }: { company?: CompanyDetails | null; className?: string }) {
  if (!company) return null;
  return <CompanyName nameMain={company.nameMain} nameBaybayin={company.nameBaybayin} className={className} />;
}
