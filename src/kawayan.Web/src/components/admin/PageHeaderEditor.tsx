import { useMemo } from 'react';
import { uploadPageHeader } from '@/api/uploads';
import { MAX_IMAGE_UPLOAD_MB } from '@/lib/uploadLimits';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { getAdminHeaderPreview } from '@/lib/pageHeader';
import { companyAssetUrl } from '@/lib/utils';
import type { PageSection } from '@/types';
import { useCompany } from '@/contexts/CompanyContext';

const hints: Record<string, string> = {
  home: 'Large photo behind the welcome message on your home page. Recommended 1600×600px or wider. Max 15MB.',
  about: 'Background photo at the top of your About page. Max 15MB.',
  services: 'Background photo at the top of your Services page. Max 15MB.',
  contact: 'Background photo at the top of your Contact page. Max 15MB.',
};

export function PageHeaderEditor({
  page,
  sections,
  onUpdated,
}: {
  page: string;
  sections: PageSection[];
  onUpdated: () => void | Promise<void>;
}) {
  const company = useCompany();

  const previewUrl = useMemo(() => {
    const { url, version } = getAdminHeaderPreview(page, sections, company);
    return url ? companyAssetUrl(url, version) ?? url : null;
  }, [page, sections, company]);

  return (
    <div>
      <ImageUploader
        key={page}
        label="Top banner photo"
        hint={hints[page] ?? hints.home}
        aspectRatio="wide"
        maxSizeMB={MAX_IMAGE_UPLOAD_MB}
        currentUrl={previewUrl}
        onUpload={async (file) => {
          await uploadPageHeader(page, file);
          await onUpdated();
        }}
      />
      <p className="text-sm text-gray-500 mt-2 leading-relaxed">
        The top of the banner may be cropped slightly on phones — keep important subjects near the center.
      </p>
    </div>
  );
}
