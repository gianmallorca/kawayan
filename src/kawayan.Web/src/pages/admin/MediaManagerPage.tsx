import { useCallback, useEffect, useRef, useState } from 'react';

import { Image as ImageIcon, Trash2, Upload } from 'lucide-react';

import { deleteMedia, fetchMedia, uploadMedia } from '@/api/media';

import {

  AdminEmptyState,

  AdminFormCard,

  AdminFormLayout,

  AdminIndexHeader,

} from '@/components/admin/AdminForm';

import { TableCardPagination } from '@/components/ui/Pagination';

import { useToast } from '@/contexts/ToastContext';

import { validateImageFileSize } from '@/lib/uploadLimits';

import type { MediaFile } from '@/types';



export function MediaManagerPage() {

  const { showToast } = useToast();

  const [files, setFiles] = useState<MediaFile[]>([]);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(12);

  const [totalCount, setTotalCount] = useState(0);

  const [totalPages, setTotalPages] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);



  const load = useCallback(() => {

    setLoading(true);

    return fetchMedia({ page, pageSize })

      .then((data) => {

        setFiles(data.items);

        setTotalCount(data.totalCount);

        setTotalPages(data.totalPages);

      })

      .catch(() => {

        setFiles([]);

        setTotalCount(0);

        setTotalPages(0);

      })

      .finally(() => setLoading(false));

  }, [page, pageSize]);



  useEffect(() => {

    load();

  }, [load]);



  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {

    const file = e.target.files?.[0];

    if (!file) return;

    const sizeError = validateImageFileSize(file);

    if (sizeError) {

      showToast(sizeError, 'error');

      if (inputRef.current) inputRef.current.value = '';

      return;

    }

    await uploadMedia(file);

    if (inputRef.current) inputRef.current.value = '';

    setPage(1);

    load();

  };



  const openPicker = () => inputRef.current?.click();



  return (

    <AdminFormLayout wide>

      <AdminIndexHeader

        icon={ImageIcon}

        title="Media Library"

        subtitle="Upload and manage images for your website."

        action={

          <button type="button" className="admin-btn-primary inline-flex items-center gap-2" onClick={openPicker}>

            <Upload size={16} aria-hidden />

            Upload image

          </button>

        }

      />

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />



      <AdminFormCard className="!p-0 overflow-hidden">

        <div className="flex flex-wrap items-center gap-3 p-5 sm:p-6 border-b border-gray-100">

          <button type="button" className="admin-btn-secondary inline-flex items-center gap-2" onClick={openPicker}>

            <Upload size={16} aria-hidden />

            Upload image

          </button>

          {totalCount > 0 ? (

            <p className="text-sm text-gray-500">

              {totalCount} file{totalCount === 1 ? '' : 's'}

            </p>

          ) : null}

        </div>



        {loading ? (

          <p className="p-10 text-sm text-gray-500 text-center">Loading…</p>

        ) : files.length === 0 && totalCount === 0 ? (

          <AdminEmptyState

            icon={ImageIcon}

            title="No media yet"

            description="Upload your first image to use across pages and services."

            action={

              <button type="button" className="admin-btn-primary inline-flex items-center gap-2" onClick={openPicker}>

                <Upload size={16} aria-hidden />

                Upload image

              </button>

            }

          />

        ) : (

          <>

            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 p-5 sm:p-6">

              {files.map((f) => (

                <div key={f.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">

                  <img src={f.url} alt={f.fileName} className="h-32 w-full object-cover" />

                  <p className="p-2 text-xs truncate text-gray-700">{f.fileName}</p>

                  <p className="px-2 pb-1 text-xs text-gray-500 truncate">{f.url}</p>

                  <button

                    type="button"

                    className="admin-btn-danger m-2 text-xs h-9 px-3 inline-flex items-center gap-1.5"

                    onClick={() => deleteMedia(f.id).then(load)}

                  >

                    <Trash2 size={14} aria-hidden />

                    Delete

                  </button>

                </div>

              ))}

            </div>

            <TableCardPagination

              page={page}

              totalPages={totalPages}

              totalCount={totalCount}

              pageSize={pageSize}

              pageSizeOptions={[12, 24, 48, 96]}

              onPageChange={setPage}

              onPageSizeChange={(s) => {

                setPageSize(s);

                setPage(1);

              }}

            />

          </>

        )}

      </AdminFormCard>

    </AdminFormLayout>

  );

}



