import { useState } from 'react';
import { MapPin } from 'lucide-react';
import axios from 'axios';
import { submitInquiry } from '@/api/inquiries';
import { CompanyMap, MapPlaceholder } from '@/components/CompanyMap';
import { CompanyNameFromDetails } from '@/components/CompanyName';
import { useCompany } from '@/contexts/CompanyContext';
import { useToast } from '@/contexts/ToastContext';
import { usePageContent } from '@/hooks/usePageContent';
import { parseSection } from '@/lib/content';
import type { ContactDetails, HeroContent } from '@/lib/pageContent';
import { PageHero } from '@/components/public/PageHero';
import { SocialIconLinks } from '@/components/public/SocialIconLinks';
import { getPageHeaderUrl } from '@/lib/pageHeader';

const fieldClass =
  'w-full text-base min-h-[44px] border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] focus:border-[var(--color-primary)] transition-colors';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

export function ContactPage() {
  const company = useCompany();
  const { showToast } = useToast();
  const sections = usePageContent('contact');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const hero = parseSection<HeroContent>(sections, 'hero', {});
  const details = parseSection<ContactDetails>(sections, 'details', { hours: [] });

  const lat = company?.latitude != null ? Number(company.latitude) : null;
  const lng = company?.longitude != null ? Number(company.longitude) : null;
  const hasCoordinates =
    lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng) && (lat !== 0 || lng !== 0);
  const fullAddress = company?.fullAddress ?? '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      await submitInquiry({
        senderName: String(form.get('name') ?? '').trim(),
        senderEmail: String(form.get('email') ?? '').trim(),
        phone: String(form.get('phone') ?? '').trim(),
        subject: String(form.get('subject') ?? '').trim(),
        message: String(form.get('message') ?? '').trim(),
      });
      setSent(true);
      e.currentTarget.reset();
    } catch (err) {
      const msg = axios.isAxiosError(err) ? (err.response?.data as { error?: string })?.error : null;
      showToast(msg ?? 'Could not send your message. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero headline={hero.headline} subtext={hero.subtext} imageUrl={getPageHeaderUrl('contact', sections, company)} />

      <section className="py-12 md:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 grid gap-8 md:gap-12 md:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 md:p-8 space-y-5 order-2 md:order-1"
          >
            <h2 className="text-lg font-semibold text-gray-900">Send us a message</h2>
            <Field label="Full name">
              <input name="name" className={fieldClass} placeholder="Your name" required autoComplete="name" />
            </Field>
            <Field label="Email address">
              <input
                name="email"
                className={fieldClass}
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                inputMode="email"
              />
            </Field>
            <Field label="Phone number">
              <input
                name="phone"
                className={fieldClass}
                placeholder="Optional"
                autoComplete="tel"
                inputMode="tel"
              />
            </Field>
            <Field label="Subject">
              <select name="subject" className={fieldClass} required defaultValue="">
                <option value="" disabled>
                  Select a subject
                </option>
                <option>General Inquiry</option>
                <option>Request a Quote</option>
                <option>Bulk Order</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Message">
              <textarea
                name="message"
                className={`${fieldClass} min-h-[140px] resize-y`}
                placeholder="How can we help?"
                required
              />
            </Field>
            <button
              type="submit"
              disabled={submitting || sent}
              className="btn-primary w-full md:w-auto min-h-[44px] px-6 py-3 rounded-lg font-medium active:opacity-90 disabled:opacity-60"
            >
              {submitting ? 'Sending…' : 'Send message'}
            </button>
            {sent && (
              <p className="text-sm text-green-600 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                Thank you — we will be in touch shortly.
              </p>
            )}
          </form>

          <div className="order-1 md:order-2 space-y-6">
            {(company?.nameMain || company?.nameBaybayin) && (
              <h2 className="text-xl font-semibold text-center md:text-left">
                <CompanyNameFromDetails company={company} />
              </h2>
            )}
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5 text-gray-700 text-sm space-y-2">
              {fullAddress && <p>{fullAddress}</p>}
              {company?.phone && <p>{company.phone}</p>}
              {company?.email && <p>{company.email}</p>}
            </div>
            {details.hours.length > 0 && (
              <div className="rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Business hours</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {details.hours.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
            {company && Object.values(company.socialLinks || {}).some(Boolean) && (
              <SocialIconLinks
                className="flex flex-wrap justify-center md:justify-start gap-2 pt-1"
                entries={Object.entries(company.socialLinks).filter(([, url]) => url?.trim()) as [string, string][]}
                linkClassName="inline-flex items-center justify-center w-11 h-11 rounded-full border border-gray-200 bg-white text-slate-600 hover:bg-gray-50 hover:text-primary transition-colors shrink-0"
              />
            )}
          </div>
        </div>
      </section>

      {(hasCoordinates || fullAddress) && (
        <section className="border-t border-gray-200 bg-tint py-10 md:py-12">
          <div className="max-w-6xl mx-auto px-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand" />
                <h3 className="text-base font-semibold text-gray-800">We&apos;re right here</h3>
              </div>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <p className="text-sm text-gray-500">
              Come visit us or use this as a reference for delivery coordination.
            </p>
            <div className="w-full h-[280px] md:h-[400px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              {hasCoordinates ? (
                <CompanyMap latitude={lat!} longitude={lng!} label={fullAddress} />
              ) : (
                <MapPlaceholder address={fullAddress} />
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
