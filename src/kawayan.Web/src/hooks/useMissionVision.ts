import { useMemo } from 'react';
import { usePageContent } from '@/hooks/usePageContent';
import { MISSION_VISION_SOURCE_PAGE, resolveMissionVision } from '@/lib/missionVision';

export function useMissionVision() {
  const homeSections = usePageContent(MISSION_VISION_SOURCE_PAGE);
  const aboutSections = usePageContent('about');

  return useMemo(() => resolveMissionVision(homeSections, aboutSections), [homeSections, aboutSections]);
}
