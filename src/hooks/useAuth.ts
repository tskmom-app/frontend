import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { authStore } from '@/lib/auth';
import { queryClient } from '@/lib/queryClient';

export function useAuth() {
  const navigate = useNavigate();
  const admin = authStore.getAdmin();

  const logout = useCallback(() => {
    authStore.clear();
    queryClient.clear();
    navigate('/admin/login', { replace: true });
  }, [navigate]);

  return { admin, isAuthenticated: authStore.isAuthenticated(), logout };
}
