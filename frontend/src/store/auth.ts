import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRef } from '@/lib/types';

interface AuthState {
  accessToken: string | null;
  user: UserRef | null;
  hydrated: boolean;
  setAccessToken: (token: string | null) => void;
  setUser: (user: UserRef | null) => void;
  setHydrated: (v: boolean) => void;
  clear: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      hydrated: false,

      setAccessToken: (accessToken) => set({ accessToken }),
      setUser: (user) => set({ user }),
      setHydrated: (hydrated) => set({ hydrated }),

      clear: () =>
        set({
          accessToken: null,
          user: null,
        }),
    }),
    {
      name: 'sync-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);