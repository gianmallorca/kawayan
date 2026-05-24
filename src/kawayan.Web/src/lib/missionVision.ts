import { parseSection } from '@/lib/content';
import type { MissionVision } from '@/lib/pageContent';
import { getDefaultSection, parseSectionJson } from '@/lib/sectionDefaults';
import type { PageSection } from '@/types';

export const MISSION_VISION_SECTION_KEY = 'missionVision';
export const MISSION_VISION_SOURCE_PAGE = 'home';

const emptyMissionVision = (): MissionVision => ({ mission: '', vision: '' });

function hasMissionVisionContent(data: Record<string, unknown>) {
  return Boolean(String(data.mission ?? '').trim() || String(data.vision ?? '').trim());
}

export function resolveMissionVision(homeSections: PageSection[], aboutSections: PageSection[]): MissionVision {
  const fromHome = parseSection<MissionVision>(homeSections, MISSION_VISION_SECTION_KEY, emptyMissionVision());
  if (fromHome.mission?.trim() || fromHome.vision?.trim()) return fromHome;
  return parseSection<MissionVision>(aboutSections, MISSION_VISION_SECTION_KEY, emptyMissionVision());
}

export function missionVisionDraftFromSections(page: string, sections: PageSection[]): Record<string, unknown> {
  const homeExisting = sections.find(
    (s) => s.page === MISSION_VISION_SOURCE_PAGE && s.sectionKey === MISSION_VISION_SECTION_KEY,
  );
  const pageExisting = sections.find((s) => s.page === page && s.sectionKey === MISSION_VISION_SECTION_KEY);
  const homeData = parseSectionJson(MISSION_VISION_SOURCE_PAGE, MISSION_VISION_SECTION_KEY, homeExisting?.contentJson ?? '');
  if (page === MISSION_VISION_SOURCE_PAGE) return homeData;

  const pageData = parseSectionJson(page, MISSION_VISION_SECTION_KEY, pageExisting?.contentJson ?? '');
  return hasMissionVisionContent(homeData) ? homeData : pageData;
}

export function cleanMissionVisionData(data: Record<string, unknown>): MissionVision {
  return {
    mission: String(data.mission ?? '').trim(),
    vision: String(data.vision ?? '').trim(),
  };
}

export function missionVisionPayload(data: Record<string, unknown>) {
  return JSON.stringify(cleanMissionVisionData(data));
}

export function getDefaultMissionVision() {
  return getDefaultSection(MISSION_VISION_SOURCE_PAGE, MISSION_VISION_SECTION_KEY);
}
