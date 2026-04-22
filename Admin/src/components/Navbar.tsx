"use client";

import React from "react";
import { 
  Bell, 
  Search, 
  Settings, 
  Maximize, 
  Moon, 
  Sun, 
  Languages,
  Calendar,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-20 border-b border-border-subtle bg-surface/80 backdrop-blur-xl sticky top-0 z-40 px-8 flex items-center justify-between">
      {/* Search Bar */}
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

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        {/* Date & Time */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-text-muted pr-6 border-r border-border-subtle">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-mint" />
            <span>{time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-mint" />
            <span>{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Global Controls */}
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

          <button className="p-1.5 rounded-full bg-mint/10 border border-mint/20 hover:scale-105 transition-transform flex items-center gap-2 group">
             <div className="w-7 h-7 rounded-full overflow-hidden bg-white">
                <img src="https://ui-avatars.com/api/?name=Hasan+Mirza&background=C8A97E&color=0a0a1a" alt="User" />
             </div>
             <span className="text-xs font-bold text-midnight pr-2 hidden md:block group-hover:text-mint-dark transition-colors">Admin Portal</span>
          </button>
        </div>
      </div>
    </header>
  );
}
