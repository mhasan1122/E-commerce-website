"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Box,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  ShieldCheck,
  Tag,
  FileText,
  Warehouse,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/" },
  { icon: Box, label: "Products", href: "/products" },
  { icon: Warehouse, label: "Inventory", href: "/inventory" },
  { icon: ShoppingCart, label: "Orders", href: "/orders" },
  { icon: Users, label: "Customers", href: "/customers" },
  { icon: Tag, label: "Marketing", href: "/marketing" },
  { icon: FileText, label: "Content", href: "/cms" },
  { icon: ShieldCheck, label: "Staff & Roles", href: "/staff" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className={cn(
        "fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out bg-midnight/95 backdrop-blur-xl border-r border-pearl/10 text-warm-white overflow-hidden shadow-2xl shadow-midnight/50",
        collapsed && "items-center"
      )}
    >
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-4 h-24 mb-4 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint to-gold flex items-center justify-center flex-shrink-0 shadow-lg shadow-mint/20">
          <span className="text-midnight font-bold text-xl">A</span>
        </div>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="font-heading text-lg tracking-tight uppercase font-bold text-mint">
              Antigravity
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-medium opacity-60">
              Admin Suite v2.0
            </span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300",
                isActive 
                  ? "bg-mint text-midnight shadow-lg shadow-mint/10" 
                  : "text-warm-white/60 hover:text-warm-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "scale-110" : "group-hover:scale-110 transition-transform")} />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-medium tracking-tight"
                >
                  {item.label}
                </motion.span>
              )}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-midnight rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-white/5 bg-white/[0.02]">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-2xl transition-colors",
          !collapsed && "hover:bg-white/5"
        )}>
          <div className="w-10 h-10 rounded-full border-2 border-mint/20 p-0.5">
            <img 
              src="https://ui-avatars.com/api/?name=Admin+User&background=C8A97E&color=0a0a1a" 
              alt="Avatar" 
              className="w-full h-full rounded-full"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col flex-1 truncate">
              <span className="text-sm font-semibold text-warm-white">Hasan Mirza</span>
              <span className="text-[10px] text-mint/60 uppercase font-bold tracking-wider">Super Admin</span>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-coral/10 hover:text-coral rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mt-4 w-full flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 text-mint/60 hover:text-mint transition-all"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </motion.aside>
  );
}
