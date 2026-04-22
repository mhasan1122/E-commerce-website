"use client";

import React, { useState } from "react";
import { 
  Tag, Ticket, Zap, Gift, Layout, MessageSquare, Share2, BarChart,
  Plus, MoreVertical, Calendar, MousePointer2, Image as ImageIcon, Trash2, Edit, Copy, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { AnimatePresence, motion } from "framer-motion";

type Coupon = {
  id: number;
  code: string;
  discount: string;
  type: string;
  usage: string;
  status: "Active" | "Scheduled" | "Expired";
  expiry: string;
};

type Campaign = {
  name: string;
  type: string;
  reach: string;
  conversion: string;
  status: "Live" | "Active" | "Draft";
};

const initialCoupons: Coupon[] = [
  { id: 1, code: "SUMMER40", discount: "40% OFF", type: "Percentage", usage: "142/500", status: "Active", expiry: "2026-06-30" },
  { id: 2, code: "WELCOME100", discount: "৳100 OFF", type: "Fixed Amount", usage: "Unlimited", status: "Active", expiry: "No Expiry" },
  { id: 3, code: "EID2026", discount: "25% OFF", type: "Percentage", usage: "0/1000", status: "Scheduled", expiry: "2026-05-15" },
];

const initialCampaigns: Campaign[] = [
  { name: "Eid-ul-Adha Mega Sale", type: "Flash Sale", reach: "45.2k", conversion: "3.2%", status: "Live" },
  { name: "First Purchase Bundle", type: "Bundle offer", reach: "12.8k", conversion: "5.8%", status: "Active" },
  { name: "Referral Program v2", type: "Referral", reach: "8.4k", conversion: "12.4%", status: "Live" },
];

const couponTypes = ["Percentage", "Fixed Amount", "Free Shipping", "Buy X Get Y"];
const campaignTypes = ["Flash Sale", "Bundle offer", "Referral", "Loyalty", "Seasonal", "Email", "SMS"];

const emptyCouponForm = { code: "", discount: "", type: "", limit: "", expiry: "" };
const emptyCampaignForm = { name: "", type: "", description: "" };

export default function MarketingPage() {
  const { toast } = useToast();
  const [activeSegment, setActiveSegment] = useState("coupons");
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showPopupBuilder, setShowPopupBuilder] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [couponForm, setCouponForm] = useState(emptyCouponForm);
  const [campaignForm, setCampaignForm] = useState(emptyCampaignForm);
  const [openMenuId, setOpenMenuId] = useState<number | string | null>(null);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const newCoupon: Coupon = {
      id: Date.now(),
      code: couponForm.code.toUpperCase(),
      discount: couponForm.discount,
      type: couponForm.type,
      usage: couponForm.limit ? `0/${couponForm.limit}` : "Unlimited",
      status: "Active",
      expiry: couponForm.expiry || "No Expiry",
    };
    setCoupons((prev) => [newCoupon, ...prev]);
    setShowCouponModal(false);
    setCouponForm(emptyCouponForm);
    toast(`Coupon "${newCoupon.code}" created!`);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const newCampaign: Campaign = {
      name: campaignForm.name,
      type: campaignForm.type,
      reach: "0",
      conversion: "0%",
      status: "Draft",
    };
    setCampaigns((prev) => [...prev, newCampaign]);
    setShowCampaignModal(false);
    setCampaignForm(emptyCampaignForm);
    toast(`Campaign "${newCampaign.name}" created!`);
  };

  const handleDeleteCoupon = (coupon: Coupon) => {
    setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
    setOpenMenuId(null);
    toast(`Coupon "${coupon.code}" deleted.`, "error");
  };

  const handleCopyCoupon = (coupon: Coupon) => {
    navigator.clipboard.writeText(coupon.code).then(() => toast(`Code "${coupon.code}" copied!`)).catch(() => toast(`Code: ${coupon.code}`, "info"));
    setOpenMenuId(null);
  };

  const segments = [
    { id: "coupons", label: "Coupons", icon: Ticket },
    { id: "campaigns", label: "Campaigns", icon: Zap },
    { id: "loyalty", label: "Loyalty", icon: Gift },
    { id: "banners", label: "Banners", icon: ImageIcon },
    { id: "referrals", label: "Referrals", icon: Share2 },
    { id: "popups", label: "Popups", icon: MousePointer2 },
  ];

  return (
    <div className="space-y-8 animate-fade-in" onClick={() => setOpenMenuId(null)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight">
            Marketing & <span className="text-mint">Promotions</span>
          </h1>
          <p className="text-text-muted mt-1 font-medium italic">
            Drive sales with coupons, flash sales, and targeted marketing campaigns.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowPopupBuilder(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-surface-elevated text-text-secondary font-bold text-sm border border-border-subtle hover:bg-white transition-all">
            <Layout className="w-4 h-4" /> Popup Builder
          </button>
          <button onClick={() => activeSegment === "coupons" ? setShowCouponModal(true) : setShowCampaignModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-midnight text-warm-white font-bold text-sm shadow-xl shadow-midnight/20 hover:scale-[1.02] transition-all">
            <Plus className="w-4 h-4" /> {activeSegment === "coupons" ? "Create Coupon" : "Start Campaign"}
          </button>
        </div>
      </div>

      {/* Navigation Segments */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {segments.map((item) => (
          <button key={item.id} onClick={() => setActiveSegment(item.id)}
            className={cn("flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all group",
              activeSegment === item.id
                ? "bg-mint text-midnight border-mint shadow-lg shadow-mint/20"
                : "bg-surface-elevated border-border-subtle text-text-muted hover:border-mint/30 hover:text-midnight")}>
            <item.icon className={cn("w-6 h-6", activeSegment === item.id ? "scale-110" : "group-hover:scale-110 transition-transform")} />
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeSegment === "coupons" ? (
            <div className="glass-card border border-border-subtle overflow-hidden">
              <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                <h2 className="text-lg font-heading font-bold">Active Coupons</h2>
                <div className="relative group">
                  <input type="text" placeholder="Search codes..."
                    className="bg-surface-elevated border border-border-subtle rounded-xl px-4 py-1.5 text-xs focus:ring-1 focus:ring-mint transition-all" />
                </div>
              </div>
              <div className="divide-y divide-border-subtle/40">
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="p-5 flex items-center justify-between group hover:bg-surface-elevated/50 transition-colors" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-6">
                      <div className="font-mono text-sm font-black bg-midnight/5 px-3 py-1 rounded border border-dashed border-midnight/20 text-midnight group-hover:bg-mint/10 group-hover:border-mint/40 transition-colors">
                        {coupon.code}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-midnight">{coupon.discount}</span>
                        <span className="text-[10px] font-medium text-text-muted uppercase tracking-tighter">{coupon.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="hidden md:flex flex-col text-right">
                        <span className="text-xs font-bold text-text-secondary">{coupon.usage} used</span>
                        <span className="text-[9px] font-medium text-text-muted uppercase tracking-widest flex items-center gap-1 justify-end">
                          <Calendar className="w-2.5 h-2.5" /> Exp: {coupon.expiry}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                          coupon.status === "Active" ? "bg-mint/10 text-mint" : coupon.status === "Scheduled" ? "bg-gold/10 text-gold" : "bg-coral/10 text-coral")}>
                          {coupon.status}
                        </span>
                        <div className="relative">
                          <button onClick={() => setOpenMenuId(openMenuId === coupon.id ? null : coupon.id)}
                            className="p-2 rounded-lg text-text-muted hover:bg-white hover:text-midnight transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <AnimatePresence>
                            {openMenuId === coupon.id && (
                              <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                className="absolute right-0 top-10 z-20 w-44 bg-white rounded-2xl border border-border-subtle shadow-xl overflow-hidden">
                                <button onClick={() => handleCopyCoupon(coupon)}
                                  className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-text-secondary hover:bg-surface-elevated hover:text-midnight transition-colors">
                                  <Copy className="w-3.5 h-3.5" /> Copy Code
                                </button>
                                <button onClick={() => { toast(`Editing coupon ${coupon.code}...`, "info"); setOpenMenuId(null); }}
                                  className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-text-secondary hover:bg-surface-elevated hover:text-midnight transition-colors">
                                  <Edit className="w-3.5 h-3.5" /> Edit Coupon
                                </button>
                                <button onClick={() => handleDeleteCoupon(coupon)}
                                  className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-coral hover:bg-coral/5 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {coupons.length === 0 && (
                  <div className="p-12 text-center text-text-muted font-medium">No coupons yet. Create one!</div>
                )}
              </div>
            </div>
          ) : activeSegment === "campaigns" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {campaigns.map((c) => (
                <div key={c.name} className="glass-card p-6 border border-border-subtle group hover:border-mint/30 transition-all bg-gradient-to-br from-white to-mint/[0.02]">
                  <div className="flex items-center justify-between mb-6">
                    <div className="px-3 py-1 rounded-full bg-midnight/5 text-midnight text-[9px] font-black uppercase tracking-widest">{c.type}</div>
                    <div className="flex items-center gap-1">
                      <div className={cn("w-1.5 h-1.5 rounded-full", c.status === "Draft" ? "bg-gold" : "bg-mint animate-pulse")} />
                      <span className={cn("text-[9px] font-bold uppercase", c.status === "Draft" ? "text-gold" : "text-mint")}>{c.status}</span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-midnight">{c.name}</h3>
                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-2xl bg-surface-elevated flex flex-col items-center">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Reach</span>
                      <span className="text-lg font-black text-midnight">{c.reach}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-surface-elevated flex flex-col items-center">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Conv. Rate</span>
                      <span className="text-lg font-black text-mint">{c.conversion}</span>
                    </div>
                  </div>
                  <button onClick={() => toast(`Viewing analytics for "${c.name}"`, "info")}
                    className="w-full mt-6 py-2.5 rounded-xl bg-midnight text-warm-white text-xs font-bold hover:scale-[1.02] transition-all group-hover:bg-mint group-hover:text-midnight">
                    View Analytics
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-12 border border-border-subtle flex flex-col items-center justify-center text-center gap-4">
              {(() => { const seg = segments.find((s) => s.id === activeSegment); const Icon = seg?.icon || Tag; return <Icon className="w-16 h-16 text-mint/20" />; })()}
              <h3 className="text-xl font-heading font-bold text-midnight capitalize">{activeSegment} Manager</h3>
              <p className="text-sm text-text-secondary max-w-sm">Configure and manage your {activeSegment} settings from this panel.</p>
              <button onClick={() => toast(`${activeSegment} manager coming soon!`, "info")}
                className="mt-4 px-8 py-3 rounded-2xl bg-midnight text-warm-white font-bold text-sm hover:scale-105 transition-all shadow-xl shadow-midnight/20">
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 border border-border-subtle bg-midnight text-warm-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-mint/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 opacity-20" />
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-2xl bg-mint/10 text-mint"><BarChart className="w-5 h-5" /></div>
              <div>
                <h3 className="font-heading font-bold text-base text-mint">March Insights</h3>
                <p className="text-xs text-warm-white/70 mt-1 leading-relaxed">
                  Coupons accounted for <span className="text-warm-white font-bold">18%</span> of total revenue this month. Promo code <span className="text-mint font-bold italic">SUMMER40</span> was the top performer.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-border-subtle">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6">Marketing Queue</h3>
            <div className="space-y-4">
              {[
                { title: "Weekly Newsletter", time: "Tonight 8:00 PM", icon: MessageSquare, color: "text-mint bg-mint/10" },
                { title: "Homepage Banner Swap", time: "May 1st, 12:00 AM", icon: ImageIcon, color: "text-gold bg-gold/10" },
                { title: "Instagram Flash Sale", time: "May 5th, 6:00 PM", icon: Share2, color: "text-coral bg-coral/10" },
              ].map((item) => (
                <button key={item.title} onClick={() => toast(`Editing "${item.title}"...`, "info")}
                  className="w-full flex gap-4 group cursor-pointer p-1 rounded-xl hover:bg-surface-elevated transition-colors text-left">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110", item.color)}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="text-[11px] font-bold text-midnight group-hover:text-mint transition-colors">{item.title}</h4>
                    <span className="text-[9px] font-medium text-text-muted uppercase tracking-tight">{item.time}</span>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setShowCalendar(true)}
              className="w-full mt-8 py-3 rounded-2xl border border-dashed border-border-subtle text-[10px] font-black uppercase tracking-widest text-text-muted hover:border-mint hover:text-mint transition-all">
              Access Marketing Calendar
            </button>
          </div>

          <div className="p-4 rounded-3xl bg-mint/[0.03] border border-mint/10 flex items-start gap-3">
            <Zap className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-text-secondary italic font-medium leading-relaxed">
              "Try scheduling flash sales during peak traffic hours (8 PM - 11 PM) for maximum conversion."
            </p>
          </div>
        </div>
      </div>

      {/* Create Coupon Modal */}
      <Modal open={showCouponModal} onClose={() => setShowCouponModal(false)} title="Create New Coupon">
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Coupon Code *</label>
            <input required value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm font-mono font-bold focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="e.g. SUMMER40" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Discount Value *</label>
              <input required value={couponForm.discount} onChange={(e) => setCouponForm({ ...couponForm, discount: e.target.value })}
                className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="e.g. 40% OFF or ৳100" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Type *</label>
              <select required value={couponForm.type} onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all">
                <option value="">Select type</option>
                {couponTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Usage Limit</label>
              <input type="number" min="0" value={couponForm.limit} onChange={(e) => setCouponForm({ ...couponForm, limit: e.target.value })}
                className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="Leave blank = unlimited" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Expiry Date</label>
              <input type="date" value={couponForm.expiry} onChange={(e) => setCouponForm({ ...couponForm, expiry: e.target.value })}
                className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCouponModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all">
              Create Coupon
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Campaign Modal */}
      <Modal open={showCampaignModal} onClose={() => setShowCampaignModal(false)} title="Start New Campaign">
        <form onSubmit={handleCreateCampaign} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Campaign Name *</label>
            <input required value={campaignForm.name} onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="e.g. Eid Sale Campaign" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Campaign Type *</label>
            <select required value={campaignForm.type} onChange={(e) => setCampaignForm({ ...campaignForm, type: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all">
              <option value="">Select type</option>
              {campaignTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Description</label>
            <textarea value={campaignForm.description} onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
              rows={3} placeholder="Describe the campaign goals..."
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCampaignModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all">
              Launch Campaign
            </button>
          </div>
        </form>
      </Modal>

      {/* Popup Builder Modal */}
      <Modal open={showPopupBuilder} onClose={() => setShowPopupBuilder(false)} title="Popup Builder" size="sm">
        <div className="space-y-4">
          {["Exit Intent Popup", "Newsletter Subscribe", "Promo Code Reveal", "Limited Time Offer"].map((name) => (
            <button key={name} onClick={() => { toast(`Opening "${name}" template...`, "info"); setShowPopupBuilder(false); }}
              className="w-full flex items-center justify-between p-4 rounded-2xl border border-border-subtle hover:border-mint/40 hover:bg-surface-elevated transition-all group">
              <div className="flex items-center gap-3">
                <MousePointer2 className="w-4 h-4 text-text-muted group-hover:text-mint" />
                <span className="text-sm font-bold text-midnight">{name}</span>
              </div>
              <span className="text-xs font-bold text-mint">Use Template →</span>
            </button>
          ))}
        </div>
      </Modal>

      {/* Marketing Calendar Modal */}
      <Modal open={showCalendar} onClose={() => setShowCalendar(false)} title="Marketing Calendar" size="lg">
        <div className="space-y-4">
          {[
            { date: "Apr 21", event: "Weekly Newsletter", channel: "Email", status: "Scheduled" },
            { date: "May 01", event: "Homepage Banner Swap", channel: "Website", status: "Planned" },
            { date: "May 05", event: "Instagram Flash Sale", channel: "Social", status: "Planned" },
            { date: "May 15", event: "EID2026 Coupon Activation", channel: "All Channels", status: "Auto" },
          ].map((item) => (
            <div key={item.event} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-elevated hover:bg-white transition-all">
              <div className="w-14 h-14 rounded-2xl bg-midnight text-warm-white flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-bold text-mint uppercase">{item.date.split(" ")[0]}</span>
                <span className="text-lg font-black">{item.date.split(" ")[1]}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-midnight">{item.event}</p>
                <p className="text-xs text-text-muted">{item.channel}</p>
              </div>
              <span className={cn("px-2 py-1 rounded text-[9px] font-black uppercase",
                item.status === "Scheduled" ? "bg-mint/10 text-mint" : item.status === "Auto" ? "bg-gold/10 text-gold" : "bg-surface text-text-muted")}>
                {item.status}
              </span>
            </div>
          ))}
          <button onClick={() => toast("New calendar event added!", "success")}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-border-subtle text-xs font-bold text-text-muted hover:border-mint hover:text-mint transition-all">
            + Add Calendar Event
          </button>
        </div>
      </Modal>
    </div>
  );
}
