import { usePageContent } from '@/hooks/usePageContent';
import { useServices } from '@/hooks/useServices';
import { parseSection } from '@/lib/content';
import type { CtaContent, HeroContent, Testimonial } from '@/lib/pageContent';
import { PageHero } from '@/components/public/PageHero';
import { getPageHeaderUrl } from '@/lib/pageHeader';
import { useCompany } from '@/contexts/CompanyContext';
import { CtaBanner } from '@/components/public/CtaBanner';
import { companyAssetUrl } from '@/lib/utils';
import { ServicesCarousel } from '@/components/public/ServicesCarousel';
import { TestimonialCard } from '@/components/public/TestimonialCard';
import { HowItWorks } from '@/components/sections/HowItWorks';

export function ServicesPage() {
  const company = useCompany();
  const sections = usePageContent('services');
  const homeSections = usePageContent('home');
  const { services, ready } = useServices();

  const hero = parseSection<HeroContent>(sections, 'hero', {});
  const cta = parseSection<CtaContent>(sections, 'cta', { headline: '', subtext: '', buttonText: '', buttonLink: '/contact' });
  const testimonials = parseSection<{ items: Testimonial[] }>(homeSections, 'testimonials', { items: [] });
  const heroBg = sections.find((s) => s.page === 'services' && s.sectionKey === 'hero_bg');
  const headerUrl = companyAssetUrl(getPageHeaderUrl('services', sections, company), heroBg?.updatedAt ?? company?.updatedAt);

  return (
    <>
      <PageHero headline={hero.headline} subtext={hero.subtext} imageUrl={headerUrl} />

      <section className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4">
          {!ready ? (
            <div className="grid gap-8 md:grid-cols-2" aria-hidden>
              {[0, 1].map((i) => (
                <div key={i} className="border rounded-xl overflow-hidden bg-white shadow-sm animate-pulse">
                  <div className="h-52 bg-slate-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-slate-200 rounded w-2/3" />
                    <div className="h-4 bg-slate-100 rounded w-full" />
                    <div className="h-4 bg-slate-100 rounded w-5/6" />
                    <div className="h-9 bg-slate-200 rounded w-28 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : services.length > 0 ? (
            <ServicesCarousel services={services} />
          ) : (
            <p className="text-slate-400 text-center text-sm">Services coming soon.</p>
          )}
        </div>
      </section>

      <HowItWorks />

      {testimonials.items.length > 0 && (
        <section className="border-t border-gray-200 bg-slate-50 py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-10">What Our Clients Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.items.map((t) => (
                <TestimonialCard key={`${t.name}-${t.quote}`} testimonial={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      {cta.headline && <CtaBanner cta={cta} />}
    </>
  );
}
