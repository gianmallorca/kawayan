import axios from 'axios';
import axiosInstance from './axiosInstance';
import type { ArticleAdmin, ArticleDetail, ArticleListItem, PagedResult } from '@/types';

export async function fetchPublishedArticles(limit?: number) {
  const { data } = await axios.get<ArticleListItem[]>('/api/articles', {
    params: limit ? { limit } : undefined,
  });
  return data;
}

export async function fetchPublishedArticle(slug: string) {
  const { data } = await axios.get<ArticleDetail>(`/api/articles/${encodeURIComponent(slug)}`);
  return data;
}

export async function fetchAdminArticles(params: { page: number; pageSize: number }) {
  const { data } = await axiosInstance.get<PagedResult<ArticleAdmin>>('/admin/articles', { params });
  return data;
}

export async function fetchAdminArticle(id: number) {
  const { data } = await axiosInstance.get<ArticleAdmin>(`/admin/articles/${id}`);
  return data;
}

export type ArticlePayload = {
  title: string;
  slug: string;
  description: string;
  content: string;
  imageUrl?: string;
  imageDescription?: string;
  fullName?: string;
  isPublished: boolean;
};

export async function createArticle(payload: ArticlePayload) {
  const { data } = await axiosInstance.post<ArticleAdmin>('/admin/articles', payload);
  return data;
}

export async function updateArticle(id: number, payload: ArticlePayload) {
  const { data } = await axiosInstance.put<ArticleAdmin>(`/admin/articles/${id}`, payload);
  return data;
}

export async function deleteArticle(id: number) {
  await axiosInstance.delete(`/admin/articles/${id}`);
}
