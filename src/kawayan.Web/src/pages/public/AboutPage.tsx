import { useCompany } from '@/contexts/CompanyContext';
import { usePageContent } from '@/hooks/usePageContent';
import { parseSection } from '@/lib/content';
import type { HeroContent, IconCard, TeamMember } from '@/lib/pageContent';
import { useMissionVision } from '@/hooks/useMissionVision';
import { PageHero } from '@/components/public/PageHero';
import { MissionVision as MissionVisionBlock } from '@/components/public/MissionVision';
import { Linkedin } from 'lucide-react';
import { InitialsAvatar } from '@/components/public/InitialsAvatar';
import { initialsFromName } from '@/lib/sectionDefaults';
import { getPageHeaderUrl } from '@/lib/pageHeader';
import { companyAssetUrl, publicAssetUrl } from '@/lib/utils';

export function AboutPage() {
  const company = useCompany();
  const sections = usePageContent('about');
  const missionVision = useMissionVision();

  const hero = parseSection<HeroContent>(sections, 'hero', {});
  const story = parseSection<{ paragraphs: string[] }>(sections, 'story', { paragraphs: [] });
  const values = parseSection<{ cards: IconCard[] }>(sections, 'values', { cards: [] });
  const team = parseSection<{ members: TeamMember[] }>(sections, 'team', { members: [] });
  const teamMembers = [...team.members].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name),
  );

  return (
    <>
      <PageHero
        imageUrl={companyAssetUrl(getPageHeaderUrl('about', sections, company), company?.updatedAt)}
        headline={hero.headline}
        subtext={hero.subtext}
      />

      {(story.paragraphs.length > 0 || company?.aboutImageUrl) && (
        <section className="py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4 grid gap-10 lg:grid-cols-2 items-start">
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <h2 className="text-2xl font-bold text-slate-900">Our Story</h2>
              {story.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {story.paragraphs.length === 0 && company?.fullDescription && <p>{company.fullDescription}</p>}
            </div>
            {company?.aboutImageUrl && (
              <img
                src={companyAssetUrl(company.aboutImageUrl, company.updatedAt)}
                alt=""
                className="rounded-xl w-full object-cover max-h-[420px]"
              />
            )}
          </div>
        </section>
      )}

      <MissionVisionBlock data={missionVision} large />

      {values.cards.length > 0 && (
        <section className="py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-10">Core Values</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.cards.map((v) => (
                <article key={v.title} className="border rounded-xl p-5 text-center">
                  <span className="text-3xl mb-3 block">{v.icon}</span>
                  <h3 className="font-semibold mb-2">{v.title}</h3>
                  <p className="text-gray-700 text-sm">{v.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {teamMembers.length > 0 && (
        <section className="bg-tint py-16 lg:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-10">Meet the Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((m) => {
                const linkedin = m.linkedinUrl?.trim();
                const linkedinHref =
                  linkedin && !/^https?:\/\//i.test(linkedin) ? `https://${linkedin}` : linkedin;
                return (
                  <article key={m.name} className="bg-white rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
                    {m.profileImageUrl ? (
                      <img
                        src={publicAssetUrl(m.profileImageUrl)}
                        alt=""
                        className="h-20 w-20 rounded-full object-cover shrink-0"
                        decoding="async"
                      />
                    ) : (
                      <InitialsAvatar initials={m.initials || initialsFromName(m.name)} />
                    )}
                    <h3 className="font-semibold mt-4">{m.name}</h3>
                    <p className="text-primary text-sm mb-3">{m.role}</p>
                    {m.bio ? <p className="text-gray-700 text-sm mb-3">{m.bio}</p> : null}
                    {linkedinHref ? (
                      <a
                        href={linkedinHref}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary mt-auto min-h-[36px]"
                        aria-label={`${m.name} on LinkedIn`}
                      >
                        <Linkedin size={16} aria-hidden />
                        LinkedIn
                      </a>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
