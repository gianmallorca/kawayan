import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { createService, fetchAdminService, updateService } from '@/api/services';
import { uploadMedia } from '@/api/media';
import { uploadServiceImage } from '@/api/uploads';
import { MAX_IMAGE_UPLOAD_MB } from '@/lib/uploadLimits';
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
import { invalidateServicesCache } from '@/lib/servicesCache';

const empty = { title: '', description: '', price: null as number | null, iconUrl: '', imageUrl: '' };

export function AdminServiceFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const serviceId = id ? Number(id) : null;
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!isEdit || !serviceId || Number.isNaN(serviceId)) return;
    setLoading(true);
    fetchAdminService(serviceId)
      .then((s) => {
        setForm({
          title: s.title,
          description: s.description,
          price: s.price ?? null,
          iconUrl: s.iconUrl ?? '',
          imageUrl: s.imageUrl ?? '',
        });
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [isEdit, serviceId]);

  if (isEdit && (Number.isNaN(serviceId) || serviceId === 0)) {
    return <Navigate to="/admin/services" replace />;
  }

  if (notFound) {
    return <Navigate to="/admin/services" replace />;
  }

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (isEdit && serviceId) {
        await updateService(serviceId, form);
      } else {
        await createService(form);
      }
      invalidateServicesCache();
      navigate('/admin/services');
    } finally {
      setSaving(false);
    }
  };

  const heading = isEdit ? 'Edit service' : 'Add service';

  return (
    <AdminFormLayout wide>
      <div className="mb-2">
        <Link
          to="/admin/services"
          className="text-sm text-gray-500 hover:text-gray-600 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Services
        </Link>
      </div>

      <PageManagerPageHeader
        title={heading}
        description={
          isEdit
          ? 'Update the photo, name, description, and price for this service.'
            : 'Add a new service. It appears on the Services page and in the home page featured section.'
        }
      />

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <AdminFormCard>
          <AdminFormSection title="Service details">
            <ImageUploader
              label="Service photo"
              hint={`Shown on the service card. Recommended 600×400px. Max ${MAX_IMAGE_UPLOAD_MB}MB.`}
              aspectRatio="landscape"
              maxSizeMB={MAX_IMAGE_UPLOAD_MB}
              currentUrl={form.imageUrl || undefined}
              onUpload={async (file) => {
                if (isEdit && serviceId) {
                  const url = await uploadServiceImage(serviceId, file);
                  setForm((f) => ({ ...f, imageUrl: url }));
                } else {
                  const media = await uploadMedia(file);
                  setForm((f) => ({ ...f, imageUrl: media.url }));
                }
              }}
            />
            <AdminFormField label="Service name" required>
              <AdminInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Description">
              <AdminTextarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={5}
              />
            </AdminFormField>
            <AdminFormField label="Price (optional)">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">₱</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  className="admin-input !pl-7"
                />
              </div>
            </AdminFormField>
            <AdminFormActions>
              <Link to="/admin/services" className="admin-btn-secondary inline-flex items-center justify-center">
                Cancel
              </Link>
              <button type="button" className="admin-btn-primary" onClick={save} disabled={saving || !form.title.trim()}>
                {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add service'}
              </button>
            </AdminFormActions>
          </AdminFormSection>
        </AdminFormCard>
      )}
    </AdminFormLayout>
  );
}
