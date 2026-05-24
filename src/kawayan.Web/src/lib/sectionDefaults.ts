export const pageOptions = [
  { id: 'home', label: 'Home Page' },
  { id: 'about', label: 'About Us' },
  { id: 'services', label: 'Services Page' },
  { id: 'contact', label: 'Contact Page' },
] as const;

export const pageManagerCards = [
  { key: 'home', name: 'Home', icon: '🏠', description: 'Hero, stats, highlights' },
  { key: 'about', name: 'About', icon: '👤', description: 'Story, team, values' },
  { key: 'services', name: 'Services', icon: '🛠', description: 'Service cards' },
  { key: 'contact', name: 'Contact', icon: '📬', description: 'Form, map' },
] as const;

export const sectionKeysByPage: Record<string, string[]> = {
  home: ['hero', 'whyChooseUs', 'products', 'missionVision', 'stats', 'testimonials', 'cta'],
  about: ['hero', 'story', 'missionVision', 'values', 'team'],
  services: ['hero', 'cta'],
  contact: ['hero', 'details'],
};

export const sectionLabels: Record<string, Record<string, string>> = {
  home: {
    hero: 'Welcome message at the top',
    whyChooseUs: 'Why people should choose you',
    products: 'Featured products',
    missionVision: 'Mission and vision',
    stats: 'Numbers at a glance',
    testimonials: 'What customers say',
    cta: 'Invitation to get in touch',
  },
  about: {
    hero: 'Page title area',
    story: 'Your company story',
    missionVision: 'Mission and vision',
    values: 'What you stand for',
    team: 'Your team',
  },
  services: {
    hero: 'Page title area',
    cta: 'Invitation to get in touch',
  },
  contact: {
    hero: 'Page title area',
    details: 'Opening hours',
  },
};

export const sectionHints: Record<string, Record<string, string>> = {
  home: {
    hero: 'The big banner visitors see first. Your company name and slogan are set under Company.',
    whyChooseUs: 'Three short points about what makes your business special.',
    products: 'Optional section title only — the home page shows your first four services (images from Services Manager).',
    missionVision: 'Shared with the About page — updates appear on both pages.',
    stats: 'Examples: years in business, happy clients, products offered.',
    testimonials: 'Real quotes from happy customers build trust.',
    cta: 'A closing message encouraging visitors to contact you.',
  },
  about: {
    hero: 'The title visitors see when they open the About page.',
    story: 'Tell your history in one or more paragraphs.',
    missionVision: 'Shared with the Home page — updates appear on both pages.',
    values: 'Four qualities that define how you work.',
    team: 'Introduce the people behind your company.',
  },
  services: {
    hero: 'The title at the top of your Services page.',
    cta: 'A short message at the bottom inviting people to reach out.',
  },
  contact: {
    hero: 'The title at the top of your Contact page.',
    details: 'When you are open for business. Address and phone are under Company.',
  },
};

export function getDefaultSection(page: string, sectionKey: string): Record<string, unknown> {
  const key = `${page}.${sectionKey}`;
  const defaults: Record<string, Record<string, unknown>> = {
    'home.hero': {
      subtext: '',
      ctaPrimary: 'View our services',
      ctaPrimaryLink: '/services',
      ctaSecondary: 'Contact us',
      ctaSecondaryLink: '/contact',
    },
    'home.whyChooseUs': { cards: [{ icon: '🌿', title: '', body: '' }] },
    'home.products': { headline: '' },
    'home.missionVision': { mission: '', vision: '' },
    'home.stats': { items: [{ value: '', label: '' }] },
    'home.testimonials': { items: [{ quote: '', name: '', role: '' }] },
    'home.cta': { headline: '', subtext: '', buttonText: 'Contact us', buttonLink: '/contact' },
    'about.hero': { headline: '', subtext: '' },
    'about.story': { paragraphs: [''] },
    'about.missionVision': { mission: '', vision: '' },
    'about.values': { cards: [{ icon: '🌱', title: '', body: '' }] },
    'about.team': { members: [{ initials: '', name: '', role: '', bio: '' }] },
    'services.hero': { headline: '', subtext: '' },
    'services.cta': { headline: '', subtext: '', buttonText: 'Contact us', buttonLink: '/contact' },
    'contact.hero': { headline: '', subtext: '' },
    'contact.details': { hours: [''] },
  };
  return structuredClone(defaults[key] ?? {});
}

export function parseSectionJson(page: string, sectionKey: string, json: string): Record<string, unknown> {
  const fallback = getDefaultSection(page, sectionKey);
  if (!json?.trim()) return fallback;
  try {
    return { ...fallback, ...JSON.parse(json) };
  } catch {
    return fallback;
  }
}

export function initialsFromName(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
