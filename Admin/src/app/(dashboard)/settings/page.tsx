"use client";

import React, { useState } from "react";
import { 
  Settings, 
  Store, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  Bell, 
  Globe, 
  Database,
  Mail,
  Zap,
  ChevronRight,
  Save,
  Moon,
  Sun
} from "lucide-react";
import { cn } from "@/lib/utils";

const settingTabs = [
  { id: "general", label: "General Store", icon: Store },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "shipping", label: "Shipping & Delivery", icon: Truck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security & Staff", icon: ShieldCheck },
  { id: "advanced", label: "Advanced / API", icon: Database },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight">
            Store <span className="text-mint">Settings</span>
          </h1>
          <p className="text-text-muted mt-1 font-medium italic">
            Configure your store preferences, integrations, and global parameters.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-midnight text-warm-white font-bold text-sm shadow-xl shadow-midnight/20 hover:scale-[1.02] transition-all">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="space-y-1">
           {settingTabs.map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={cn(
                 "w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all group",
                 activeTab === tab.id 
                   ? "bg-mint text-midnight shadow-lg shadow-mint/10" 
                   : "text-text-muted hover:bg-surface-elevated hover:text-midnight"
               )}
             >
               <div className="flex items-center gap-3">
                  <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "scale-110" : "group-hover:scale-110 transition-transform")} />
                  <span className="text-sm font-bold tracking-tight">{tab.label}</span>
               </div>
               <ChevronRight className={cn("w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity", activeTab === tab.id && "opacity-100")} />
             </button>
           ))}
        </div>

        {/* Settings Content Area */}
        <div className="lg:col-span-3 space-y-8">
           {/* Section 1: Content depending on tab */}
           <div className="glass-card p-10 border border-border-subtle relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-mint/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/2" />
              
              <div className="relative z-10 space-y-10">
                 <div className="flex items-center justify-between border-b border-border-subtle pb-6">
                    <div>
                       <h2 className="text-xl font-heading font-bold capitalize">{activeTab} Details</h2>
                       <p className="text-xs text-text-muted font-medium mt-1">Manage these settings carefully as they affect your live store.</p>
                    </div>
                    <div className="p-3 rounded-2xl bg-midnight/5 text-midnight">
                       <Settings className="w-6 h-6 animate-spin-slow" />
                    </div>
                 </div>

                 {/* Mock Fields for General Tab */}
                 {activeTab === "general" && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-text-muted tracking-widest px-1">Store Name</label>
                         <input type="text" defaultValue="Antigravity Luxury Store" className="w-full bg-surface-elevated border border-border-subtle rounded-xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-text-muted tracking-widest px-1">Store Email</label>
                         <input type="email" defaultValue="hello@antigravity.shop" className="w-full bg-surface-elevated border border-border-subtle rounded-xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-text-muted tracking-widest px-1">Currency</label>
                         <select className="w-full bg-surface-elevated border border-border-subtle rounded-xl px-5 py-3 text-sm font-bold appearance-none">
                            <option>BDT (৳)</option>
                            <option>USD ($)</option>
                            <option>EUR (€)</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-text-muted tracking-widest px-1">Timezone</label>
                         <select className="w-full bg-surface-elevated border border-border-subtle rounded-xl px-5 py-3 text-sm font-bold appearance-none">
                            <option>(GMT+06:00) Dhaka</option>
                            <option>(GMT+00:00) UTC</option>
                         </select>
                      </div>
                   </div>
                 )}

                 {/* Placeholder for other tabs */}
                 {activeTab !== "general" && (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                       <Zap className="w-12 h-12 text-mint/20 mb-4" />
                       <h3 className="font-heading font-bold text-lg text-text-secondary">Configuring {activeTab}...</h3>
                       <p className="text-xs text-text-muted max-w-xs mt-2">Loading advanced configuration interface for checkout and global parameters.</p>
                    </div>
                 )}

                 <div className="pt-8 border-t border-border-subtle flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-midnight/5 flex items-center justify-center text-midnight">
                          <Globe className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-midnight">Store Status: <span className="text-mint">Live</span></p>
                          <p className="text-[10px] text-text-muted font-medium">Accessible at shop.antigravity.io</p>
                       </div>
                    </div>
                    <button className="text-xs font-bold text-coral hover:underline focus:outline-none">
                       Put Store in Maintenance Mode
                    </button>
                 </div>
              </div>
           </div>

           {/* Security / System Stats */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-8 border border-border-subtle flex items-start gap-5">
                 <div className="p-3 rounded-2xl bg-coral/10 text-coral">
                    <Mail className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="font-bold text-sm text-midnight">Email Server</h3>
                    <p className="text-xs text-text-muted mt-1 font-medium leading-relaxed">
                       Sending via Amazon SES. Verification status: <span className="text-mint font-bold italic">Verified</span>
                    </p>
                 </div>
              </div>
              <div className="glass-card p-8 border border-border-subtle flex items-start gap-5">
                 <div className="p-3 rounded-2xl bg-midnight/5 text-midnight">
                    <Zap className="w-5 h-5" />
                 </div>
                 <div>
                    <h3 className="font-bold text-sm text-midnight">Environment</h3>
                    <p className="text-xs text-text-muted mt-1 font-medium leading-relaxed">
                       Production v2.4.1. Last build: 4 hours ago.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
