import axios from 'axios';
import axiosInstance from './axiosInstance';
import type { PagedResult, ServiceItem } from '@/types';

export async function fetchServices() {
  const { data } = await axios.get<ServiceItem[]>('/api/services');
  return data;
}

export async function fetchAdminServices(params: {
  page: number;
  pageSize: number;
  search?: string;
}) {
  const { data } = await axiosInstance.get<PagedResult<ServiceItem>>('/admin/services', { params });
  return data;
}

export async function fetchAdminService(id: number) {
  const { data } = await axiosInstance.get<ServiceItem>(`/admin/services/${id}`);
  return data;
}

export async function createService(payload: Omit<ServiceItem, 'id'>) {
  const { data } = await axiosInstance.post<ServiceItem>('/admin/services', payload);
  return data;
}

export async function updateService(id: number, payload: Omit<ServiceItem, 'id'>) {
  const { data } = await axiosInstance.put<ServiceItem>(`/admin/services/${id}`, payload);
  return data;
}

export async function deleteService(id: number) {
  await axiosInstance.delete(`/admin/services/${id}`);
}
