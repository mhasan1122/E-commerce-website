"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, Filter, Calendar, Download, ShoppingBag, ExternalLink,
  Printer, ChevronRight, MoreVertical, Clock, CheckCircle2,
  Truck, XCircle, FileText, X, Package, MapPin
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { AnimatePresence, motion } from "framer-motion";

type OrderStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

type Order = {
  id: string;
  customer: string;
  email: string;
  status: OrderStatus;
  date: string;
  items: number;
  total: number;
  payment: string;
  address?: string;
};

const initialOrders: Order[] = [
  { id: "ORD-9421", customer: "Arif Rahaman", email: "arif@example.com", status: "Processing", date: "2026-04-21 18:30", items: 3, total: 15400, payment: "Online", address: "House 12, Road 5, Dhanmondi, Dhaka" },
  { id: "ORD-9420", customer: "Nusrat Jahan", email: "nusrat@example.com", status: "Delivered", date: "2026-04-21 14:15", items: 1, total: 8500, payment: "COD", address: "Flat 3B, Gulshan Avenue, Dhaka" },
  { id: "ORD-9419", customer: "Kamal Ahmed", email: "kamal@example.com", status: "Shipped", date: "2026-04-20 22:10", items: 2, total: 12200, payment: "Online", address: "Agrabad, Chittagong" },
  { id: "ORD-9418", customer: "Farhana Islam", email: "farhana@example.com", status: "Cancelled", date: "2026-04-20 16:45", items: 5, total: 32000, payment: "COD", address: "Sylhet Sadar, Sylhet" },
  { id: "ORD-9417", customer: "Tanvir Hasan", email: "tanvir@example.com", status: "Pending", date: "2026-04-20 12:00", items: 1, total: 4500, payment: "Online", address: "Mirpur 10, Dhaka" },
];

const statusStyles: Record<OrderStatus, string> = {
  Pending: "bg-surface-elevated text-text-muted border-border-subtle",
  Processing: "bg-gold/10 text-gold border-gold/20",
  Shipped: "bg-midnight/10 text-midnight border-midnight/20",
  Delivered: "bg-mint/10 text-mint border-mint/20",
  Cancelled: "bg-coral/10 text-coral border-coral/20",
};

const statusIcons: Record<OrderStatus, React.ElementType> = {
  Pending: Clock, Processing: CheckCircle2, Shipped: Truck, Delivered: CheckCircle2, Cancelled: XCircle,
};

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  Pending: "Processing", Processing: "Shipped", Shipped: "Delivered",
};

function exportCSV(orders: Order[]) {
  const headers = ["Order ID", "Customer", "Email", "Status", "Date", "Items", "Total", "Payment"];
  const rows = orders.map((o) => [o.id, o.customer, o.email, o.status, o.date, o.items, o.total, o.payment]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "orders.csv"; a.click();
  URL.revokeObjectURL(url);
}

const TABS = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return orders.filter((o) => {
      const matchTab = activeTab === "All" || o.status === activeTab;
      const matchSearch = !term || o.id.toLowerCase().includes(term) || o.customer.toLowerCase().includes(term) || o.email.toLowerCase().includes(term);
      return matchTab && matchSearch;
    });
  }, [orders, activeTab, searchTerm]);

  const handleStatusUpdate = (order: Order) => {
    const next = nextStatus[order.status];
    if (!next) return;
    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: next } : o));
    if (selectedOrder?.id === order.id) setSelectedOrder({ ...order, status: next });
    setOpenMenuId(null);
    toast(`Order ${order.id} marked as ${next}!`);
  };

  const handleCancel = (order: Order) => {
    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: "Cancelled" } : o));
    if (selectedOrder?.id === order.id) setSelectedOrder({ ...order, status: "Cancelled" });
    setOpenMenuId(null);
    toast(`Order ${order.id} cancelled.`, "error");
  };

  const handlePrintLabels = () => {
    toast("Printing shipping labels...", "info");
    setTimeout(() => window.print(), 300);
  };

  const counts = TABS.slice(1).reduce((acc, t) => {
    acc[t] = orders.filter((o) => o.status === t).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8 animate-fade-in" onClick={() => setOpenMenuId(null)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight">
            Order <span className="text-mint">Management</span>
          </h1>
          <p className="text-text-muted mt-1 font-medium">Monitor, track and fulfill customer orders globally.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrintLabels}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-surface-elevated text-text-secondary font-bold text-sm border border-border-subtle hover:bg-white transition-all">
            <Printer className="w-4 h-4" /> Print Labels
          </button>
          <button onClick={() => { exportCSV(filtered); toast("Orders exported as CSV!"); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-midnight text-warm-white font-bold text-sm shadow-xl shadow-midnight/20 hover:scale-[1.02] transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 p-1.5 bg-surface-elevated rounded-2xl w-fit border border-border-subtle flex-wrap">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); }}
              className={cn("relative px-5 py-2 rounded-xl text-xs font-bold transition-all",
                activeTab === tab ? "bg-white text-midnight shadow-sm border border-border-subtle" : "text-text-muted hover:text-midnight")}>
              {tab}
              {tab !== "All" && counts[tab] > 0 && (
                <span className={cn("ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black",
                  activeTab === tab ? "bg-midnight/10 text-midnight" : "bg-surface text-text-muted")}>
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative group w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-mint transition-colors" />
            <input type="text" placeholder="Filter by Order ID, Customer, or Email..."
              className="w-full bg-surface/50 border border-border-subtle rounded-xl py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all text-sm font-medium"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <button className="w-full flex items-center justify-between gap-2 px-10 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-sm font-bold text-text-secondary">
                Last 30 Days
              </button>
            </div>
            <button onClick={() => toast("Advanced filters coming soon!", "info")}
              className="p-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-text-secondary hover:text-mint transition-all">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden border border-border-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-elevated">
              <tr>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Order Info</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Customer Details</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Quantity</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Total</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/40">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-text-muted font-medium">No orders found.</td></tr>
              ) : (
                filtered.map((order) => {
                  const Icon = statusIcons[order.status];
                  return (
                    <tr key={order.id} className="group hover:bg-surface-elevated/30 transition-colors">
                      <td className="p-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-midnight flex items-center gap-2">
                            #{order.id}
                            <button onClick={() => { setSelectedOrder(order); setShowDetails(true); }}>
                              <ExternalLink className="w-3 h-3 text-mint opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          </span>
                          <span className="text-[10px] font-medium text-text-muted uppercase tracking-tight mt-1">{order.date}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center border border-border-subtle">
                            <span className="text-[10px] font-bold text-text-secondary">{order.customer.charAt(0)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-midnight">{order.customer}</span>
                            <span className="text-xs text-text-muted truncate max-w-[150px]">{order.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider w-fit",
                          statusStyles[order.status])}>
                          <Icon className="w-3 h-3" />
                          {order.status}
                        </div>
                      </td>
                      <td className="p-5"><span className="text-xs font-bold text-text-secondary">{order.items} Items</span></td>
                      <td className="p-5 font-bold text-sm text-midnight">
                        <div className="flex flex-col">
                          <span>{formatPrice(order.total)}</span>
                          <span className="text-[9px] font-medium text-text-muted uppercase tracking-widest">{order.payment}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => { setSelectedOrder(order); setShowDetails(true); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle text-[10px] font-bold text-text-secondary hover:bg-white hover:text-midnight transition-colors group-hover:border-mint/30">
                            <FileText className="w-3.5 h-3.5" /> Details
                          </button>
                          <div className="relative">
                            <button onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                              className="p-2 rounded-lg text-text-muted hover:bg-surface-elevated hover:text-midnight transition-colors">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                              {openMenuId === order.id && (
                                <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  className="absolute right-0 top-10 z-20 w-48 bg-white rounded-2xl border border-border-subtle shadow-xl overflow-hidden">
                                  {nextStatus[order.status] && (
                                    <button onClick={() => handleStatusUpdate(order)}
                                      className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-text-secondary hover:bg-surface-elevated hover:text-mint transition-colors">
                                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark as {nextStatus[order.status]}
                                    </button>
                                  )}
                                  {order.status !== "Cancelled" && order.status !== "Delivered" && (
                                    <button onClick={() => handleCancel(order)}
                                      className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-coral hover:bg-coral/5 transition-colors">
                                      <XCircle className="w-3.5 h-3.5" /> Cancel Order
                                    </button>
                                  )}
                                  <button onClick={() => { toast(`Invoice for ${order.id} downloaded!`); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-text-secondary hover:bg-surface-elevated hover:text-midnight transition-colors">
                                    <Download className="w-3.5 h-3.5" /> Download Invoice
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal open={showDetails} onClose={() => setShowDetails(false)} title={`Order ${selectedOrder?.id}`} size="lg">
        {selectedOrder && (() => {
          const Icon = statusIcons[selectedOrder.status];
          const next = nextStatus[selectedOrder.status];
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-black uppercase tracking-wider w-fit", statusStyles[selectedOrder.status])}>
                  <Icon className="w-4 h-4" /> {selectedOrder.status}
                </div>
                <span className="text-xs text-text-muted font-medium">{selectedOrder.date}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-surface-elevated space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Customer</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-border-subtle flex items-center justify-center font-bold text-sm">
                      {selectedOrder.customer.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-midnight">{selectedOrder.customer}</p>
                      <p className="text-xs text-text-muted">{selectedOrder.email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-surface-elevated space-y-1">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">Delivery Address</h3>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-midnight">{selectedOrder.address}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Items", value: `${selectedOrder.items} items` },
                  { label: "Total", value: formatPrice(selectedOrder.total) },
                  { label: "Payment", value: selectedOrder.payment },
                ].map(({ label, value }) => (
                  <div key={label} className="p-4 rounded-2xl bg-surface-elevated text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</p>
                    <p className="text-sm font-bold text-midnight mt-1">{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                {next && (
                  <button onClick={() => handleStatusUpdate(selectedOrder)}
                    className="flex-1 py-2.5 rounded-xl bg-mint text-midnight text-sm font-bold hover:scale-[1.02] transition-all">
                    Mark as {next}
                  </button>
                )}
                {selectedOrder.status !== "Cancelled" && selectedOrder.status !== "Delivered" && (
                  <button onClick={() => { handleCancel(selectedOrder); setShowDetails(false); }}
                    className="flex-1 py-2.5 rounded-xl border border-coral/20 text-coral text-sm font-bold hover:bg-coral/5 transition-all">
                    Cancel Order
                  </button>
                )}
                <button onClick={() => { toast(`Invoice for ${selectedOrder.id} downloaded!`); }}
                  className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all">
                  <Download className="w-4 h-4 inline mr-1.5" /> Invoice
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
