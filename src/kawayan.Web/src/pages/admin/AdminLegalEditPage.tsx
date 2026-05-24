import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchAdminLegalPage, updateLegalPage } from '@/api/legal';
import { invalidateLegalCache } from '@/lib/legalCache';
import {
  AdminFormActions,
  AdminFormCard,
  AdminFormField,
  AdminFormLayout,
  AdminPageHeader,
  AdminFormSection,
  AdminInput,
  AdminTextarea,
} from '@/components/admin/AdminForm';
import { useToast } from '@/contexts/ToastContext';

export function AdminLegalEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const pageId = id ? Number(id) : NaN;
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [lastRevised, setLastRevised] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(pageId)) return;
    setLoading(true);
    fetchAdminLegalPage(pageId)
      .then((page) => {
        setSlug(page.slug);
        setTitle(page.title);
        setBody(page.body);
        setLastRevised(page.lastRevised?.slice(0, 10) ?? '');
        setIsPublished(page.isPublished);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [pageId]);

  if (Number.isNaN(pageId)) return <Navigate to="/admin/legal" replace />;
  if (notFound) return <Navigate to="/admin/legal" replace />;

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await updateLegalPage(pageId, {
        title: title.trim(),
        body: body.trim(),
        lastRevised: lastRevised || null,
        isPublished,
      });
      if (slug) invalidateLegalCache(slug);
      showToast('Legal page saved.');
      navigate('/admin/legal');
    } catch {
      showToast('Could not save. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminFormLayout>
        <p className="text-sm text-slate-500">Loading…</p>
      </AdminFormLayout>
    );
  }

  return (
    <AdminFormLayout>
      <Link
        to="/admin/legal"
        className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary mb-4 min-h-[44px]"
      >
        <ArrowLeft size={16} aria-hidden />
        Back to Legal Pages
      </Link>
      <AdminPageHeader title="Edit Legal Page" subtitle="Use {{company_name}} where your company name should appear on the public site." />
      <AdminFormCard>
        <AdminFormSection title="Content">
          <AdminFormField label="Title">
            <AdminInput value={title} onChange={(e) => setTitle(e.target.value)} />
          </AdminFormField>
          <AdminFormField
            label="Last revised"
            hint="Shown on the public page. Updates automatically to today when you save if left empty."
          >
            <AdminInput type="date" value={lastRevised} onChange={(e) => setLastRevised(e.target.value)} />
          </AdminFormField>
          <AdminFormField
            label="Body"
            hint="Use {{company_name}} where your company name should appear on the public site."
          >
            <AdminTextarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[320px] font-mono text-sm"
            />
          </AdminFormField>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="rounded border-gray-300"
            />
            Published on website
          </label>
        </AdminFormSection>
        <AdminFormActions>
          <Link to="/admin/legal" className="admin-btn-secondary inline-flex items-center justify-center">
            Cancel
          </Link>
          <button type="button" className="admin-btn-primary" onClick={save} disabled={saving || !title.trim()}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </AdminFormActions>
      </AdminFormCard>
    </AdminFormLayout>
  );
}
