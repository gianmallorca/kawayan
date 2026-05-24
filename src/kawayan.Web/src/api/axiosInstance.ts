import axios from 'axios';
import { refreshSession } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    if (!original || error.response?.status !== 401 || original._retry) return Promise.reject(error);

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push((token) => {
          if (!token) return reject(error);
          original.headers.Authorization = `Bearer ${token}`;
          resolve(axiosInstance(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;
    try {
      const data = await refreshSession();
      if (!data) throw new Error('refresh failed');
      queue.forEach((cb) => cb(data.accessToken));
      queue = [];
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return axiosInstance(original);
    } catch {
      useAuthStore.getState().clearAuth();
      queue.forEach((cb) => cb(null));
      queue = [];
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
