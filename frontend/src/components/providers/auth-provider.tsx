'use client';

import { useEffect } from 'react';
import { useAuth } from '@/store/auth';
import { api } from '@/lib/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const accessToken = useAuth((s) => s.accessToken);
  const user = useAuth((s) => s.user);
  const setAccessToken = useAuth((s) => s.setAccessToken);
  const setUser = useAuth((s) => s.setUser);
  const setHydrated = useAuth((s) => s.setHydrated);

  useEffect(() => {
    (async () => {
      try {
        const { accessToken } = await api<{ accessToken: string }>(
          '/api/auth/refresh',
          {
            method: 'POST',
            skipAuth: true,
          }
        );

        setAccessToken(accessToken);

        const me = await api<{
          id: string;
          name: string;
          email: string;
          avatarUrl?: string;
        }>('/api/auth/me');

        setUser({
          _id: me.id,
          name: me.name,
          email: me.email,
          avatarUrl: me.avatarUrl,
        });
      } catch {
        // Refresh token may fail in production if cookie is missing.
        // Keep persisted Zustand auth instead of forcing logout.
        if (accessToken && user) {
          setAccessToken(accessToken);
          setUser(user);
        }
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  return <>{children}</>;
}