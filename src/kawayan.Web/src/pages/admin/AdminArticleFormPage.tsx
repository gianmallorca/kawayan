import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { invalidateArticlesCache } from '@/lib/articlesCache';
import { createArticle, fetchAdminArticle, updateArticle } from '@/api/articles';
import { uploadMedia } from '@/api/media';
import { uploadArticleImage } from '@/api/uploads';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { PageManagerPageHeader } from '@/components/admin/pageManager/PageManagerBlock';
import {
  AdminFormActions,
  AdminFormCard,
  AdminFormField,
  AdminFormLayout,
  AdminFormSection,
  AdminInput,
  AdminTextarea,
} from '@/components/admin/AdminForm';
import { slugify } from '@/lib/slugify';
import { MAX_IMAGE_UPLOAD_MB } from '@/lib/uploadLimits';

const empty = {
  title: '',
  slug: '',
  description: '',
  content: '',
  imageUrl: '',
  imageDescription: '',
  fullName: '',
  isPublished: false,
};

export function AdminArticleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const articleId = id ? Number(id) : null;
  const [form, setForm] = useState(empty);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isEdit || !articleId || Number.isNaN(articleId)) return;
    setLoading(true);
    fetchAdminArticle(articleId)
      .then((a) => {
        setForm({
          title: a.title,
          slug: a.slug,
          description: a.description,
          content: a.content,
          imageUrl: a.imageUrl ?? '',
          imageDescription: a.imageDescription ?? '',
          fullName: a.fullName ?? '',
          isPublished: a.isPublished,
        });
        setSlugTouched(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [isEdit, articleId]);

  if (isEdit && (Number.isNaN(articleId) || articleId === 0)) {
    return <Navigate to="/admin/articles" replace />;
  }

  if (notFound) {
    return <Navigate to="/admin/articles" replace />;
  }

  const onTitleChange = (title: string) => {
    setForm((f) => ({
      ...f,
      title,
      slug: slugTouched ? f.slug : slugify(title),
    }));
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        description: form.description.trim(),
        content: form.content.trim(),
        imageUrl: form.imageUrl || undefined,
        imageDescription: form.imageDescription.trim(),
        fullName: form.fullName.trim(),
        isPublished: form.isPublished,
      };
      if (isEdit && articleId) {
        await updateArticle(articleId, payload);
      } else {
        await createArticle(payload);
      }
      invalidateArticlesCache();
      navigate('/admin/articles');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminFormLayout wide>
      <div className="mb-2">
        <Link
          to="/admin/articles"
          className="text-sm text-gray-500 hover:text-gray-600 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Blogs
        </Link>
      </div>

      <PageManagerPageHeader
        title={isEdit ? 'Edit blog post' : 'Add blog post'}
        description="Blog posts appear on the home page and the public blogs listing when published."
      />

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <AdminFormCard>
          <AdminFormSection title="Blog post details">
            <ImageUploader
              label="Cover image"
              hint={`Shown on cards and the blog post page. Recommended 1200×750px. Max ${MAX_IMAGE_UPLOAD_MB}MB.`}
              aspectRatio="landscape"
              maxSizeMB={MAX_IMAGE_UPLOAD_MB}
              currentUrl={form.imageUrl || undefined}
              onUpload={async (file) => {
                if (isEdit && articleId) {
                  const url = await uploadArticleImage(articleId, file);
                  setForm((f) => ({ ...f, imageUrl: url }));
                } else {
                  const media = await uploadMedia(file);
                  setForm((f) => ({ ...f, imageUrl: media.url }));
                }
              }}
            />
            <AdminFormField label="Title" required>
              <AdminInput value={form.title} onChange={(e) => onTitleChange(e.target.value)} />
            </AdminFormField>
            <AdminFormField label="Author full name" hint="Shown in the byline on the public blog post.">
              <AdminInput
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
              />
            </AdminFormField>
            <AdminFormField label="Image description" hint="Short caption shown in tiny text under the cover image.">
              <AdminInput
                value={form.imageDescription}
                onChange={(e) => setForm((f) => ({ ...f, imageDescription: e.target.value }))}
              />
            </AdminFormField>
            <AdminFormField label="URL slug" hint="Used in the blog post link. Auto-generated from title unless you edit it.">
              <AdminInput
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((f) => ({ ...f, slug: e.target.value }));
                }}
              />
            </AdminFormField>
            <AdminFormField label="Short description">
              <AdminTextarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
              />
            </AdminFormField>
            <AdminFormField label="Full content">
              <AdminTextarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={12}
              />
            </AdminFormField>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300"
                checked={form.isPublished}
                onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
              />
              Published (visible on public site)
            </label>
            <AdminFormActions>
              <Link to="/admin/articles" className="admin-btn-secondary inline-flex items-center justify-center">
                Cancel
              </Link>
              <button type="button" className="admin-btn-primary" onClick={save} disabled={saving || !form.title.trim()}>
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add blog post'}
              </button>
            </AdminFormActions>
          </AdminFormSection>
        </AdminFormCard>
      )}
    </AdminFormLayout>
  );
}
