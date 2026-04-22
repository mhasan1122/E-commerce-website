"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  Calendar,
  Download,
  Printer,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  FileText,
  MapPin,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { http, ApiError } from "@/lib/api";
import type { Order, OrderStatus, Paginated } from "@/lib/types";

const PAGE_SIZE = 20;

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-surface-elevated text-text-muted border-border-subtle",
  paid: "bg-mint/10 text-mint border-mint/20",
  processing: "bg-gold/10 text-gold border-gold/20",
  shipped: "bg-midnight/10 text-midnight border-midnight/20",
  delivered: "bg-mint/10 text-mint border-mint/20",
  cancelled: "bg-coral/10 text-coral border-coral/20",
  refunded: "bg-coral/10 text-coral border-coral/20",
};

const statusIcons: Record<OrderStatus, React.ElementType> = {
  pending: Clock,
  paid: CheckCircle2,
  processing: CheckCircle2,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
  refunded: XCircle,
};

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "processing",
  paid: "processing",
  processing: "shipped",
  shipped: "delivered",
};

const TABS: Array<"All" | OrderStatus> = [
  "All",
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("q", searchTerm.trim());
      if (activeTab !== "All") params.set("status", activeTab);
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
      const res = await http.get<Paginated<Order>>(`/orders/admin/all?${params.toString()}`);
      setOrders(res.data);
      setTotal(res.total);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to load orders";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activeTab, page, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const counts = useMemo(() => {
    return TABS.slice(1).reduce((acc, t) => {
      acc[t] = orders.filter((o) => o.status === t).length;
      return acc;
    }, {} as Record<string, number>);
  }, [orders]);

  const openDetails = async (order: Order) => {
    // Fetch full order with items
    try {
      const res = await http.get<{ success: true; data: Order }>(`/orders/${order.id}`);
      setSelectedOrder(res.data);
      setShowDetails(true);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to load order";
      toast(msg, "error");
    }
  };

  const handleStatusUpdate = async (order: Order, to: OrderStatus) => {
    try {
      await http.patch(`/orders/${order.id}/status`, { status: to });
      toast(`Order ${order.orderNumber} → ${to}`);
      if (selectedOrder?.id === order.id) {
        setSelectedOrder({ ...selectedOrder, status: to });
      }
      fetchOrders();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Update failed";
      toast(msg, "error");
    }
  };

  const handleCancel = (order: Order) => handleStatusUpdate(order, "cancelled");

  const exportCSV = () => {
    const headers = ["Order #", "Customer", "Email", "Status", "Payment", "Total", "Date"];
    const rows = orders.map((o) => [
      o.orderNumber,
      o.userName ?? "",
      o.userEmail ?? "",
      o.status,
      o.paymentStatus,
      o.total,
      o.createdAt,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast("Orders exported as CSV!");
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight">
            Order <span className="text-mint">Management</span>
          </h1>
          <p className="text-text-muted mt-1 font-medium">
            Monitor, track and fulfill customer orders globally.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              toast("Printing shipping labels...", "info");
              setTimeout(() => window.print(), 300);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-surface-elevated text-text-secondary font-bold text-sm border border-border-subtle hover:bg-white transition-all"
          >
            <Printer className="w-4 h-4" /> Print Labels
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-midnight text-warm-white font-bold text-sm shadow-xl shadow-midnight/20 hover:scale-[1.02] transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 p-1.5 bg-surface-elevated rounded-2xl w-fit border border-border-subtle flex-wrap">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              className={cn(
                "relative px-5 py-2 rounded-xl text-xs font-bold transition-all capitalize",
                activeTab === tab
                  ? "bg-white text-midnight shadow-sm border border-border-subtle"
                  : "text-text-muted hover:text-midnight"
              )}
            >
              {tab}
              {tab !== "All" && counts[tab] > 0 && (
                <span
                  className={cn(
                    "ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black",
                    activeTab === tab ? "bg-midnight/10 text-midnight" : "bg-surface text-text-muted"
                  )}
                >
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative group w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-mint transition-colors" />
            <input
              type="text"
              placeholder="Filter by Order #, Customer, or Email..."
              className="w-full bg-surface/50 border border-border-subtle rounded-xl py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <button
                disabled
                className="w-full flex items-center justify-between gap-2 px-10 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-sm font-bold text-text-secondary opacity-60"
              >
                All time
              </button>
            </div>
            <button
              onClick={() => toast("Advanced filters coming soon!", "info")}
              className="p-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-text-secondary hover:text-mint transition-all"
            >
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
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Order</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Customer</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Payment</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Total</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-text-muted">
                    <Loader2 className="w-5 h-5 animate-spin inline-block text-mint" />
                    <span className="ml-2 font-medium">Loading orders…</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-text-muted font-medium">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const Icon = statusIcons[order.status] || Clock;
                  const next = nextStatus[order.status];
                  return (
                    <tr key={order.id} className="group hover:bg-surface-elevated/30 transition-colors">
                      <td className="p-5">
                        <div className="flex flex-col">
                          <button
                            onClick={() => openDetails(order)}
                            className="font-bold text-sm text-midnight hover:text-mint transition-colors flex items-center gap-2 w-fit"
                          >
                            #{order.orderNumber}
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                          <span className="text-[10px] font-medium text-text-muted uppercase tracking-tight mt-1">
                            {fmtDate(order.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center border border-border-subtle">
                            <span className="text-[10px] font-bold text-text-secondary">
                              {(order.userName || "?").charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-midnight">{order.userName || "—"}</span>
                            <span className="text-xs text-text-muted truncate max-w-[180px]">{order.userEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider w-fit",
                            statusStyles[order.status]
                          )}
                        >
                          <Icon className="w-3 h-3" />
                          {order.status}
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                          {order.paymentMethod?.toUpperCase()} · {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-5 font-bold text-sm text-midnight">{formatPrice(order.total)}</td>
                      <td className="p-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDetails(order)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle text-[10px] font-bold text-text-secondary hover:bg-white hover:text-midnight transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" /> Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-5 bg-surface-elevated/50 flex items-center justify-between border-t border-border-subtle">
          <span className="text-xs text-text-muted font-medium">
            Showing <span className="font-bold text-midnight">{orders.length}</span> of{" "}
            <span className="font-bold text-midnight">{total}</span> orders
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-border-subtle text-xs font-bold disabled:opacity-30 hover:bg-white transition-all"
            >
              Prev
            </button>
            <span className="text-xs font-bold text-midnight">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-border-subtle text-xs font-bold disabled:opacity-30 hover:bg-white transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        open={showDetails}
        onClose={() => setShowDetails(false)}
        title={selectedOrder ? `Order #${selectedOrder.orderNumber}` : "Order"}
        size="lg"
      >
        {selectedOrder &&
          (() => {
            const Icon = statusIcons[selectedOrder.status] || Clock;
            const next = nextStatus[selectedOrder.status];
            const addr = selectedOrder.shippingAddress || {};
            const addrLines = [
              (addr as Record<string, string>).fullName,
              (addr as Record<string, string>).line1,
              (addr as Record<string, string>).line2,
              [
                (addr as Record<string, string>).city,
                (addr as Record<string, string>).state,
                (addr as Record<string, string>).postalCode,
              ]
                .filter(Boolean)
                .join(", "),
              (addr as Record<string, string>).country,
            ].filter(Boolean);
            return (
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-black uppercase tracking-wider w-fit",
                      statusStyles[selectedOrder.status]
                    )}
                  >
                    <Icon className="w-4 h-4" /> {selectedOrder.status}
                  </div>
                  <span className="text-xs text-text-muted font-medium">{fmtDate(selectedOrder.createdAt)}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-surface-elevated space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Customer</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-border-subtle flex items-center justify-center font-bold text-sm">
                        {(selectedOrder.userName || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-midnight">{selectedOrder.userName}</p>
                        <p className="text-xs text-text-muted">{selectedOrder.userEmail}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-elevated space-y-1">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">
                      Shipping Address
                    </h3>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-mint flex-shrink-0 mt-0.5" />
                      <div className="text-sm font-medium text-midnight leading-snug">
                        {addrLines.length
                          ? addrLines.map((l, i) => <div key={i}>{l}</div>)
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Items", value: `${selectedOrder.items?.length ?? 0}` },
                    { label: "Subtotal", value: formatPrice(selectedOrder.subtotal) },
                    { label: "Shipping", value: formatPrice(selectedOrder.shippingFee) },
                    { label: "Total", value: formatPrice(selectedOrder.total) },
                  ].map(({ label, value }) => (
                    <div key={label} className="p-4 rounded-2xl bg-surface-elevated text-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</p>
                      <p className="text-sm font-bold text-midnight mt-1">{value}</p>
                    </div>
                  ))}
                </div>

                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Items</h3>
                    <div className="border border-border-subtle rounded-2xl divide-y divide-border-subtle/50">
                      {selectedOrder.items.map((it) => (
                        <div key={it.id} className="flex items-center gap-4 p-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-border-subtle bg-white shrink-0">
                            {it.productImage ? (
                              <img src={it.productImage} alt={it.productName} className="w-full h-full object-cover" />
                            ) : null}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-midnight truncate">{it.productName}</p>
                            <p className="text-xs text-text-muted">
                              Qty {it.quantity} · {formatPrice(it.unitPrice)}
                              {it.selectedColor ? ` · ${it.selectedColor}` : ""}
                              {it.selectedSize ? ` · ${it.selectedSize}` : ""}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-mint">{formatPrice(it.lineTotal)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {next && (
                    <button
                      onClick={() => handleStatusUpdate(selectedOrder, next)}
                      className="flex-1 py-2.5 rounded-xl bg-mint text-midnight text-sm font-bold hover:scale-[1.02] transition-all capitalize"
                    >
                      Mark as {next}
                    </button>
                  )}
                  {selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && (
                    <button
                      onClick={() => handleCancel(selectedOrder)}
                      className="flex-1 py-2.5 rounded-xl border border-coral/20 text-coral text-sm font-bold hover:bg-coral/5 transition-all"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
      </Modal>
    </div>
  );
}
