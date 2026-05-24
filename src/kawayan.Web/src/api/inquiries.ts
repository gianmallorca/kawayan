import axios from 'axios';
import axiosInstance from './axiosInstance';
import type { Inquiry, PagedResult } from '@/types';

export async function submitInquiry(payload: {
  senderName: string;
  senderEmail: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const { data } = await axios.post<Inquiry>('/api/inquiries', payload);
  return data;
}

export async function fetchInquiries(params: {
  page: number;
  pageSize: number;
  search?: string;
  subject?: string;
}) {
  const { data } = await axiosInstance.get<PagedResult<Inquiry>>('/admin/inquiries', { params });
  return data;
}

export async function markInquiryRead(id: number) {
  const { data } = await axiosInstance.post<Inquiry>(`/admin/inquiries/${id}/read`);
  return data;
}

export async function deleteInquiry(id: number) {
  await axiosInstance.delete(`/admin/inquiries/${id}`);
}
