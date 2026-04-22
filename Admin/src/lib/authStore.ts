"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AdminUser, AuthResponse } from "./types";
import { http } from "./api";

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AdminUser>;
  register: (name: string, email: string, password: string) => Promise<AdminUser>;
  fetchMe: () => Promise<void>;
  logout: () => void;
  setReady: (b: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      ready: false,

      login: async (email, password) => {
        const data = await http.post<AuthResponse>(
          "/auth/login?role=admin",
          { email, password },
          { auth: false }
        );
        if (typeof window !== "undefined") {
          localStorage.setItem("adminToken", data.token);
        }
        set({ user: data.user, token: data.token });
        return data.user;
      },

      register: async (name, email, password) => {
        // Public register → always creates role=user; we then rely on an existing
        // admin to promote via adminCreateUser. For admin-app registration to
        // actually create an admin, call /auth/admin/create-user while logged-in
        // as an admin. Here we expose a standard register that creates a user.
        const data = await http.post<AuthResponse>(
          "/auth/register",
          { name, email, password },
          { auth: false }
        );
        if (typeof window !== "undefined") {
          localStorage.setItem("adminToken", data.token);
        }
        set({ user: data.user, token: data.token });
        return data.user;
      },

      fetchMe: async () => {
        const { token } = get();
        if (!token) {
          set({ ready: true });
          return;
        }
        try {
          const me = await http.get<{ success: true; user: AdminUser }>("/auth/me");
          set({ user: me.user, ready: true });
        } catch {
          if (typeof window !== "undefined") {
            localStorage.removeItem("adminToken");
          }
          set({ user: null, token: null, ready: true });
        }
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("adminToken");
        }
        set({ user: null, token: null });
      },

      setReady: (b) => set({ ready: b }),
    }),
    {
      name: "admin-auth",
      storage: createJSONStorage(() => (typeof window === "undefined" ? undefined as unknown as Storage : window.localStorage)),
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && typeof window !== "undefined") {
          localStorage.setItem("adminToken", state.token);
        }
      },
    }
  )
);
