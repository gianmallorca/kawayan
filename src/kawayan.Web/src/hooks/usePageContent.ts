import { useEffect, useState } from 'react';
import { getCachedPageContent, loadPageContent } from '@/lib/pageContentCache';
import type { PageSection } from '@/types';

export function usePageContent(page: string) {
  const [sections, setSections] = useState<PageSection[]>(() => getCachedPageContent(page) ?? []);

  useEffect(() => {
    const cached = getCachedPageContent(page);
    if (cached) setSections(cached);

    let cancelled = false;
    loadPageContent(page)
      .then((data) => {
        if (!cancelled) setSections(data);
      })
      .catch(() => {
        if (!cancelled && !getCachedPageContent(page)) setSections([]);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  return sections;
}
