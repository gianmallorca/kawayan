export type HeroContent = {
  subtext?: string;
  headline?: string;
  ctaPrimary?: string;
  ctaPrimaryLink?: string;
  ctaSecondary?: string;
  ctaSecondaryLink?: string;
};

export type IconCard = { icon: string; title: string; body: string };

export type ProductHighlight = { name: string; desc: string; tag: string; imageUrl?: string };

export type MissionVision = { mission: string; vision: string };

export type StatItem = { value: string; label: string };

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  profileImageUrl?: string;
  rating?: number | null;
};

export type CtaContent = { headline: string; subtext: string; buttonText: string; buttonLink: string };

export type TeamMember = {
  initials: string;
  name: string;
  role: string;
  bio: string;
  profileImageUrl?: string;
  linkedinUrl?: string;
  displayOrder?: number;
};

export type ContactDetails = { hours: string[] };
