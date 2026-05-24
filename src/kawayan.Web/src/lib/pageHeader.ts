import type { CompanyDetails } from '@/types';
import type { PageSection } from '@/types';

export const SERVICE_HEADER_FALLBACK =
  'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1600&h=600&fit=crop';
export const CONTACT_HEADER_FALLBACK =
  'https://images.unsplash.com/photo-1598900384379-02b0883e4952?w=1600&h=600&fit=crop';

export function getPageHeaderUrl(
  page: string,
  sections: PageSection[],
  company: CompanyDetails | null,
): string | undefined {
  const section = sections.find((s) => s.page === page && s.sectionKey === 'hero_bg');
  if (section?.contentJson) {
    try {
      const parsed = JSON.parse(section.contentJson) as { imageUrl?: string };
      if (parsed.imageUrl) return parsed.imageUrl;
    } catch {
      /* ignore */
    }
  }

  switch (page) {
    case 'home':
      return company?.coverImageUrl;
    case 'about':
      return company?.aboutImageUrl;
    case 'services':
      return SERVICE_HEADER_FALLBACK;
    case 'contact':
      return CONTACT_HEADER_FALLBACK;
    default:
      return undefined;
  }
}

export function getStoredHeaderUrl(sections: PageSection[], page: string): string | undefined {
  const section = sections.find((s) => s.page === page && s.sectionKey === 'hero_bg');
  if (!section?.contentJson) return undefined;
  try {
    return (JSON.parse(section.contentJson) as { imageUrl?: string }).imageUrl;
  } catch {
    return undefined;
  }
}

/** Admin preview: per-page stored banner, then company fallbacks for home/about only. */
export function getAdminHeaderPreview(
  page: string,
  sections: PageSection[],
  company: CompanyDetails | null,
): { url?: string; version?: string } {
  const section = sections.find((s) => s.page === page && s.sectionKey === 'hero_bg');
  if (section?.contentJson) {
    try {
      const parsed = JSON.parse(section.contentJson) as { imageUrl?: string };
      if (parsed.imageUrl) return { url: parsed.imageUrl, version: section.updatedAt };
    } catch {
      /* ignore */
    }
  }
  if (page === 'home' && company?.coverImageUrl) {
    return { url: company.coverImageUrl, version: company.updatedAt };
  }
  if (page === 'about' && company?.aboutImageUrl) {
    return { url: company.aboutImageUrl, version: company.updatedAt };
  }
  return {};
}
