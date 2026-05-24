import type { LucideIcon } from 'lucide-react';
import { Facebook, Github, Globe, Instagram, Linkedin, MessageCircle, Twitter, Youtube } from 'lucide-react';

const ICON_BY_KEY: Record<string, LucideIcon> = {
  facebook: Facebook,
  fb: Facebook,
  instagram: Instagram,
  ig: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  youtube: Youtube,
  yt: Youtube,
  github: Github,
  git: Github,
  whatsapp: MessageCircle,
};

function normalizeSocialKey(raw: string) {
  return raw.trim().toLowerCase().replace(/[\s_-]+/g, '');
}

export function resolveSocialIcon(name: string): LucideIcon {
  const k = normalizeSocialKey(name);
  if (ICON_BY_KEY[k]) return ICON_BY_KEY[k];
  if (k.includes('linkedin')) return Linkedin;
  if (k.includes('facebook') || k === 'fb') return Facebook;
  if (k.includes('instagram')) return Instagram;
  if (k.includes('twitter') || k === 'x') return Twitter;
  if (k.includes('youtube')) return Youtube;
  if (k.includes('github')) return Github;
  if (k.includes('whatsapp')) return MessageCircle;
  return Globe;
}

function ariaLabelForSocial(name: string) {
  const t = name.replace(/[_-]+/g, ' ').trim();
  if (!t) return 'Social link';
  return `${t.charAt(0).toUpperCase()}${t.slice(1)} (opens in new tab)`;
}

type Props = {
  entries: [string, string][];
  className?: string;
  linkClassName?: string;
  iconClassName?: string;
};

export function SocialIconLinks({ entries, className, linkClassName, iconClassName }: Props) {
  const iconSz = iconClassName ?? 'w-[18px] h-[18px]';
  const linkBase =
    linkClassName ??
    'inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white text-slate-600 hover:bg-gray-50 hover:text-primary transition-colors shrink-0';

  return (
    <div className={className ?? 'flex flex-wrap gap-2'}>
      {entries.map(([name, url]) => {
        const Icon = resolveSocialIcon(name);
        return (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noreferrer"
            className={linkBase}
            aria-label={ariaLabelForSocial(name)}
          >
            <Icon className={`${iconSz} shrink-0`} strokeWidth={1.75} aria-hidden />
          </a>
        );
      })}
    </div>
  );
}
