"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  color?: "mint" | "gold" | "coral" | "midnight";
  description?: string;
}

const colorStyles = {
  mint: "from-mint/20 to-mint/5 border-mint/20 text-mint bg-mint/5",
  gold: "from-gold/20 to-gold/5 border-gold/20 text-gold bg-gold/5",
  coral: "from-coral/20 to-coral/5 border-coral/20 text-coral bg-coral/5",
  midnight: "from-charcoal/20 to-charcoal/5 border-charcoal/20 text-charcoal bg-charcoal/5",
};

const iconBackgrounds = {
  mint: "bg-mint text-midnight shadow-lg shadow-mint/20",
  gold: "bg-gold text-midnight shadow-lg shadow-gold/20",
  coral: "bg-coral text-white shadow-lg shadow-coral/20",
  midnight: "bg-charcoal text-warm-white shadow-lg shadow-charcoal/20",
};

export function StatsCard({ title, value, icon: Icon, trend, color = "mint", description }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={cn(
        "relative overflow-hidden p-6 rounded-3xl border backdrop-blur-sm bg-gradient-to-br transition-all duration-300",
        colorStyles[color]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-3 rounded-2xl", iconBackgrounds[color])}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">
                {title}
              </p>
              <h3 className="text-3xl font-heading font-bold text-text-primary mt-1">
                {value}
              </h3>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {trend && (
              <span className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                trend.isUp ? "bg-mint/10 text-mint" : "bg-coral/10 text-coral"
              )}>
                {trend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {trend.value}%
              </span>
            )}
            <p className="text-xs text-text-muted font-medium">
              {description || "from last month"}
            </p>
          </div>
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute -right-4 -bottom-4 opacity-10">
        <Icon size={120} strokeWidth={1} />
      </div>
    </motion.div>
  );
}
