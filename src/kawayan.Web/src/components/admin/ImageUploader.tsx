import { useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/ToastContext';

type Aspect = 'square' | 'landscape' | 'wide';

const aspectClass: Record<Aspect, string> = {
  square: 'aspect-square max-w-[200px]',
  landscape: 'aspect-[4/3] max-w-md',
  wide: 'aspect-video w-full max-w-2xl',
};

const acceptByAspect: Record<Aspect, string> = {
  square: 'image/png,image/jpeg,image/webp,image/svg+xml',
  landscape: 'image/png,image/jpeg,image/webp',
  wide: 'image/png,image/jpeg,image/webp',
};

type Props = {
  currentUrl: string | null | undefined;
  aspectRatio: Aspect;
  onUpload: (file: File) => Promise<void>;
  label: string;
  hint: string;
  maxSizeMB: number;
  onRemove?: () => void;
};

export function ImageUploader({ currentUrl, aspectRatio, onUpload, label, hint, maxSizeMB, onRemove }: Props) {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const displayUrl = preview ?? currentUrl ?? null;

  useEffect(() => {
    setPendingFile(null);
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setError('');
  }, [currentUrl]);

  const validate = (file: File) => {
    if (!file.type.startsWith('image/')) return 'Please choose an image file (JPG, PNG, or WebP).';
    if (file.size > maxSizeMB * 1024 * 1024) return `Image must be smaller than ${maxSizeMB}MB.`;
    return '';
  };

  const pickFile = (file: File) => {
    const err = validate(file);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setPendingFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) pickFile(file);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) pickFile(file);
  };

  const confirmUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    setProgress(0);
    const timer = setInterval(() => setProgress((p) => Math.min(p + 12, 90)), 120);
    try {
      await onUpload(pendingFile);
      setProgress(100);
      setPendingFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      showToast('Image uploaded successfully');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
        : null;
      showToast(msg || 'Upload failed. Please try again.', 'error');
    } finally {
      clearInterval(timer);
      setUploading(false);
      setProgress(0);
    }
  };

  const cancelPending = () => {
    setPendingFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  return (
    <div className="admin-card-section">
      <p className="admin-section-label">{label}</p>
      <p className="text-xs text-gray-400 mb-3">{hint}</p>
      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      {uploading ? (
        <div className={`admin-upload-box ${aspectClass[aspectRatio]}`}>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="bg-brand h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-gray-600">Uploading… {progress}%</p>
        </div>
      ) : displayUrl ? (
        <div className="space-y-3">
          <div className={`relative overflow-hidden rounded-lg border bg-gray-100 ${aspectClass[aspectRatio]}`}>
            <img src={displayUrl} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              Replace image
            </Button>
            {pendingFile ? (
              <>
                <Button type="button" size="sm" onClick={confirmUpload}>
                  Confirm upload
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={cancelPending}>
                  Cancel
                </Button>
              </>
            ) : null}
            {onRemove && !pendingFile && (
              <Button type="button" variant="outline" size="sm" className="text-red-600 border-red-200" onClick={onRemove}>
                Remove
              </Button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`admin-upload-box ${aspectClass[aspectRatio]} w-full border-2 border-dashed border-gray-300 hover:border-brand hover:bg-brand-muted transition-colors`}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-700">Click or drag to upload</p>
          <p className="text-xs text-gray-400 mt-1">
            JPG, PNG, WebP · Max {maxSizeMB}MB
          </p>
        </button>
      )}

      {!displayUrl && pendingFile && (
        <div className="mt-3 flex gap-2">
          <Button type="button" size="sm" onClick={confirmUpload}>
            Confirm upload
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={cancelPending}>
            Cancel
          </Button>
        </div>
      )}

      <input ref={inputRef} type="file" accept={acceptByAspect[aspectRatio]} className="hidden" onChange={onInput} />
    </div>
  );
}
