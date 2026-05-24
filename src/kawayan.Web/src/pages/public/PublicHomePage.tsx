import { useCompany } from '@/contexts/CompanyContext';
import { usePageContent } from '@/hooks/usePageContent';
import { parseSection } from '@/lib/content';
import type { CtaContent, HeroContent, IconCard, StatItem, Testimonial } from '@/lib/pageContent';
import { useMissionVision } from '@/hooks/useMissionVision';
import { PageHero } from '@/components/public/PageHero';
import { MissionVision as MissionVisionBlock } from '@/components/public/MissionVision';
import { CtaBanner } from '@/components/public/CtaBanner';
import { HomeArticlesSection } from '@/components/public/HomeArticlesSection';
import { TestimonialCard } from '@/components/public/TestimonialCard';
import { getPageHeaderUrl } from '@/lib/pageHeader';
import { companyAssetUrl } from '@/lib/utils';

export function PublicHomePage() {
  const company = useCompany();
  const sections = usePageContent('home');
  const missionVision = useMissionVision();

  const hero = parseSection<HeroContent>(sections, 'hero', {});
  const whyChooseUs = parseSection<{ cards: IconCard[] }>(sections, 'whyChooseUs', { cards: [] });
  const stats = parseSection<{ items: StatItem[] }>(sections, 'stats', { items: [] });
  const testimonials = parseSection<{ items: Testimonial[] }>(sections, 'testimonials', { items: [] });
  const cta = parseSection<CtaContent>(sections, 'cta', { headline: '', subtext: '', buttonText: '', buttonLink: '/contact' });

  return (
    <>
      <PageHero
        imageUrl={companyAssetUrl(getPageHeaderUrl('home', sections, company), company?.updatedAt)}
        headline={company?.tagline}
        subtext={hero.subtext ?? company?.shortDescription}
        hero={hero}
        tall
      />

      {whyChooseUs.cards.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-10 text-slate-900">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {whyChooseUs.cards.map((card) => (
                <article key={card.title} className="text-center p-4 md:p-6 border rounded-xl">
                  <span className="text-4xl mb-4 block">{card.icon}</span>
                  <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <HomeArticlesSection />

      <MissionVisionBlock data={missionVision} />

      {stats.items.length > 0 && (
        <section className="bg-primary text-white py-16">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {stats.items.map((s) => (
              <div key={s.label}>
                <p className="text-3xl sm:text-4xl font-bold mb-1">{s.value}</p>
                <p className="text-sm text-white/80">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {testimonials.items.length > 0 && (
        <section className="py-16 lg:py-20">
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
