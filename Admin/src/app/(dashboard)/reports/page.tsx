"use client";

import React from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  Users,
  Target
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const reportStats = [
  { label: "Gross Sales", value: 4528400, trend: "+12.4%", isUp: true, icon: DollarSign },
  { label: "Net Profit", value: 1284500, trend: "+8.2%", isUp: true, icon: TrendingUp },
  { label: "Avg. Order Value", value: 12450, trend: "-2.1%", isUp: false, icon: ShoppingCart },
  { label: "Acquisition Cost", value: 850, trend: "+4.5%", isUp: false, icon: Target },
];

export default function ReportsPage() {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight">
            Sales & <span className="text-mint">Analytics</span>
          </h1>
          <p className="text-text-muted mt-1 font-medium">
            Monitor store performance, financial trends, and customer acquisition.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-1 bg-surface-elevated rounded-xl border border-border-subtle">
             {["Day", "Week", "Month", "Year"].map(t => (
               <button key={t} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all", t === "Month" ? "bg-white text-midnight shadow-sm" : "text-text-muted hover:text-midnight")}>
                  {t}
               </button>
             ))}
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-midnight text-warm-white font-bold text-sm shadow-xl shadow-midnight/20 hover:scale-[1.02] transition-all">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {reportStats.map((stat) => (
           <div key={stat.label} className="glass-card p-6 border border-border-subtle">
              <div className="flex items-center justify-between mb-4">
                 <div className="p-2.5 rounded-xl bg-midnight/5 text-midnight">
                    <stat.icon className="w-5 h-5" />
                 </div>
                 <span className={cn(
                   "flex items-center gap-0.5 text-[10px] font-black uppercase",
                   stat.isUp ? "text-mint" : "text-coral"
                 )}>
                   {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                   {stat.trend}
                 </span>
              </div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-heading font-bold text-midnight mt-1">
                 {typeof stat.value === 'number' ? formatPrice(stat.value) : stat.value}
              </h3>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Performance Chart Simulation */}
        <div className="lg:col-span-2 glass-card p-8 border border-border-subtle">
           <div className="flex items-center justify-between mb-10">
              <div>
                 <h2 className="text-xl font-heading font-bold">Revenue Distribution</h2>
                 <p className="text-xs text-text-muted font-medium">Daily income vs target goals</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-mint" />
                    <span className="text-[10px] font-bold text-text-muted">Direct</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-midnight" />
                    <span className="text-[10px] font-bold text-text-muted">Marketing</span>
                 </div>
              </div>
           </div>

           <div className="h-[300px] flex items-end justify-between gap-4">
              {[65, 45, 80, 55, 90, 70, 85, 40, 75, 95, 60, 50].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                   <div className="w-full relative group">
                      <div className="h-40 w-full bg-surface-elevated rounded-t-lg overflow-hidden flex flex-col justify-end">
                         <div 
                           className="w-full bg-mint group-hover:brightness-110 transition-all duration-1000" 
                           style={{ height: `${h}%` }}
                         />
                      </div>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-midnight text-white px-2 py-1 rounded text-[9px] font-bold shadow-xl">
                         {formatPrice(h * 1500)}
                      </div>
                   </div>
                   <span className="text-[9px] font-bold text-text-muted uppercase">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Top Channels */}
        <div className="glass-card p-8 border border-border-subtle">
           <h2 className="text-xl font-heading font-bold mb-8">Traffic Sources</h2>
           <div className="space-y-6">
              {[
                { label: "Search Engines", value: "48%", color: "bg-mint" },
                { label: "Social Media", value: "24%", color: "bg-midnight" },
                { label: "Direct Access", value: "18%", color: "bg-gold" },
                { label: "Email Marketing", value: "10%", color: "bg-coral" },
              ].map((channel) => (
                <div key={channel.label} className="space-y-2">
                   <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-text-secondary">{channel.label}</span>
                      <span className="text-midnight">{channel.value}</span>
                   </div>
                   <div className="h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-1000", channel.color)} style={{ width: channel.value }} />
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-12 p-6 rounded-3xl bg-midnight text-warm-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-mint/5 blur-3xl rounded-full" />
              <div className="relative z-10">
                 <h4 className="text-sm font-bold text-mint">Conversion Insight</h4>
                 <p className="text-[11px] text-warm-white/70 mt-2 font-medium leading-relaxed italic">
                    "Your conversion rate is 4.2% higher than the industry average for luxury goods."
                 </p>
                 <button className="mt-4 text-[10px] font-black uppercase text-mint hover:underline tracking-widest">
                    View full Audit
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
