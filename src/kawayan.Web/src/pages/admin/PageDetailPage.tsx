import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { fetchAllContent, upsertSection } from '@/api/content';
import { PageHeaderEditor } from '@/components/admin/PageHeaderEditor';
import { SectionContentEditor } from '@/components/admin/SectionContentEditor';
import { PageManagerBlock, PageManagerPageHeader } from '@/components/admin/pageManager/PageManagerBlock';
import { PageSectionAccordion } from '@/components/admin/pageManager/PageSectionAccordion';
import { AdminFormLayout } from '@/components/admin/AdminForm';
import {
  getDefaultSection,
  initialsFromName,
  pageManagerCards,
  pageOptions,
  parseSectionJson,
  sectionHints,
  sectionKeysByPage,
  sectionLabels,
} from '@/lib/sectionDefaults';
import { useRefreshCompany } from '@/contexts/CompanyContext';
import {
  MISSION_VISION_SECTION_KEY,
  MISSION_VISION_SOURCE_PAGE,
  missionVisionDraftFromSections,
  missionVisionPayload,
} from '@/lib/missionVision';
import { invalidatePageContent, loadPageContent } from '@/lib/pageContentCache';
import type { PageSection } from '@/types';

export function PageDetailPage() {
  const { pageKey } = useParams<{ pageKey: string }>();
  const refreshCompany = useRefreshCompany();
  const page = pageKey ?? 'home';
  const pageMeta = pageManagerCards.find((p) => p.key === page);
  const pageLabel = pageOptions.find((p) => p.id === page)?.label ?? pageMeta?.name ?? 'Page';

  const [sections, setSections] = useState<PageSection[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Record<string, unknown>>>({});
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedSection, setSavedSection] = useState<string | null>(null);

  const keys = useMemo(() => sectionKeysByPage[page] ?? [], [page]);

  useEffect(() => {
    fetchAllContent().then(setSections).catch(() => setSections([]));
  }, []);

  useEffect(() => {
    const next: Record<string, Record<string, unknown>> = {};
    for (const key of keys) {
      if (key === MISSION_VISION_SECTION_KEY) {
        next[key] = missionVisionDraftFromSections(page, sections);
        continue;
      }
      const existing = sections.find((s) => s.page === page && s.sectionKey === key);
      next[key] = parseSectionJson(page, key, existing?.contentJson ?? '');
    }
    setDrafts(next);
    setOpenSection(keys[0] ?? null);
  }, [page, sections, keys]);

  if (!pageMeta) {
    return <Navigate to="/admin/pages/home" replace />;
  }

  const updateDraft = (key: string, data: Record<string, unknown>) => {
    setDrafts((prev) => ({ ...prev, [key]: data }));
  };

  const saveSection = async (key: string) => {
    setSaving(key);
    try {
      const raw = drafts[key] ?? {};
      if (key === MISSION_VISION_SECTION_KEY) {
        const payload = missionVisionPayload(raw);
        await upsertSection(MISSION_VISION_SOURCE_PAGE, key, payload);
        await upsertSection('about', key, payload);
        const updated = await fetchAllContent();
        setSections(updated);
        invalidatePageContent(MISSION_VISION_SOURCE_PAGE);
        invalidatePageContent('about');
        void loadPageContent(MISSION_VISION_SOURCE_PAGE);
        void loadPageContent('about');
      } else {
        const cleaned =
          page === 'home' && key === 'products'
            ? { headline: String(raw.headline ?? '').trim() }
            : cleanSectionData(raw);
        await upsertSection(page, key, JSON.stringify(cleaned));
        const updated = await fetchAllContent();
        setSections(updated);
        invalidatePageContent(page);
        void loadPageContent(page);
      }
      setSavedSection(key);
      setTimeout(() => setSavedSection(null), 2500);
    } finally {
      setSaving(null);
    }
  };

  const reload = async () => {
    invalidatePageContent(page);
    await Promise.all([
      fetchAllContent().then(setSections).catch(() => setSections([])),
      refreshCompany(true),
      loadPageContent(page),
    ]);
  };

  return (
    <AdminFormLayout wide>
      <div className="space-y-6">
        <PageManagerPageHeader
          title={pageLabel}
          description="Upload a banner photo, then open each section below to edit wording. Save each section when you are done."
        />

        <PageManagerBlock
          title="Top banner"
          description="Background image at the top of this page."
        >
          <PageHeaderEditor key={page} page={page} sections={sections} onUpdated={reload} />
        </PageManagerBlock>

        <PageManagerBlock title="Page content" description={pageMeta.description}>
          <div className="space-y-2">
            {keys.map((key) => {
              const label = sectionLabels[page]?.[key] ?? key;
              const hint = sectionHints[page]?.[key];
              const isOpen = openSection === key;

              return (
                <PageSectionAccordion
                  key={key}
                  label={label}
                  hint={hint}
                  isOpen={isOpen}
                  onToggle={() => setOpenSection(isOpen ? null : key)}
                  footer={
                    <>
                      <button
                        type="button"
                        className="admin-btn-primary"
                        onClick={() => saveSection(key)}
                        disabled={saving === key}
                      >
                        {saving === key ? 'Saving…' : 'Save changes'}
                      </button>
                      {savedSection === key ? (
                        <span className="text-sm text-green-600 font-medium">Saved</span>
                      ) : null}
                    </>
                  }
                >
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <SectionContentEditor
                      page={page}
                      sectionKey={key}
                      data={drafts[key] ?? getDefaultSection(page, key)}
                      onChange={(data) => updateDraft(key, data)}
                    />
                  </div>
                </PageSectionAccordion>
              );
            })}
          </div>
        </PageManagerBlock>
      </div>
    </AdminFormLayout>
  );
}

function cleanSectionData(data: Record<string, unknown>): Record<string, unknown> {
  const out = { ...data };
  if (Array.isArray(out.cards)) {
    out.cards = (out.cards as { icon?: string; title?: string; body?: string }[]).map((c, i) => ({
      icon: c.icon || ['🌿', '🏗️', '🚚', '🌱'][i % 4],
      title: c.title ?? '',
      body: c.body ?? '',
    })).filter((c) => c.title?.trim() || c.body?.trim());
  }
  if (Array.isArray(out.items)) {
    const items = out.items as { name?: string; value?: string; quote?: string; desc?: string }[];
    if (items[0] && 'quote' in items[0]) {
      out.items = items.filter((i) => i.quote?.trim());
    } else if (items[0] && 'value' in items[0]) {
      out.items = items.filter((i) => i.value?.trim() || (i as { label?: string }).label?.trim());
    } else {
      out.items = items.filter((i) => i.name?.trim());
    }
  }
  if (Array.isArray(out.members)) {
    out.members = (out.members as { name?: string; role?: string; bio?: string; initials?: string }[])
      .filter((m) => m.name?.trim())
      .map((m) => ({ ...m, initials: initialsFromName(m.name ?? '') || m.initials }));
  }
  if (Array.isArray(out.paragraphs)) {
    out.paragraphs = (out.paragraphs as string[]).filter((p) => p.trim());
  }
  if (Array.isArray(out.hours)) {
    out.hours = (out.hours as string[]).filter((h) => h.trim());
  }
  return out;
}
