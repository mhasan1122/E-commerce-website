"use client";

import React, { useState } from "react";
import { 
  Warehouse, PackageSearch, History, AlertCircle, MapPin,
  ArrowRightLeft, ChevronRight, BarChart2, Box, Truck, Plus, X, Download
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";

type StockEntry = {
  id: number;
  product: string;
  action: string;
  qty: string;
  warehouse: string;
  date: string;
  staff: string;
};

const initialHistory: StockEntry[] = [
  { id: 1, product: "Premium Silk Saree", action: "Stock Added", qty: "+25", warehouse: "Dhaka Base", date: "2026-04-21 10:00", staff: "Hasan" },
  { id: 2, product: "Leather Messenger Bag", action: "Sold", qty: "-1", warehouse: "Chittagong Hub", date: "2026-04-21 09:45", staff: "System" },
  { id: 3, product: "Floral Print Kurta", action: "Correction", qty: "-2", warehouse: "Dhaka Base", date: "2026-04-20 18:20", staff: "Muna" },
];

const warehouses = [
  { name: "Dhaka Base Warehouse", location: "Uttara, Sector 4", capacity: "82%", items: 1240 },
  { name: "Chittagong Distribution Hub", location: "Agrabad", capacity: "45%", items: 680 },
  { name: "Sylhet Fulfillment Center", location: "Zindabazar", capacity: "15%", items: 210 },
];

const warehouseNames = warehouses.map((w) => w.name.split(" ").slice(0, 2).join(" "));
const products = ["Premium Silk Saree", "Leather Messenger Bag", "Floral Print Kurta", "Embroidered Panjabi", "Cotton Kurti Set", "Denim Jacket"];
const actionTypes = ["Stock Added", "Correction", "Return", "Transfer In", "Transfer Out", "Damage Write-off"];

function exportCSV(history: StockEntry[]) {
  const headers = ["Product", "Action", "Qty", "Warehouse", "Date", "Staff"];
  const rows = history.map((h) => [h.product, h.action, h.qty, h.warehouse, h.date, h.staff]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "stock_report.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function InventoryPage() {
  const { toast } = useToast();
  const [history, setHistory] = useState<StockEntry[]>(initialHistory);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [showRestock, setShowRestock] = useState(false);

  const [transferForm, setTransferForm] = useState({ product: "", fromWarehouse: "", toWarehouse: "", qty: "" });
  const [adjustForm, setAdjustForm] = useState({ product: "", action: "", qty: "", warehouse: "", notes: "" });
  const [restockForm, setRestockForm] = useState({ product: "", qty: "", warehouse: "", supplier: "" });

  const getStaffInitial = () => {
    try { return (JSON.parse(localStorage.getItem("user") || "{}").name || "Admin").charAt(0); } catch { return "A"; }
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    const newEntry: StockEntry = {
      id: Date.now(),
      product: transferForm.product,
      action: "Transfer",
      qty: `↔ ${transferForm.qty}`,
      warehouse: `${transferForm.fromWarehouse.split(" ")[0]} → ${transferForm.toWarehouse.split(" ")[0]}`,
      date: now,
      staff: "Hasan",
    };
    setHistory((prev) => [newEntry, ...prev]);
    setShowTransfer(false);
    setTransferForm({ product: "", fromWarehouse: "", toWarehouse: "", qty: "" });
    toast(`Stock transferred successfully!`);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    const isPositive = ["Stock Added", "Return", "Transfer In"].includes(adjustForm.action);
    const newEntry: StockEntry = {
      id: Date.now(),
      product: adjustForm.product,
      action: adjustForm.action,
      qty: `${isPositive ? "+" : "-"}${adjustForm.qty}`,
      warehouse: adjustForm.warehouse,
      date: now,
      staff: "Hasan",
    };
    setHistory((prev) => [newEntry, ...prev]);
    setShowAdjust(false);
    setAdjustForm({ product: "", action: "", qty: "", warehouse: "", notes: "" });
    toast(`Stock adjustment recorded!`);
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    const newEntry: StockEntry = {
      id: Date.now(),
      product: restockForm.product,
      action: "Restock Order",
      qty: `+${restockForm.qty}`,
      warehouse: restockForm.warehouse,
      date: now,
      staff: "Hasan",
    };
    setHistory((prev) => [newEntry, ...prev]);
    setShowRestock(false);
    setRestockForm({ product: "", qty: "", warehouse: "", supplier: "" });
    toast(`Bulk restock order placed!`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight">
            Inventory <span className="text-mint">Management</span>
          </h1>
          <p className="text-text-muted mt-1 font-medium italic">
            Track stock levels, warehouse distribution, and movement history.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowTransfer(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-surface-elevated text-text-secondary font-bold text-sm border border-border-subtle hover:bg-white transition-all">
            <ArrowRightLeft className="w-4 h-4" /> Transfer Stock
          </button>
          <button onClick={() => setShowAdjust(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-midnight text-warm-white font-bold text-sm shadow-xl shadow-midnight/20 hover:scale-[1.02] transition-all">
            <History className="w-4 h-4" /> Stock Adjustment
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {warehouses.map((w) => (
          <div key={w.name} className="glass-card p-6 border border-border-subtle group hover:border-mint/30 transition-all">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 rounded-2xl bg-midnight/5 text-midnight">
                <Warehouse className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">Active Storage</span>
            </div>
            <h3 className="text-base font-bold text-midnight truncate">{w.name}</h3>
            <p className="text-xs text-text-muted mt-1 flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> {w.location}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Capacity Used</span>
                <span className="text-mint">{w.capacity}</span>
              </div>
              <div className="h-2 w-full bg-surface-elevated rounded-full overflow-hidden">
                <div className="h-full bg-mint rounded-full transition-all duration-1000" style={{ width: w.capacity }} />
              </div>
              <p className="text-[10px] text-text-muted font-medium mt-1">{w.items} items currently in stock</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 border border-border-subtle">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                <PackageSearch className="w-5 h-5 text-mint" /> Stock Movement History
              </h2>
              <button onClick={() => { exportCSV(history); toast("Stock log exported!"); }}
                className="text-xs font-bold text-mint hover:underline flex items-center gap-1 group">
                Full Log <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Product</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Action</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Quantity</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Warehouse</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-text-muted">Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/30 text-sm">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="py-4 font-bold text-midnight">{h.product}</td>
                      <td className="py-4 text-text-secondary">{h.action}</td>
                      <td className={cn("py-4 font-black", h.qty.startsWith("+") ? "text-mint" : "text-coral")}>{h.qty}</td>
                      <td className="py-4 text-xs font-medium text-text-muted">{h.warehouse}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-mint/10 border border-mint/20 flex items-center justify-center text-[10px] font-bold text-mint uppercase">
                            {h.staff.charAt(0)}
                          </div>
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-tight">{h.staff}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Return/Refund */}
          <div className="glass-card p-6 border border-border-subtle bg-midnight/[0.01]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-heading font-bold flex items-center gap-2">
                <Truck className="w-5 h-5 text-coral" /> Returns & Refunds
              </h2>
              <span className="px-2 py-1 bg-coral/10 text-coral text-[10px] font-black uppercase rounded">4 Pending Requests</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Return Reasons Audit", desc: "Analyze why customers return products.", color: "group-hover:bg-coral group-hover:text-white", icon: BarChart2 },
                { label: "Refund Workflow", desc: "Manage approval and processing logs.", color: "group-hover:bg-mint group-hover:text-midnight", icon: Box },
              ].map(({ label, desc, color, icon: Icon }) => (
                <button key={label} onClick={() => toast(`${label} — coming soon!`, "info")}
                  className="p-4 rounded-2xl border border-dashed border-border-subtle bg-white/50 flex items-center gap-4 hover:border-mint/20 transition-all cursor-pointer group text-left">
                  <div className={cn("w-12 h-12 rounded-xl bg-surface-elevated flex items-center justify-center text-text-muted transition-all", color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-midnight">{label}</h4>
                    <p className="text-[10px] text-text-muted">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 border border-border-subtle">
            <h3 className="text-sm font-bold text-midnight uppercase tracking-widest mb-6">Quick Inventory Stats</h3>
            <div className="space-y-6">
              {[
                { label: "Total SKU count", value: "2,840", color: "text-midnight" },
                { label: "Out of stock items", value: "14", color: "text-coral" },
                { label: "Low stock warnings", value: "42", color: "text-gold" },
                { label: "Inventory Turnover", value: "4.5x", color: "text-mint" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-text-muted font-medium">{label}</span>
                  <span className={cn("text-sm font-bold", color)}>{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-border-subtle flex flex-col gap-3">
              <button onClick={() => { exportCSV(history); toast("Stock report downloaded!"); }}
                className="w-full py-2.5 rounded-xl bg-surface-elevated text-xs font-bold text-text-secondary border border-border-subtle hover:bg-white transition-all flex items-center justify-center gap-2">
                <Download className="w-3.5 h-3.5" /> Generate Stock Report
              </button>
              <button onClick={() => setShowRestock(true)}
                className="w-full py-2.5 rounded-xl bg-midnight text-warm-white text-xs font-bold hover:scale-[1.02] transition-all">
                Bulk Restock Order
              </button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-mint/5 border border-mint/20 relative overflow-hidden">
            <div className="relative z-10">
              <AlertCircle className="w-6 h-6 text-mint mb-3" />
              <h4 className="text-sm font-bold text-midnight">Smart Forecasting</h4>
              <p className="text-[11px] text-text-secondary mt-1 font-medium leading-relaxed italic">
                "Based on current sales velocity, we recommend restocking 'Premium Silk Saree' by May 1st."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Stock Modal */}
      <Modal open={showTransfer} onClose={() => setShowTransfer(false)} title="Transfer Stock Between Warehouses">
        <form onSubmit={handleTransferSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Product *</label>
            <select required value={transferForm.product} onChange={(e) => setTransferForm({ ...transferForm, product: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all">
              <option value="">Select product</option>
              {products.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">From Warehouse *</label>
              <select required value={transferForm.fromWarehouse} onChange={(e) => setTransferForm({ ...transferForm, fromWarehouse: e.target.value })}
                className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all">
                <option value="">Select</option>
                {warehouseNames.map((w) => <option key={w}>{w}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">To Warehouse *</label>
              <select required value={transferForm.toWarehouse} onChange={(e) => setTransferForm({ ...transferForm, toWarehouse: e.target.value })}
                className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all">
                <option value="">Select</option>
                {warehouseNames.map((w) => <option key={w}>{w}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Quantity *</label>
            <input required type="number" min="1" value={transferForm.qty} onChange={(e) => setTransferForm({ ...transferForm, qty: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="e.g. 25" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowTransfer(false)}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all">
              Confirm Transfer
            </button>
          </div>
        </form>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal open={showAdjust} onClose={() => setShowAdjust(false)} title="Stock Adjustment">
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Product *</label>
            <select required value={adjustForm.product} onChange={(e) => setAdjustForm({ ...adjustForm, product: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all">
              <option value="">Select product</option>
              {products.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Action Type *</label>
              <select required value={adjustForm.action} onChange={(e) => setAdjustForm({ ...adjustForm, action: e.target.value })}
                className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all">
                <option value="">Select action</option>
                {actionTypes.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Quantity *</label>
              <input required type="number" min="1" value={adjustForm.qty} onChange={(e) => setAdjustForm({ ...adjustForm, qty: e.target.value })}
                className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="e.g. 10" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Warehouse *</label>
            <select required value={adjustForm.warehouse} onChange={(e) => setAdjustForm({ ...adjustForm, warehouse: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all">
              <option value="">Select warehouse</option>
              {warehouseNames.map((w) => <option key={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Notes (optional)</label>
            <textarea value={adjustForm.notes} onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
              rows={2} placeholder="Reason for adjustment..."
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAdjust(false)}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all">
              Save Adjustment
            </button>
          </div>
        </form>
      </Modal>

      {/* Bulk Restock Modal */}
      <Modal open={showRestock} onClose={() => setShowRestock(false)} title="Bulk Restock Order">
        <form onSubmit={handleRestockSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Product *</label>
            <select required value={restockForm.product} onChange={(e) => setRestockForm({ ...restockForm, product: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all">
              <option value="">Select product</option>
              {products.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Quantity *</label>
              <input required type="number" min="1" value={restockForm.qty} onChange={(e) => setRestockForm({ ...restockForm, qty: e.target.value })}
                className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="e.g. 100" />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Target Warehouse *</label>
              <select required value={restockForm.warehouse} onChange={(e) => setRestockForm({ ...restockForm, warehouse: e.target.value })}
                className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all">
                <option value="">Select</option>
                {warehouseNames.map((w) => <option key={w}>{w}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Supplier Name</label>
            <input value={restockForm.supplier} onChange={(e) => setRestockForm({ ...restockForm, supplier: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="e.g. Aarong Suppliers Ltd." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowRestock(false)}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all">
              Place Restock Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
