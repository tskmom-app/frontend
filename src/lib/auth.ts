import type { Admin } from '@/types/api';

const TOKEN_KEY = 'tskmom.token';
const ADMIN_KEY = 'tskmom.admin';

export const authStore = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  getAdmin(): Admin | null {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Admin;
    } catch {
      return null;
    }
  },
  set(token: string, admin: Admin): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  },
  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },
};
