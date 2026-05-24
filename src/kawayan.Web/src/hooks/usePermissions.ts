import { useAuthStore } from '@/store/authStore';

export function usePermissions() {
  const permissions = useAuthStore((s) => s.user?.permissions ?? []);
  const has = (permission: string) => permissions.includes(permission);
  return { permissions, has };
}
