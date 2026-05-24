import type { PageSection } from '@/types';

export function parseSection<T>(sections: PageSection[], key: string, fallback: T): T {
  const section = sections.find((s) => s.sectionKey === key);
  if (!section?.contentJson) return fallback;
  try {
    return { ...fallback, ...JSON.parse(section.contentJson) } as T;
  } catch {
    return fallback;
  }
}
