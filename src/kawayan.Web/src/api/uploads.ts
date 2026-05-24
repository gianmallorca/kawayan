import axiosInstance from './axiosInstance';

export async function uploadLogo(file: File) {
  const form = new FormData();
  form.append('logo', file);
  const { data } = await axiosInstance.post<{ logoUrl: string }>('/admin/company/logo', form);
  return data.logoUrl;
}

export async function uploadPageHeader(pageKey: string, file: File) {
  const form = new FormData();
  form.append('image', file);
  const { data } = await axiosInstance.post<{ pageKey: string; imageUrl: string }>(
    `/admin/pages/${pageKey}/header-image`,
    form,
  );
  return data.imageUrl;
}

export async function uploadServiceImage(serviceId: number, file: File) {
  const form = new FormData();
  form.append('image', file);
  const { data } = await axiosInstance.post<{ serviceId: number; imageUrl: string }>(
    `/admin/services/${serviceId}/image`,
    form,
  );
  return data.imageUrl;
}

export async function uploadArticleImage(articleId: number, file: File) {
  const form = new FormData();
  form.append('image', file);
  const { data } = await axiosInstance.post<{ articleId: number; imageUrl: string }>(
    `/admin/articles/${articleId}/image`,
    form,
  );
  return data.imageUrl;
}
