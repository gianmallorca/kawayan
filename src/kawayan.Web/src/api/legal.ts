import axios from 'axios';
import axiosInstance from './axiosInstance';

export interface LegalPagePublic {
  slug: string;
  title: string;
  body: string;
  lastRevised?: string | null;
}

export interface LegalPageAdmin extends LegalPagePublic {
  id: number;
  isPublished: boolean;
  updatedAt: string;
}

export type UpdateLegalPagePayload = {
  title: string;
  body: string;
  lastRevised?: string | null;
  isPublished: boolean;
};

export async function fetchLegalPage(slug: string) {
  const { data } = await axios.get<LegalPagePublic>(`/api/legal/${encodeURIComponent(slug)}`);
  return data;
}

export async function fetchAdminLegalPages() {
  const { data } = await axiosInstance.get<LegalPageAdmin[]>('/admin/legal');
  return data;
}

export async function fetchAdminLegalPage(id: number) {
  const { data } = await axiosInstance.get<LegalPageAdmin>(`/admin/legal/${id}`);
  return data;
}

export async function updateLegalPage(id: number, payload: UpdateLegalPagePayload) {
  const { data } = await axiosInstance.put<LegalPageAdmin>(`/admin/legal/${id}`, payload);
  return data;
}
