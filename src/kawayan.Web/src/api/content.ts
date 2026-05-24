import axios from 'axios';
import axiosInstance from './axiosInstance';
import type { PageSection } from '@/types';

export async function fetchPageContent(page: string) {
  const { data } = await axios.get<PageSection[]>(`/api/content/${page}`);
  return data;
}

export async function fetchAllContent() {
  const { data } = await axiosInstance.get<PageSection[]>('/admin/content');
  return data;
}

export async function upsertSection(page: string, sectionKey: string, contentJson: string) {
  const { data } = await axiosInstance.put<PageSection>(`/admin/content/${page}/${sectionKey}`, {
    contentJson,
  });
  return data;
}
