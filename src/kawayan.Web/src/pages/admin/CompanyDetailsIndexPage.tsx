import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { fetchAdminCompany } from '@/api/company';
import { CompanyMap, MapPlaceholder } from '@/components/CompanyMap';
import {
  AdminEmptyState,
  AdminFormGrid,
  AdminFormLayout,
  AdminSectionDivider,
} from '@/components/admin/AdminForm';
import { CompanyName } from '@/components/CompanyName';
import { companyAssetUrl } from '@/lib/utils';
import type { CompanyDetails } from '@/types';

function formatAddress(c: CompanyDetails) {
  return [c.street, c.barangay, c.city, c.province, c.region, c.country, c.postalCode]
    .filter((v) => v?.trim())
    .join(', ');
}

function DetailField({ label, value }: { label: string; value?: string | null }) {
  const text = value?.trim();
  return (
    <div>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`text-sm mt-0.5 break-words ${text ? 'text-gray-900' : 'text-gray-400 italic'}`}>
        {text || 'Not set'}
      </p>
    </div>
  );
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-4 sm:px-6">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {description ? <p className="text-sm text-gray-500 mt-1">{description}</p> : null}
      </div>
      <div className="p-5 sm:p-6 space-y-4">{children}</div>
    </section>
  );
}

function hasCompanySetup(c: CompanyDetails | null) {
  if (!c) return false;
  return Boolean(c.nameMain?.trim() || c.nameBaybayin?.trim());
}

export function CompanyDetailsIndexPage() {
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminCompany()
      .then(setCompany)
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminFormLayout wide>
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">Loading…</div>
      </AdminFormLayout>
    );
  }

  if (!hasCompanySetup(company)) {
    return (
      <AdminFormLayout wide>
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Company Details</h1>
            <p className="text-sm text-gray-500 mt-1">Set up your company profile for the public website.</p>
          </div>
        </header>
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <AdminEmptyState
            title="No company details yet"
            description="Add your company name, contact information, and branding to get started."
            action={
              <Link to="/admin/company/edit" className="admin-btn-primary">
                Add company details
              </Link>
            }
          />
        </div>
      </AdminFormLayout>
    );
  }

  const c = company!;
  const address = formatAddress(c);
  const lat = c.latitude != null ? Number(c.latitude) : null;
  const lng = c.longitude != null ? Number(c.longitude) : null;
  const hasCoordinates =
    lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng) && (lat !== 0 || lng !== 0);

  return (
    <AdminFormLayout wide>
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <CompanyName nameMain={c.nameMain} nameBaybayin={c.nameBaybayin} className="text-xl sm:text-2xl" />
        <Link to="/admin/company/edit" className="admin-btn-primary inline-flex items-center justify-center gap-2 shrink-0">
          <Pencil size={16} aria-hidden />
          Edit
        </Link>
      </header>

      <div className="space-y-6">
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            {c.logoUrl ? (
              <img
                src={companyAssetUrl(c.logoUrl, c.updatedAt)}
                alt=""
                className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-lg border border-gray-200 bg-gray-50 shrink-0"
              />
            ) : (
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg border border-dashed border-gray-200 bg-gray-50 shrink-0" />
            )}
            <div className="min-w-0 space-y-2">
              {c.tagline?.trim() && <p className="text-sm text-gray-600">{c.tagline}</p>}
              <AdminFormGrid className="max-w-md">
                <DetailField label="Brand color" value={c.primaryColor} />
                {c.establishedYear ? (
                  <DetailField label="Year established" value={String(c.establishedYear)} />
                ) : null}
              </AdminFormGrid>
            </div>
          </div>
        </section>

        <SectionCard title="About" description="How your company is described on the website.">
          <DetailField label="Short description" value={c.shortDescription} />
          <DetailField label="Full description" value={c.fullDescription} />
        </SectionCard>

        <SectionCard title="Contact" description="How customers can reach you.">
          <AdminFormGrid>
            <DetailField label="Email" value={c.email} />
            <DetailField label="Phone" value={c.phone} />
            <DetailField label="Website" value={c.website} />
          </AdminFormGrid>
          <AdminSectionDivider label="Social links" />
          <AdminFormGrid>
            <DetailField label="Facebook" value={c.socialLinks?.facebook} />
            <DetailField label="Instagram" value={c.socialLinks?.instagram} />
            <DetailField label="LinkedIn" value={c.socialLinks?.linkedin} />
          </AdminFormGrid>
        </SectionCard>

        <SectionCard title="Location" description="Address and map shown on the contact page.">
          <DetailField label="Full address" value={address || c.fullAddress} />
          <AdminFormGrid>
            <DetailField label="Street / purok" value={c.street} />
            <DetailField label="Barangay" value={c.barangay} />
            <DetailField label="City" value={c.city} />
            <DetailField label="Province" value={c.province} />
            <DetailField label="Region" value={c.region} />
            <DetailField label="Country" value={c.country} />
            <DetailField label="Postal code" value={c.postalCode} />
          </AdminFormGrid>
          {(hasCoordinates || address) && (
            <div className="pt-2">
              <p className="text-xs font-medium text-gray-500 mb-2">Map</p>
              <div className="w-full h-[220px] sm:h-[280px] rounded-lg overflow-hidden border border-gray-200">
                {hasCoordinates ? (
                  <CompanyMap latitude={lat!} longitude={lng!} label={address || c.fullAddress} />
                ) : (
                  <MapPlaceholder address={address || c.fullAddress} />
                )}
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </AdminFormLayout>
  );
}
