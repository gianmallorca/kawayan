import axios from 'axios';
import axiosInstance from './axiosInstance';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types';

export type LoginResponse = { accessToken: string; user: User };

let bootstrapPromise: Promise<LoginResponse | null> | null = null;

export async function login(email: string, password: string) {
  const { data } = await axios.post<LoginResponse>('/api/auth/login', { email, password }, { withCredentials: true });
  useAuthStore.getState().setAuth(data.accessToken, data.user);
  bootstrapPromise = null;
  return data;
}

export async function refreshSession(): Promise<LoginResponse | null> {
  try {
    const { data } = await axios.post<LoginResponse>('/api/auth/refresh', null, { withCredentials: true });
    useAuthStore.getState().setAuth(data.accessToken, data.user);
    return data;
  } catch {
    useAuthStore.getState().clearAuth();
    bootstrapPromise = null;
    return null;
  }
}

/** Restores session from refresh cookie once per page load (StrictMode-safe). */
export function bootstrapAuth() {
  if (!bootstrapPromise) {
    bootstrapPromise = refreshSession();
  }
  return bootstrapPromise;
}

export async function logout() {
  try {
    await axiosInstance.post('/auth/logout');
  } finally {
    useAuthStore.getState().clearAuth();
    bootstrapPromise = null;
  }
}
