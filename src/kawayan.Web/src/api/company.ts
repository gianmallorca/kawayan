import axios from 'axios';
import axiosInstance from './axiosInstance';
import type { CompanyDetails, ReverseGeocodeResult, UpdateCompanyPayload, UpdateCompanyResult } from '@/types';

export async function fetchCompany(options?: { bustCache?: boolean }) {
  const { data } = await axios.get<CompanyDetails>('/api/company', {
    ...(options?.bustCache
      ? { params: { _: Date.now() }, headers: { 'Cache-Control': 'no-cache' } }
      : {}),
  });
  return data;
}

export async function fetchAdminCompany() {
  const { data } = await axiosInstance.get<CompanyDetails>('/admin/company');
  return data;
}

export async function updateCompany(payload: UpdateCompanyPayload) {
  const { data } = await axiosInstance.put<UpdateCompanyResult>('/admin/company', payload);
  return data;
}

export async function reverseGeocode(latitude: number, longitude: number) {
  const { data } = await axiosInstance.get<ReverseGeocodeResult>('/admin/company/reverse-geocode', {
    params: { latitude, longitude },
  });
  return data;
}

export async function geocodePreview(address: {
  street?: string;
  barangay?: string;
  city?: string;
  province?: string;
  region?: string;
  country?: string;
  postalCode?: string;
}) {
  const { data } = await axiosInstance.get<{ latitude: number; longitude: number }>(
    '/admin/company/geocode-preview',
    { params: address },
  );
  return data;
}

export async function uploadCompanyImage(type: 'logo' | 'cover' | 'about-image', file: File) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await axiosInstance.post<CompanyDetails>(`/admin/company/${type}`, form);
  return data;
}
