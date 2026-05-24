import { Button } from '@/components/ui/button';
import { FeaturedProductsEditor } from '@/components/admin/FeaturedProductsEditor';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { PageLinkSelect } from '@/components/admin/PageLinkSelect';
import { uploadMedia } from '@/api/media';
import { MAX_IMAGE_UPLOAD_MB } from '@/lib/uploadLimits';
import { initialsFromName } from '@/lib/sectionDefaults';

type Props = {
  page: string;
  sectionKey: string;
  data: Record<string, unknown>;
  onChange: (data: Record<string, unknown>) => void;
};

const defaultIcons = ['🌿', '🏗️', '🚚', '🌱', '🤝', '⚙️', '🌍'];

export function SectionContentEditor({ page, sectionKey, data, onChange }: Props) {
  const set = (patch: Record<string, unknown>) => onChange({ ...data, ...patch });

  switch (sectionKey) {
    case 'hero':
      return page === 'home' ? <HomeHeroEditor data={data} set={set} /> : <SimpleHeroEditor data={data} set={set} />;
    case 'whyChooseUs':
    case 'values':
      return <IconCardsEditor cards={(data.cards as IconCard[]) ?? []} onChange={(cards) => set({ cards })} />;
    case 'products':
      return (
        <FeaturedProductsEditor
          headline={String(data.headline ?? '')}
          onChange={(patch) => onChange({ headline: patch.headline })}
        />
      );
    case 'missionVision':
      return <MissionVisionEditor data={data} set={set} />;
    case 'stats':
      return <StatsEditor items={(data.items as StatItem[]) ?? []} onChange={(items) => set({ items })} />;
    case 'testimonials':
      return (
        <TestimonialsEditor items={(data.items as TestimonialItem[]) ?? []} onChange={(items) => set({ items })} />
      );
    case 'cta':
      return <CtaEditor data={data} set={set} />;
    case 'story':
      return <StoryEditor paragraphs={(data.paragraphs as string[]) ?? ['']} onChange={(paragraphs) => set({ paragraphs })} />;
    case 'team':
      return <TeamEditor members={(data.members as TeamMember[]) ?? []} onChange={(members) => set({ members })} />;
    case 'details':
      return <HoursEditor hours={(data.hours as string[]) ?? ['']} onChange={(hours) => set({ hours })} />;
    default:
      return null;
  }
}

type IconCard = { icon: string; title: string; body: string };
type StatItem = { value: string; label: string };
type TestimonialItem = { quote: string; name: string; role: string; profileImageUrl?: string; rating?: number | null };
type TeamMember = {
  initials: string;
  name: string;
  role: string;
  bio: string;
  profileImageUrl?: string;
  linkedinUrl?: string;
  displayOrder?: number;
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {children}
    </div>
  );
}

function inputClass() {
  return 'admin-input';
}

function HomeHeroEditor({ data, set }: { data: Record<string, unknown>; set: (p: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
        Your company name and main photo at the top are updated under <strong>Company</strong> in the menu.
      </p>
      <Field label="Message under your company name" hint="A short welcome for visitors.">
        <textarea
          className={`${inputClass()} min-h-[100px]`}
          value={String(data.subtext ?? '')}
          onChange={(e) => set({ subtext: e.target.value })}
        />
      </Field>
      <div className="space-y-4 border-t pt-4">
        <p className="text-sm font-medium text-slate-800">First button</p>
        <Field label="Button words">
          <input className={inputClass()} value={String(data.ctaPrimary ?? '')} onChange={(e) => set({ ctaPrimary: e.target.value })} />
        </Field>
        <Field label="When clicked, go to">
          <PageLinkSelect value={String(data.ctaPrimaryLink ?? '/services')} onChange={(v) => set({ ctaPrimaryLink: v })} />
        </Field>
      </div>
      <div className="space-y-4 border-t pt-4">
        <p className="text-sm font-medium text-slate-800">Second button (optional)</p>
        <Field label="Button words">
          <input className={inputClass()} value={String(data.ctaSecondary ?? '')} onChange={(e) => set({ ctaSecondary: e.target.value })} />
        </Field>
        <Field label="When clicked, go to">
          <PageLinkSelect value={String(data.ctaSecondaryLink ?? '/contact')} onChange={(v) => set({ ctaSecondaryLink: v })} />
        </Field>
      </div>
    </div>
  );
}

function SimpleHeroEditor({ data, set }: { data: Record<string, unknown>; set: (p: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Main heading">
        <input className={inputClass()} value={String(data.headline ?? '')} onChange={(e) => set({ headline: e.target.value })} />
      </Field>
      <Field label="Short description below the heading">
        <textarea
          className={`${inputClass()} min-h-[80px]`}
          value={String(data.subtext ?? '')}
          onChange={(e) => set({ subtext: e.target.value })}
        />
      </Field>
    </div>
  );
}

function MissionVisionEditor({ data, set }: { data: Record<string, unknown>; set: (p: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Our mission" hint="What you do and why it matters.">
        <textarea
          className={`${inputClass()} min-h-[100px]`}
          value={String(data.mission ?? '')}
          onChange={(e) => set({ mission: e.target.value })}
        />
      </Field>
      <Field label="Our vision" hint="Where you want to be in the future.">
        <textarea
          className={`${inputClass()} min-h-[100px]`}
          value={String(data.vision ?? '')}
          onChange={(e) => set({ vision: e.target.value })}
        />
      </Field>
    </div>
  );
}

function CtaEditor({ data, set }: { data: Record<string, unknown>; set: (p: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <Field label="Heading">
        <input className={inputClass()} value={String(data.headline ?? '')} onChange={(e) => set({ headline: e.target.value })} placeholder="Ready to get started?" />
      </Field>
      <Field label="Short message">
        <textarea
          className={`${inputClass()} min-h-[80px]`}
          value={String(data.subtext ?? '')}
          onChange={(e) => set({ subtext: e.target.value })}
        />
      </Field>
      <Field label="Button words">
        <input className={inputClass()} value={String(data.buttonText ?? '')} onChange={(e) => set({ buttonText: e.target.value })} />
      </Field>
      <Field label="When the button is clicked, go to">
        <PageLinkSelect value={String(data.buttonLink ?? '/contact')} onChange={(v) => set({ buttonLink: v })} />
      </Field>
    </div>
  );
}

function IconCardsEditor({ cards, onChange }: { cards: IconCard[]; onChange: (cards: IconCard[]) => void }) {
  const update = (i: number, patch: Partial<IconCard>) => {
    const next = [...cards];
    next[i] = { ...next[i], ...patch, icon: next[i].icon || defaultIcons[i % defaultIcons.length] };
    onChange(next);
  };
  return (
    <ListShell label="Add another point" onAdd={() => onChange([...cards, { icon: defaultIcons[cards.length % defaultIcons.length], title: '', body: '' }])}>
      {cards.map((card, i) => (
        <CardShell key={i} title={`Point ${i + 1}`} onRemove={cards.length > 1 ? () => onChange(cards.filter((_, j) => j !== i)) : undefined}>
          <div className="space-y-3">
            <Field label="Heading">
              <input className={inputClass()} value={card.title} onChange={(e) => update(i, { title: e.target.value })} />
            </Field>
            <Field label="Explanation">
              <textarea className={`${inputClass()} min-h-[72px]`} value={card.body} onChange={(e) => update(i, { body: e.target.value })} />
            </Field>
          </div>
        </CardShell>
      ))}
    </ListShell>
  );
}

function StatsEditor({ items, onChange }: { items: StatItem[]; onChange: (items: StatItem[]) => void }) {
  const update = (i: number, patch: Partial<StatItem>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  return (
    <ListShell label="Add another number" onAdd={() => onChange([...items, { value: '', label: '' }])}>
      {items.map((item, i) => (
        <CardShell key={i} title={`Number ${i + 1}`} onRemove={items.length > 1 ? () => onChange(items.filter((_, j) => j !== i)) : undefined}>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="The number" hint='e.g. "14+" or "500+"'>
              <input className={inputClass()} value={item.value} onChange={(e) => update(i, { value: e.target.value })} />
            </Field>
            <Field label="What it means" hint='e.g. "Years in business"'>
              <input className={inputClass()} value={item.label} onChange={(e) => update(i, { label: e.target.value })} />
            </Field>
          </div>
        </CardShell>
      ))}
    </ListShell>
  );
}

function TestimonialsEditor({ items, onChange }: { items: TestimonialItem[]; onChange: (items: TestimonialItem[]) => void }) {
  const update = (i: number, patch: Partial<TestimonialItem>) => {
    const next = [...items];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  return (
    <ListShell
      label="Add another review"
      onAdd={() => onChange([...items, { quote: '', name: '', role: '', profileImageUrl: '', rating: null }])}
    >
      {items.map((item, i) => (
        <CardShell key={i} title={item.name || `Review ${i + 1}`} onRemove={items.length > 1 ? () => onChange(items.filter((_, j) => j !== i)) : undefined}>
          <div className="space-y-3">
            <ImageUploader
              label="Profile photo"
              hint="Optional. Square photo works best."
              aspectRatio="square"
              maxSizeMB={MAX_IMAGE_UPLOAD_MB}
              currentUrl={item.profileImageUrl || undefined}
              onUpload={async (file) => {
                const media = await uploadMedia(file);
                update(i, { profileImageUrl: media.url });
              }}
            />
            <Field label="What they said">
              <textarea className={`${inputClass()} min-h-[72px]`} value={item.quote} onChange={(e) => update(i, { quote: e.target.value })} />
            </Field>
            <Field label="Customer name">
              <input className={inputClass()} value={item.name} onChange={(e) => update(i, { name: e.target.value })} />
            </Field>
            <Field label="Their job or company">
              <input className={inputClass()} value={item.role} onChange={(e) => update(i, { role: e.target.value })} />
            </Field>
            <Field label="Rating (1–5)" hint="Leave empty to hide stars on the website.">
              <input
                type="number"
                min={1}
                max={5}
                className={inputClass()}
                value={item.rating ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  update(i, { rating: v === '' ? null : Math.min(5, Math.max(1, Number(v))) });
                }}
              />
            </Field>
          </div>
        </CardShell>
      ))}
    </ListShell>
  );
}

function StoryEditor({ paragraphs, onChange }: { paragraphs: string[]; onChange: (p: string[]) => void }) {
  return (
    <ListShell label="Add another paragraph" onAdd={() => onChange([...paragraphs, ''])}>
      {paragraphs.map((p, i) => (
        <CardShell key={i} title={`Part ${i + 1}`} onRemove={paragraphs.length > 1 ? () => onChange(paragraphs.filter((_, j) => j !== i)) : undefined}>
          <textarea
            className={`${inputClass()} min-h-[100px]`}
            value={p}
            placeholder="Write a few sentences…"
            onChange={(e) => {
              const next = [...paragraphs];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
        </CardShell>
      ))}
    </ListShell>
  );
}

function TeamEditor({ members, onChange }: { members: TeamMember[]; onChange: (members: TeamMember[]) => void }) {
  const update = (i: number, patch: Partial<TeamMember>) => {
    const next = [...members];
    const name = patch.name ?? next[i].name;
    next[i] = {
      ...next[i],
      ...patch,
      initials: initialsFromName(name) || next[i].initials,
    };
    onChange(next);
  };
  return (
    <ListShell
      label="Add another person"
      onAdd={() =>
        onChange([
          ...members,
          { initials: '', name: '', role: '', bio: '', profileImageUrl: '', linkedinUrl: '', displayOrder: members.length },
        ])
      }
    >
      {members.map((m, i) => (
        <CardShell key={i} title={m.name || `Person ${i + 1}`} onRemove={members.length > 1 ? () => onChange(members.filter((_, j) => j !== i)) : undefined}>
          <div className="space-y-3">
            <ImageUploader
              label="Profile photo"
              hint="Optional. Square photo works best."
              aspectRatio="square"
              maxSizeMB={MAX_IMAGE_UPLOAD_MB}
              currentUrl={m.profileImageUrl || undefined}
              onUpload={async (file) => {
                const media = await uploadMedia(file);
                update(i, { profileImageUrl: media.url });
              }}
            />
            <Field label="Full name">
              <input className={inputClass()} value={m.name} onChange={(e) => update(i, { name: e.target.value })} />
            </Field>
            <Field label="Job title">
              <input className={inputClass()} value={m.role} onChange={(e) => update(i, { role: e.target.value })} />
            </Field>
            <Field label="LinkedIn URL">
              <input
                className={inputClass()}
                value={m.linkedinUrl ?? ''}
                onChange={(e) => update(i, { linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </Field>
            <Field label="Short introduction">
              <textarea className={`${inputClass()} min-h-[72px]`} value={m.bio} onChange={(e) => update(i, { bio: e.target.value })} />
            </Field>
            <Field label="Display order" hint="Lower numbers appear first on the About page.">
              <input
                type="number"
                className={inputClass()}
                value={m.displayOrder ?? i}
                onChange={(e) => update(i, { displayOrder: Number(e.target.value) || 0 })}
              />
            </Field>
          </div>
        </CardShell>
      ))}
    </ListShell>
  );
}

function HoursEditor({ hours, onChange }: { hours: string[]; onChange: (h: string[]) => void }) {
  return (
    <ListShell label="Add another line" onAdd={() => onChange([...hours, ''])}>
      {hours.map((h, i) => (
        <CardShell key={i} title={`Hours ${i + 1}`} onRemove={hours.length > 1 ? () => onChange(hours.filter((_, j) => j !== i)) : undefined}>
          <input
            className={inputClass()}
            value={h}
            onChange={(e) => {
              const next = [...hours];
              next[i] = e.target.value;
              onChange(next);
            }}
            placeholder="Monday – Saturday: 7:00 AM – 5:00 PM"
          />
        </CardShell>
      ))}
    </ListShell>
  );
}

function ListShell({ label, onAdd, children }: { label: string; onAdd: () => void; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          {label}
        </Button>
      </div>
      {children}
    </div>
  );
}

function CardShell({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-3 bg-slate-50/80">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-800">{title}</span>
        {onRemove && (
          <button type="button" className="text-sm text-red-600 hover:underline" onClick={onRemove}>
            Delete
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
