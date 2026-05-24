import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2 } from 'lucide-react';
import { fetchAdminCompany, geocodePreview, updateCompany } from '@/api/company';
import { uploadLogo } from '@/api/uploads';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { LocationMapPicker } from '@/components/admin/LocationMapPicker';
import { AdminFormStepper } from '@/components/admin/AdminFormStepper';
import {
  AdminFormCard,
  AdminFormField,
  AdminFormGrid,
  AdminFormLayout,
  AdminPageHeader,
  AdminFormSection,
  AdminInput,
  AdminSectionDivider,
  AdminTextarea,
} from '@/components/admin/AdminForm';
import { useToast } from '@/contexts/ToastContext';
import { useRefreshCompany } from '@/contexts/CompanyContext';
import { CompanyName } from '@/components/CompanyName';
import { hasBaybayinChars, isValidLatinName } from '@/lib/companyNameValidation';
import { MAX_IMAGE_UPLOAD_MB } from '@/lib/uploadLimits';
import type { CompanyDetails } from '@/types';

const ADDRESS_KEYS = ['street', 'barangay', 'city', 'province', 'region', 'country', 'postalCode'] as const;

const WIZARD_STEPS = [
  { label: 'Branding' },
  { label: 'About' },
  { label: 'Contact' },
  { label: 'Location' },
  { label: 'Review' },
] as const;

const REVIEW_SECTIONS = [
  { step: 0, title: 'Branding' },
  { step: 1, title: 'About' },
  { step: 2, title: 'Contact' },
  { step: 3, title: 'Location' },
] as const;

function formatAddress(form: CompanyDetails) {
  return [form.street, form.barangay, form.city, form.province, form.region, form.country, form.postalCode]
    .filter((v) => v?.trim())
    .join(', ');
}

function validateStep(step: number, form: CompanyDetails): Record<string, string> {
  const errors: Record<string, string> = {};
  if (step === 0) {
    if (!form.nameMain.trim()) errors.nameMain = 'English company name is required.';
    else if (!isValidLatinName(form.nameMain)) {
      errors.nameMain = 'Use Latin letters, numbers, and common punctuation. No Baybayin characters.';
    }
    if (!form.nameBaybayin.trim()) errors.nameBaybayin = 'Baybayin company name is required.';
  }
  if (step === 2) {
    if (!form.email.trim()) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
  }
  return errors;
}

function ReviewRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(8rem,10rem)_1fr] gap-1 sm:gap-4 py-2 border-b border-gray-50 last:border-0">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-900 break-words">{value || '—'}</span>
    </div>
  );
}

export function CompanyDetailsEditPage() {
  const navigate = useNavigate();
  const refreshCompany = useRefreshCompany();
  const { showToast } = useToast();
  const [form, setForm] = useState<CompanyDetails | null>(null);
  const [step, setStep] = useState(0);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [stepVisible, setStepVisible] = useState(true);
  const [mapLocationPinned, setMapLocationPinned] = useState(false);
  const [mapCenterHint, setMapCenterHint] = useState<[number, number] | null>(null);
  const [saving, setSaving] = useState(false);

  const lastStep = WIZARD_STEPS.length - 1;

  useEffect(() => {
    fetchAdminCompany().then(setForm).catch(() => null);
  }, []);

  useEffect(() => {
    if (!form) return;
    const hasPin =
      form.latitude != null &&
      form.longitude != null &&
      (form.latitude !== 0 || form.longitude !== 0);
    if (hasPin) {
      setMapCenterHint([form.latitude!, form.longitude!]);
      return;
    }
    const hasAddress = [form.street, form.barangay, form.city, form.province, form.country].some((v) =>
      v?.trim(),
    );
    if (!hasAddress) {
      setMapCenterHint(null);
      return;
    }
    let cancelled = false;
    geocodePreview({
      street: form.street,
      barangay: form.barangay,
      city: form.city,
      province: form.province,
      region: form.region,
      country: form.country,
      postalCode: form.postalCode,
    })
      .then((coords) => {
        if (!cancelled) setMapCenterHint([coords.latitude, coords.longitude]);
      })
      .catch(() => {
        if (!cancelled) setMapCenterHint(null);
      });
    return () => {
      cancelled = true;
    };
  }, [
    form?.street,
    form?.barangay,
    form?.city,
    form?.province,
    form?.region,
    form?.country,
    form?.postalCode,
    form?.latitude,
    form?.longitude,
  ]);

  const set = useCallback((key: keyof CompanyDetails, value: string | number | Record<string, string> | null) => {
    setForm((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [key]: value };
      if (ADDRESS_KEYS.includes(key as (typeof ADDRESS_KEYS)[number])) {
        setMapLocationPinned(false);
      }
      return next;
    });
    setStepErrors((prev) => {
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  }, []);

  const handleMapPick = useCallback((lat: number, lng: number) => {
    setForm((prev) => (prev ? { ...prev, latitude: lat, longitude: lng } : prev));
    setMapLocationPinned(true);
  }, []);

  const goToStep = (next: number) => {
    setStepVisible(false);
    window.setTimeout(() => {
      setStep(next);
      setStepErrors({});
      setStepVisible(true);
    }, 150);
  };

  const next = () => {
    if (!form) return;
    const errors = validateStep(step, form);
    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return;
    }
    if (step < lastStep) goToStep(step + 1);
  };

  const back = () => {
    if (step > 0) goToStep(step - 1);
  };

  const save = async () => {
    if (!form) return;
    const errors = { ...validateStep(0, form), ...validateStep(2, form) };
    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      const firstInvalid = errors.nameMain || errors.nameBaybayin ? 0 : 2;
      goToStep(firstInvalid);
      showToast('Please fix the highlighted fields before saving.', 'error');
      return;
    }
    if (!form.nameMain.trim() || !form.nameBaybayin.trim()) {
      showToast('English and Baybayin company names are required.', 'error');
      return;
    }
    if (!isValidLatinName(form.nameMain)) {
      showToast('Company name (English) has invalid characters.', 'error');
      return;
    }
    setSaving(true);
    try {
      const result = await updateCompany({ ...form, mapLocationPinned });
      setForm(result.company);
      setMapLocationPinned(false);
      await refreshCompany(true);
      if (result.geocodeWarning) showToast(result.geocodeWarning, 'error');
      else showToast('Company details saved');
      navigate('/admin/company');
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <p className="text-slate-500">Loading…</p>;

  const nameBaybayinWarn =
    form.nameBaybayin.trim() && !hasBaybayinChars(form.nameBaybayin)
      ? 'No Baybayin characters detected (Unicode U+1700–U+171F).'
      : '';

  const addressLine = formatAddress(form);

  return (
    <AdminFormLayout wide>
      <div className="mb-2">
        <Link
          to="/admin/company"
          className="text-sm text-gray-500 hover:text-gray-600 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Company Details
        </Link>
      </div>
      <AdminPageHeader
        icon={Building2}
        title="Edit company details"
        subtitle="Update your company name, contact details, and colors step by step."
      />
      <AdminFormCard>
        <AdminFormStepper steps={[...WIZARD_STEPS]} currentIndex={step} />

        <div
          className={`min-h-[280px] transition-opacity duration-200 ease-out ${stepVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          {step === 0 && (
            <AdminFormSection title="Branding" description="Logo, company name, and colors visitors see first.">
              <ImageUploader
                label="Company logo"
                hint={`Shown in the website header and admin sidebar. PNG with transparent background works best. Max ${MAX_IMAGE_UPLOAD_MB}MB.`}
                aspectRatio="square"
                maxSizeMB={MAX_IMAGE_UPLOAD_MB}
                currentUrl={form.logoUrl}
                onUpload={async (file) => {
                  const url = await uploadLogo(file);
                  setForm({ ...form, logoUrl: url });
                  await refreshCompany(true);
                }}
              />
              <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Company name</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AdminFormField
                    label="Company name (English)"
                    required
                    hint="Latin letters, numbers, and punctuation such as . , & ( ) — not Baybayin."
                    error={stepErrors.nameMain}
                  >
                    <AdminInput
                      value={form.nameMain}
                      onChange={(e) => set('nameMain', e.target.value)}
                      error={!!stepErrors.nameMain}
                    />
                  </AdminFormField>
                  <AdminFormField
                    label="Company name (Baybayin)"
                    required
                    hint="Use a Baybayin keyboard or input method."
                    error={stepErrors.nameBaybayin}
                  >
                    <AdminInput
                      value={form.nameBaybayin}
                      onChange={(e) => set('nameBaybayin', e.target.value)}
                      error={!!stepErrors.nameBaybayin}
                    />
                    {nameBaybayinWarn && !stepErrors.nameBaybayin && (
                      <p className="text-xs text-amber-600 mt-1">{nameBaybayinWarn}</p>
                    )}
                  </AdminFormField>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-xs text-gray-500 mb-2">Preview</p>
                  <CompanyName
                    nameMain={form.nameMain}
                    nameBaybayin={form.nameBaybayin}
                    className="text-lg"
                  />
                </div>
              </div>
              <AdminFormGrid>
                <AdminFormField label="Tagline">
                  <AdminInput value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
                </AdminFormField>
                <AdminFormField label="Brand color">
                  <AdminInput
                    type="color"
                    value={form.primaryColor}
                    onChange={(e) => set('primaryColor', e.target.value)}
                  />
                </AdminFormField>
              </AdminFormGrid>
            </AdminFormSection>
          )}

          {step === 1 && (
            <AdminFormSection title="About" description="Descriptions used on your public pages.">
              <AdminFormField label="Short description">
                <AdminTextarea
                  value={form.shortDescription}
                  onChange={(e) => set('shortDescription', e.target.value)}
                />
              </AdminFormField>
              <AdminFormField label="Full description">
                <AdminTextarea
                  rows={6}
                  value={form.fullDescription}
                  onChange={(e) => set('fullDescription', e.target.value)}
                />
              </AdminFormField>
            </AdminFormSection>
          )}

          {step === 2 && (
            <AdminFormSection title="Contact" description="How customers can reach you.">
              <AdminFormGrid>
                <AdminFormField label="Email" required error={stepErrors.email}>
                  <AdminInput
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    error={!!stepErrors.email}
                  />
                </AdminFormField>
                <AdminFormField label="Phone">
                  <AdminInput value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                </AdminFormField>
              </AdminFormGrid>
              <AdminFormField label="Website">
                <AdminInput value={form.website} onChange={(e) => set('website', e.target.value)} />
              </AdminFormField>
              <AdminFormField label="Year established">
                <AdminInput
                  type="number"
                  value={String(form.establishedYear ?? '')}
                  onChange={(e) => set('establishedYear', e.target.value ? Number(e.target.value) : 0)}
                />
              </AdminFormField>
              <AdminSectionDivider label="Social links" />
              <AdminFormField label="Facebook page">
                <AdminInput
                  value={form.socialLinks?.facebook ?? ''}
                  onChange={(e) => set('socialLinks', { ...form.socialLinks, facebook: e.target.value })}
                />
              </AdminFormField>
              <AdminFormField label="Instagram">
                <AdminInput
                  value={form.socialLinks?.instagram ?? ''}
                  onChange={(e) => set('socialLinks', { ...form.socialLinks, instagram: e.target.value })}
                />
              </AdminFormField>
              <AdminFormField label="LinkedIn">
                <AdminInput
                  value={form.socialLinks?.linkedin ?? ''}
                  onChange={(e) => set('socialLinks', { ...form.socialLinks, linkedin: e.target.value })}
                />
              </AdminFormField>
            </AdminFormSection>
          )}

          {step === 3 && (
            <AdminFormSection title="Business address" description="Used on the contact page and for map location.">
              <AdminFormField label="Street / purok" hint="Optional. Filled automatically when you set a point on the map.">
                <AdminInput value={form.street} onChange={(e) => set('street', e.target.value)} />
              </AdminFormField>
              <AdminFormField label="Barangay">
                <AdminInput value={form.barangay} onChange={(e) => set('barangay', e.target.value)} />
              </AdminFormField>
              <AdminFormGrid>
                <AdminFormField label="City">
                  <AdminInput value={form.city} onChange={(e) => set('city', e.target.value)} />
                </AdminFormField>
                <AdminFormField label="Province">
                  <AdminInput value={form.province} onChange={(e) => set('province', e.target.value)} />
                </AdminFormField>
                <AdminFormField label="Region">
                  <AdminInput value={form.region} onChange={(e) => set('region', e.target.value)} />
                </AdminFormField>
                <AdminFormField label="Country">
                  <AdminInput value={form.country} onChange={(e) => set('country', e.target.value)} />
                </AdminFormField>
              </AdminFormGrid>
              <AdminFormField label="Postal code">
                <AdminInput value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} />
              </AdminFormField>
              <AdminSectionDivider label="Map location" />
              <p className="text-xs text-gray-400 -mt-2">
                Click the map or drag the pin to set coordinates. Saving typed address alone will re-geocode to match
                the address fields.
              </p>
              <div className="w-full h-[280px] rounded-lg overflow-hidden border border-gray-200">
                <LocationMapPicker
                  latitude={form.latitude}
                  longitude={form.longitude}
                  centerHint={mapCenterHint}
                  onPick={handleMapPick}
                />
              </div>
              <AdminFormGrid>
                <AdminFormField label="Latitude">
                  <AdminInput
                    value={form.latitude != null ? String(form.latitude) : ''}
                    onChange={(e) => {
                      setMapLocationPinned(true);
                      set('latitude', e.target.value === '' ? null : Number(e.target.value));
                    }}
                  />
                </AdminFormField>
                <AdminFormField label="Longitude">
                  <AdminInput
                    value={form.longitude != null ? String(form.longitude) : ''}
                    onChange={(e) => {
                      setMapLocationPinned(true);
                      set('longitude', e.target.value === '' ? null : Number(e.target.value));
                    }}
                  />
                </AdminFormField>
              </AdminFormGrid>
            </AdminFormSection>
          )}

          {step === 4 && (
            <AdminFormSection title="Review" description="Confirm everything looks correct before saving.">
              <div className="space-y-6">
                {REVIEW_SECTIONS.map(({ step: sectionStep, title }) => (
                  <section key={title} className="rounded-lg border border-gray-100 bg-gray-50/40 p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                      <button
                        type="button"
                        className="text-xs font-medium text-brand hover:underline"
                        onClick={() => goToStep(sectionStep)}
                      >
                        Edit
                      </button>
                    </div>
                    {sectionStep === 0 && (
                      <dl className="space-y-0">
                        <ReviewRow
                          label="Company name"
                          value={
                            <CompanyName nameMain={form.nameMain} nameBaybayin={form.nameBaybayin} className="text-base" />
                          }
                        />
                        <ReviewRow label="Tagline" value={form.tagline} />
                        <ReviewRow
                          label="Brand color"
                          value={
                            <span className="inline-flex items-center gap-2">
                              <span
                                className="inline-block h-5 w-5 rounded border border-gray-200"
                                style={{ backgroundColor: form.primaryColor }}
                              />
                              {form.primaryColor}
                            </span>
                          }
                        />
                        <ReviewRow label="Logo" value={form.logoUrl ? 'Uploaded' : 'None'} />
                      </dl>
                    )}
                    {sectionStep === 1 && (
                      <dl className="space-y-0">
                        <ReviewRow label="Short description" value={form.shortDescription} />
                        <ReviewRow label="Full description" value={form.fullDescription} />
                      </dl>
                    )}
                    {sectionStep === 2 && (
                      <dl className="space-y-0">
                        <ReviewRow label="Email" value={form.email} />
                        <ReviewRow label="Phone" value={form.phone} />
                        <ReviewRow label="Website" value={form.website} />
                        <ReviewRow
                          label="Year established"
                          value={form.establishedYear ? String(form.establishedYear) : ''}
                        />
                        <ReviewRow label="Facebook" value={form.socialLinks?.facebook} />
                        <ReviewRow label="Instagram" value={form.socialLinks?.instagram} />
                        <ReviewRow label="LinkedIn" value={form.socialLinks?.linkedin} />
                      </dl>
                    )}
                    {sectionStep === 3 && (
                      <dl className="space-y-0">
                        <ReviewRow label="Address" value={addressLine} />
                        <ReviewRow
                          label="Coordinates"
                          value={
                            form.latitude != null && form.longitude != null
                              ? `${form.latitude}, ${form.longitude}`
                              : ''
                          }
                        />
                      </dl>
                    )}
                  </section>
                ))}
              </div>
            </AdminFormSection>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 mt-6 border-t border-gray-100">
          <div className="sm:flex-1">
            {step > 0 ? (
              <button type="button" className="admin-btn-secondary w-full sm:w-auto" onClick={back}>
                Back
              </button>
            ) : (
              <Link to="/admin/company" className="admin-btn-secondary w-full sm:w-auto inline-flex items-center justify-center">
                Cancel
              </Link>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-end">
            {step < lastStep ? (
              <button type="button" className="admin-btn-primary w-full sm:w-auto" onClick={next}>
                Continue
              </button>
            ) : (
              <button
                type="button"
                className="admin-btn-primary w-full sm:w-auto"
                onClick={save}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save company details'}
              </button>
            )}
          </div>
        </div>
      </AdminFormCard>
    </AdminFormLayout>
  );
}
