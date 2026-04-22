"use client";

import React, { useEffect, useState } from "react";
import {
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  ArrowRight,
  AlertTriangle,
  Plus,
  Loader2,
} from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import Link from "next/link";
import { formatPrice, cn } from "@/lib/utils";
import { http, ApiError } from "@/lib/api";
import { useToast } from "@/components/Toast";
import { useAuthStore } from "@/lib/authStore";
import type {
  AdminStats,
  AdminStatsResponse,
  Order,
  Paginated,
  Product,
} from "@/lib/types";

const statusPillStyles: Record<string, string> = {
  pending: "bg-surface-elevated text-text-muted",
  paid: "bg-mint/10 text-mint",
  processing: "bg-gold/10 text-gold",
  shipped: "bg-midnight/10 text-midnight",
  delivered: "bg-mint/10 text-mint",
  cancelled: "bg-coral/10 text-coral",
  refunded: "bg-coral/10 text-coral",
};

function timeAgo(iso?: string) {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsRes, ordersRes, productsRes] = await Promise.all([
          http.get<AdminStatsResponse>("/orders/admin/stats"),
          http.get<Paginated<Order>>("/orders/admin/all?limit=5"),
          http.get<Paginated<Product>>("/products?sort=newest&limit=50"),
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data);
        setLowStock(
          productsRes.data
            .filter((p) => p.stock < 10)
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 4)
        );
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : "Failed to load dashboard";
        toast(msg, "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-text-primary tracking-tight">
            Dashboard <span className="text-mint">Overview</span>
          </h1>
          <p className="text-text-muted mt-2 font-medium">
            Welcome back,{" "}
            <span className="text-midnight font-bold">{user?.name || "Admin"}</span>. Here&apos;s
            what&apos;s happening today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="px-5 py-2.5 rounded-2xl bg-midnight text-warm-white font-bold text-sm shadow-xl shadow-midnight/20 hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={stats ? formatPrice(stats.orders.revenue) : loading ? "…" : "—"}
          icon={DollarSign}
          color="mint"
        />
        <StatsCard
          title="Total Orders"
          value={stats ? String(stats.orders.total) : loading ? "…" : "—"}
          icon={ShoppingCart}
          color="gold"
          description={stats ? `${stats.orders.pending} pending` : undefined}
        />
        <StatsCard
          title="Total Products"
          value={stats ? String(stats.products.total) : loading ? "…" : "—"}
          icon={Package}
          color="midnight"
          description={stats ? `${stats.products.lowStock} low stock` : undefined}
        />
        <StatsCard
          title="Customers"
          value={stats ? String(stats.users.customers) : loading ? "…" : "—"}
          icon={Users}
          color="coral"
          description={stats ? `${stats.users.total} total users` : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 glass-card p-6 border border-border-subtle overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-heading font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-mint" /> Recent Orders
            </h2>
            <Link
              href="/orders"
              className="text-xs font-bold text-mint hover:underline flex items-center gap-1 group"
            >
              View All Orders{" "}
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    Order #
                  </th>
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    Customer
                  </th>
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    Status
                  </th>
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    Amount
                  </th>
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-muted">
                      <Loader2 className="w-5 h-5 animate-spin inline-block text-mint" />
                    </td>
                  </tr>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-text-muted font-medium">
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="group hover:bg-surface-elevated/50 transition-colors"
                    >
                      <td className="py-4 font-bold text-sm text-midnight">
                        #{order.orderNumber}
                      </td>
                      <td className="py-4 font-medium text-sm text-text-secondary">
                        {order.userName || "—"}
                      </td>
                      <td className="py-4">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            statusPillStyles[order.status] || "bg-surface-elevated text-text-muted"
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 font-bold text-sm">{formatPrice(order.total)}</td>
                      <td className="py-4 text-xs text-text-muted font-medium">
                        {timeAgo(order.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="glass-card p-6 border border-border-subtle bg-coral/[0.02]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-heading font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-coral" /> Stock Alerts
            </h2>
            <Link href="/products" className="text-xs font-bold text-coral hover:underline">
              Manage
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-8 text-center text-text-muted">
                <Loader2 className="w-5 h-5 animate-spin inline-block text-coral" />
              </div>
            ) : lowStock.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white/50 border border-border-subtle text-center text-text-muted text-sm font-medium">
                All products are well stocked.
              </div>
            ) : (
              lowStock.map((item) => {
                const severity =
                  item.stock < 5 ? "Critical" : item.stock < 10 ? "Low" : "Warning";
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white/50 border border-border-subtle hover:border-coral/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-sm truncate pr-4">{item.name}</h3>
                      <span
                        className={cn(
                          "text-[9px] font-black uppercase px-2 py-0.5 rounded",
                          severity === "Critical"
                            ? "bg-coral text-white"
                            : severity === "Low"
                              ? "bg-gold text-midnight"
                              : "bg-midnight text-white"
                        )}
                      >
                        {severity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-text-muted uppercase tracking-tighter">
                        ID: {item.id}
                      </span>
                      <span className="text-xs font-bold text-text-secondary">
                        Stock: <span className="text-midnight">{item.stock}</span> left
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          severity === "Critical" ? "bg-coral" : "bg-gold"
                        )}
                        style={{ width: `${Math.min(100, (item.stock / 20) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Link
            href="/products"
            className="block text-center mt-6 py-3 rounded-2xl bg-coral/10 text-coral font-bold text-xs hover:bg-coral hover:text-white transition-all"
          >
            Manage Inventory
          </Link>
        </div>
      </div>
    </div>
  );
}
