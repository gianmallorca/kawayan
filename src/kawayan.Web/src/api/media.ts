import axiosInstance from './axiosInstance';
import type { MediaFile, PagedResult } from '@/types';

export async function fetchMedia(params: { page: number; pageSize: number }) {
  const { data } = await axiosInstance.get<PagedResult<MediaFile>>('/admin/media', { params });
  return data;
}

export async function uploadMedia(file: File) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await axiosInstance.post<MediaFile>('/admin/media', form);
  return data;
}

export async function deleteMedia(id: number) {
  await axiosInstance.delete(`/admin/media/${id}`);
}
