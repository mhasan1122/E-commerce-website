"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/authStore";
import { useWishlistStore } from "@/lib/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const token = useAuthStore((s) => s.token);
  const syncWishlist = useWishlistStore((s) => s.syncFromServer);
  const clearWishlist = useWishlistStore((s) => s.clear);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (token) {
      void syncWishlist();
      return;
    }
    clearWishlist();
  }, [token, syncWishlist, clearWishlist]);

  return <>{children}</>;
}
