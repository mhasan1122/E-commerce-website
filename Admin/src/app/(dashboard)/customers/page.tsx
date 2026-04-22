"use client";

import React, { useState, useMemo } from "react";
import { 
  Users, Search, Filter, Download, UserCheck, History, MessageSquare,
  MoreVertical, TrendingUp, Star, Users2, X, Mail, Phone, MapPin, Ban
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { AnimatePresence, motion } from "framer-motion";

type Customer = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  orders: number;
  totalSpent: number;
  status: "Active" | "Inactive";
  group: "VIP" | "Elite" | "Regular" | "Guest";
  lastOrder: string;
  address?: string;
};

const initialCustomers: Customer[] = [
  { id: 1, name: "Sarah Johnson", email: "sarah.j@gmail.com", phone: "+880 171 234 5678", orders: 12, totalSpent: 84500, status: "Active", group: "VIP", lastOrder: "2 days ago", address: "Dhanmondi, Dhaka" },
  { id: 2, name: "Michael Chen", email: "m.chen@outlook.com", phone: "+880 181 876 5432", orders: 3, totalSpent: 12200, status: "Active", group: "Regular", lastOrder: "1 week ago", address: "Gulshan, Dhaka" },
  { id: 3, name: "Emma Wilson", email: "emma.w@yahoo.com", phone: "+880 191 654 3210", orders: 24, totalSpent: 156000, status: "Active", group: "Elite", lastOrder: "5 hours ago", address: "Banani, Dhaka" },
  { id: 4, name: "James Anderson", email: "j.anderson@comp.com", phone: "+880 161 345 6789", orders: 1, totalSpent: 4500, status: "Inactive", group: "Guest", lastOrder: "3 months ago", address: "Agrabad, Chittagong" },
];

const groups = ["VIP", "Elite", "Regular", "Guest"];

function exportCSV(customers: Customer[]) {
  const headers = ["ID", "Name", "Email", "Orders", "Total Spent", "Status", "Group", "Last Order"];
  const rows = customers.map((c) => [c.id, c.name, c.email, c.orders, c.totalSpent, c.status, c.group, c.lastOrder]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "customers.csv"; a.click();
  URL.revokeObjectURL(url);
}

const groupStyles: Record<string, string> = {
  Elite: "bg-midnight text-warm-white",
  VIP: "bg-gold/10 text-gold shadow-sm",
  Regular: "bg-surface-elevated text-text-muted",
  Guest: "bg-surface-elevated text-text-muted",
};

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGroup, setFilterGroup] = useState("All");
  const [showGroups, setShowGroups] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [noteText, setNoteText] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return customers.filter((c) => {
      const matchSearch = !term || c.name.toLowerCase().includes(term) || c.email.toLowerCase().includes(term) || c.group.toLowerCase().includes(term);
      const matchGroup = filterGroup === "All" || c.group === filterGroup;
      return matchSearch && matchGroup;
    });
  }, [customers, searchTerm, filterGroup]);

  const handleToggleStatus = (c: Customer) => {
    const newStatus = c.status === "Active" ? "Inactive" : "Active";
    setCustomers((prev) => prev.map((x) => x.id === c.id ? { ...x, status: newStatus } : x));
    if (selectedCustomer?.id === c.id) setSelectedCustomer({ ...c, status: newStatus });
    setOpenMenuId(null);
    toast(`${c.name} ${newStatus === "Active" ? "reactivated" : "deactivated"}.`, newStatus === "Active" ? "success" : "info");
  };

  const handleGroupChange = (customerId: number, group: Customer["group"]) => {
    setCustomers((prev) => prev.map((c) => c.id === customerId ? { ...c, group } : c));
    toast("Customer group updated!");
  };

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    toast(`Support note sent to ${selectedCustomer?.name}!`);
    setShowNote(false);
    setNoteText("");
  };

  return (
    <div className="space-y-8 animate-fade-in" onClick={() => setOpenMenuId(null)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight">
            Customer <span className="text-mint">Management</span>
          </h1>
          <p className="text-text-muted mt-1 font-medium italic">
            Analyze customer behavior, manage segments, and provide high-end support.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowGroups(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-surface-elevated text-text-secondary font-bold text-sm border border-border-subtle hover:bg-white transition-all">
            <Users2 className="w-4 h-4" /> Manage Groups
          </button>
          <button onClick={() => { exportCSV(filtered); toast("Customers exported as CSV!"); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-midnight text-warm-white font-bold text-sm shadow-xl shadow-midnight/20 hover:scale-[1.02] transition-all">
            <Download className="w-4 h-4" /> Export Customers
          </button>
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: TrendingUp, label: "Growth Rate", value: "+18.4%", sub: "240 new customers this month", color: "from-mint/10", iconBg: "bg-mint text-midnight" },
          { icon: Star, label: "Average LTV", value: formatPrice(12400), sub: "Lifetime Value per customer", color: "from-gold/10", iconBg: "bg-gold text-midnight" },
          { icon: Users, label: "Retention Rate", value: "64%", sub: "Customers returning for 2nd order", color: "from-charcoal/10", iconBg: "bg-charcoal text-warm-white" },
        ].map(({ icon: Icon, label, value, sub, color, iconBg }) => (
          <div key={label} className={cn("glass-card p-6 border border-border-subtle bg-gradient-to-br to-transparent", color)}>
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl", iconBg)}><Icon className="w-6 h-6" /></div>
              <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">{label}</span>
            </div>
            <h3 className="text-2xl font-heading font-bold text-midnight">{value}</h3>
            <p className="text-xs text-text-muted font-medium mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="space-y-6">
        <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="relative group w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-mint transition-colors" />
            <input type="text" placeholder="Search by name, email, or group..."
              className="w-full bg-surface/50 border border-border-subtle rounded-xl py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all text-sm font-medium"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            {["All", ...groups].map((g) => (
              <button key={g} onClick={() => setFilterGroup(g)}
                className={cn("px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                  filterGroup === g ? "bg-mint text-midnight border-mint" : "bg-surface-elevated border-border-subtle text-text-secondary hover:border-mint/40")}>
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card overflow-hidden border border-border-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-elevated">
                <tr>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Customer</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Status & Group</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Orders</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Total Spent</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Last Active</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/30">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-text-muted font-medium">No customers found.</td></tr>
                ) : (
                  filtered.map((customer) => (
                    <tr key={customer.id} className="group hover:bg-surface-elevated/50 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-surface-elevated border border-border-subtle flex items-center justify-center font-bold text-xs text-text-secondary uppercase">
                            {customer.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div className="flex flex-col">
                            <button onClick={() => { setSelectedCustomer(customer); setShowProfile(true); }}
                              className="text-sm font-bold text-midnight group-hover:text-mint transition-colors text-left">
                              {customer.name}
                            </button>
                            <span className="text-[10px] font-medium text-text-muted truncate max-w-[150px]">{customer.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col gap-1.5">
                          <span className={cn("w-fit px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                            customer.status === "Active" ? "bg-mint/10 text-mint" : "bg-coral/10 text-coral")}>{customer.status}</span>
                          <span className={cn("w-fit px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest", groupStyles[customer.group])}>{customer.group}</span>
                        </div>
                      </td>
                      <td className="p-5 text-sm font-bold text-text-secondary">{customer.orders} Orders</td>
                      <td className="p-5 text-sm font-bold text-midnight">{formatPrice(customer.totalSpent)}</td>
                      <td className="p-5 text-xs font-medium text-text-muted italic">{customer.lastOrder}</td>
                      <td className="p-5">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button title="Order History" onClick={() => { toast(`Viewing order history for ${customer.name}`, "info"); }}
                            className="p-2 rounded-lg text-text-muted hover:bg-white hover:text-midnight transition-colors">
                            <History className="w-4 h-4" />
                          </button>
                          <button title="Support Note" onClick={() => { setSelectedCustomer(customer); setShowNote(true); }}
                            className="p-2 rounded-lg text-text-muted hover:bg-white hover:text-mint transition-colors">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <div className="relative">
                            <button onClick={() => setOpenMenuId(openMenuId === customer.id ? null : customer.id)}
                              className="p-2 rounded-lg text-text-muted hover:bg-white hover:text-midnight transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                              {openMenuId === customer.id && (
                                <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  className="absolute right-0 top-10 z-20 w-48 bg-white rounded-2xl border border-border-subtle shadow-xl overflow-hidden">
                                  <button onClick={() => { setSelectedCustomer(customer); setShowProfile(true); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-text-secondary hover:bg-surface-elevated hover:text-midnight transition-colors">
                                    <Users className="w-3.5 h-3.5" /> View Profile
                                  </button>
                                  <button onClick={() => handleToggleStatus(customer)}
                                    className={cn("w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold transition-colors",
                                      customer.status === "Active" ? "text-coral hover:bg-coral/5" : "text-mint hover:bg-mint/5")}>
                                    <Ban className="w-3.5 h-3.5" />
                                    {customer.status === "Active" ? "Deactivate" : "Reactivate"}
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* VIP Retention Banner */}
      <div className="p-6 rounded-3xl bg-midnight text-warm-white flex items-center justify-between border border-mint/20 shadow-2xl shadow-midnight/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-mint/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/2" />
        <div className="relative z-10 flex items-center gap-6">
          <div className="p-4 rounded-2xl bg-mint/10 border border-mint/20 text-mint">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-xl font-heading font-bold text-mint">VIP Retention Campaign</h4>
            <p className="text-sm text-warm-white/60 mt-1 max-w-lg font-medium leading-relaxed">
              You have <span className="text-warm-white font-bold">12 VIP customers</span> who haven't placed an order in the last 30 days. Send a personalized promo code.
            </p>
          </div>
        </div>
        <button onClick={() => toast("VIP retention campaign launched! Emails queued.", "success")}
          className="relative z-10 px-6 py-3 rounded-2xl bg-mint text-midnight font-bold text-sm hover:scale-105 transition-all">
          Launch Campaign
        </button>
      </div>

      {/* Customer Profile Modal */}
      <Modal open={showProfile} onClose={() => setShowProfile(false)} title="Customer Profile" size="lg">
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-border-subtle flex items-center justify-center font-bold text-xl text-text-secondary uppercase">
                {selectedCustomer.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <h3 className="text-xl font-bold text-midnight">{selectedCustomer.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                    selectedCustomer.status === "Active" ? "bg-mint/10 text-mint" : "bg-coral/10 text-coral")}>{selectedCustomer.status}</span>
                  <span className={cn("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest", groupStyles[selectedCustomer.group])}>{selectedCustomer.group}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Mail, label: "Email", value: selectedCustomer.email },
                { icon: Phone, label: "Phone", value: selectedCustomer.phone || "N/A" },
                { icon: MapPin, label: "Address", value: selectedCustomer.address || "N/A" },
                { icon: History, label: "Last Order", value: selectedCustomer.lastOrder },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-surface-elevated">
                  <Icon className="w-4 h-4 text-mint flex-shrink-0" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">{label}</p>
                    <p className="text-xs font-bold text-midnight mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-surface-elevated text-center">
                <p className="text-[10px] font-black uppercase text-text-muted">Total Orders</p>
                <p className="text-2xl font-bold text-midnight mt-1">{selectedCustomer.orders}</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface-elevated text-center">
                <p className="text-[10px] font-black uppercase text-text-muted">Total Spent</p>
                <p className="text-2xl font-bold text-mint mt-1">{formatPrice(selectedCustomer.totalSpent)}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Change Group</p>
              <div className="flex gap-2 flex-wrap">
                {groups.map((g) => (
                  <button key={g} onClick={() => { handleGroupChange(selectedCustomer.id, g as Customer["group"]); setSelectedCustomer({ ...selectedCustomer, group: g as Customer["group"] }); }}
                    className={cn("px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                      selectedCustomer.group === g ? "bg-mint text-midnight border-mint" : "bg-surface-elevated border-border-subtle text-text-secondary hover:border-mint/40")}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Support Note Modal */}
      <Modal open={showNote} onClose={() => setShowNote(false)} title={`Support Note — ${selectedCustomer?.name}`} size="sm">
        <form onSubmit={handleSendNote} className="space-y-4">
          <textarea required value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={4}
            placeholder="Write a support note or message..."
            className="w-full border border-border-subtle rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all resize-none" />
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowNote(false)}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all">
              Send Note
            </button>
          </div>
        </form>
      </Modal>

      {/* Manage Groups Modal */}
      <Modal open={showGroups} onClose={() => setShowGroups(false)} title="Customer Groups" size="sm">
        <div className="space-y-3">
          {groups.map((g) => {
            const count = customers.filter((c) => c.group === g).length;
            return (
              <div key={g} className="flex items-center justify-between p-4 rounded-2xl bg-surface-elevated border border-border-subtle hover:border-mint/30 transition-all">
                <div className="flex items-center gap-3">
                  <span className={cn("px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest", groupStyles[g])}>{g}</span>
                  <span className="text-sm font-bold text-midnight">{count} customers</span>
                </div>
                <button onClick={() => toast(`Editing ${g} group settings...`, "info")}
                  className="text-xs font-bold text-mint hover:underline">Configure</button>
              </div>
            );
          })}
          <button onClick={() => toast("New group created!", "success")}
            className="w-full py-2.5 rounded-xl border-2 border-dashed border-border-subtle text-xs font-bold text-text-muted hover:border-mint hover:text-mint transition-all mt-2">
            + Create New Group
          </button>
        </div>
      </Modal>
    </div>
  );
}
