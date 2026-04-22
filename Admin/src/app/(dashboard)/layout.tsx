"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { ToastProvider } from "@/components/Toast";
import { useAuthStore } from "@/lib/authStore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.ready);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    // Rehydrate from persisted token & validate against /auth/me
    fetchMe();
  }, [fetchMe]);

  useEffect(() => {
    if (!ready) return;
    if (!token || !user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin") {
      useAuthStore.getState().logout();
      router.replace("/login");
    }
  }, [ready, token, user, router]);

  if (!ready || !token || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex items-center gap-3 text-text-muted">
          <Loader2 className="w-5 h-5 animate-spin text-mint" />
          <span className="text-sm font-medium">Verifying session…</span>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <Sidebar />
      <main className="transition-all duration-300 pl-[280px]">
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <div className="flex-1 p-8 overflow-y-auto">{children}</div>
        </div>
      </main>

      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-40">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-mint/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-gold/5 blur-[100px] rounded-full" />
      </div>
    </ToastProvider>
  );
}
