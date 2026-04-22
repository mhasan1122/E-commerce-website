"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  Maximize,
  Languages,
  Calendar,
  Clock,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useAuthStore } from "@/lib/authStore";

export function Navbar() {
  const [time, setTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const initial =
    user?.name?.trim()?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "A";
  const avatar =
    user?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Admin")}&background=C8A97E&color=0a0a1a`;

  return (
    <header className="h-20 border-b border-border-subtle bg-surface/80 backdrop-blur-xl sticky top-0 z-40 px-8 flex items-center justify-between">
      <div className="relative group max-w-md w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted transition-colors group-focus-within:text-mint">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search products, orders, customers..."
          className="w-full bg-surface-elevated border border-border-subtle rounded-2xl py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all text-sm"
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-text-muted bg-white border border-border-subtle rounded uppercase">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-text-muted pr-6 border-r border-border-subtle">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-mint" />
            <span>{time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-mint" />
            <span>{time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2.5 rounded-xl text-text-secondary hover:bg-surface-elevated hover:text-mint transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-coral rounded-full border-2 border-surface" />
          </button>
          <button className="p-2.5 rounded-xl text-text-secondary hover:bg-surface-elevated hover:text-mint transition-all">
            <Languages className="w-5 h-5" />
          </button>
          <button className="p-2.5 rounded-xl text-text-secondary hover:bg-surface-elevated hover:text-mint transition-all">
            <Maximize className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-border-subtle mx-2" />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-full bg-mint/10 border border-mint/20 hover:scale-105 transition-transform flex items-center gap-2 group"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-white flex items-center justify-center text-xs font-bold text-midnight">
                {user?.avatarUrl ? (
                  <img src={avatar} alt="User" className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <span className="text-xs font-bold text-midnight pr-2 hidden md:block group-hover:text-mint-dark transition-colors">
                {user?.name || "Admin"}
              </span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 z-30 w-60 bg-white rounded-2xl border border-border-subtle shadow-xl overflow-hidden">
                <div className="p-4 border-b border-border-subtle">
                  <p className="text-sm font-bold text-midnight truncate">{user?.name}</p>
                  <p className="text-[11px] text-text-muted truncate mt-0.5">{user?.email}</p>
                  <span className="mt-2 inline-block px-2 py-0.5 rounded-md bg-mint/10 text-mint text-[9px] font-black uppercase tracking-wider">
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-text-secondary hover:bg-surface-elevated hover:text-midnight transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5" /> Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-coral hover:bg-coral/5 transition-colors border-t border-border-subtle"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
