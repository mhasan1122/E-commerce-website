"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { http } from "./api";
import type { ApiUser, AuthResponse } from "./api-types";

interface AuthState {
  user: ApiUser | null;
  token: string | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<ApiUser>;
  register: (name: string, email: string, password: string) => Promise<ApiUser>;
  fetchMe: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      ready: false,

      login: async (email, password) => {
        const data = await http.post<AuthResponse>(
          "/auth/login",
          { email, password },
          { auth: false }
        );
        if (typeof window !== "undefined") {
          localStorage.setItem("userToken", data.token);
        }
        set({ user: data.user, token: data.token });
        return data.user;
      },

      register: async (name, email, password) => {
        const data = await http.post<AuthResponse>(
          "/auth/register",
          { name, email, password },
          { auth: false }
        );
        if (typeof window !== "undefined") {
          localStorage.setItem("userToken", data.token);
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
          const me = await http.get<{ success: true; user: ApiUser }>("/auth/me");
          set({ user: me.user, ready: true });
        } catch {
          if (typeof window !== "undefined") {
            localStorage.removeItem("userToken");
          }
          set({ user: null, token: null, ready: true });
        }
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("userToken");
        }
        set({ user: null, token: null });
      },
    }),
    {
      name: "user-auth",
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? (undefined as unknown as Storage) : window.localStorage
      ),
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token && typeof window !== "undefined") {
          localStorage.setItem("userToken", state.token);
        }
      },
    }
  )
);
