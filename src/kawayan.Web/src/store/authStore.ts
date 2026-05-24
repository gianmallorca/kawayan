import { create } from 'zustand';
import type { User } from '@/types';

const ACCESS_KEY = 'auth.accessToken';
const USER_KEY = 'auth.user';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

function readStoredAuth(): Pick<AuthState, 'accessToken' | 'user'> {
  if (typeof sessionStorage === 'undefined') {
    return { accessToken: null, user: null };
  }
  try {
    const accessToken = sessionStorage.getItem(ACCESS_KEY);
    const userRaw = sessionStorage.getItem(USER_KEY);
    if (!accessToken || !userRaw) return { accessToken: null, user: null };
    return { accessToken, user: JSON.parse(userRaw) as User };
  } catch {
    return { accessToken: null, user: null };
  }
}

function persistAuth(accessToken: string | null, user: User | null) {
  if (typeof sessionStorage === 'undefined') return;
  if (!accessToken || !user) {
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(USER_KEY);
    return;
  }
  sessionStorage.setItem(ACCESS_KEY, accessToken);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export const useAuthStore = create<AuthState>((set) => ({
  ...readStoredAuth(),
  setAuth: (accessToken, user) => {
    persistAuth(accessToken, user);
    set({ accessToken, user });
  },
  clearAuth: () => {
    persistAuth(null, null);
    set({ accessToken: null, user: null });
  },
}));
