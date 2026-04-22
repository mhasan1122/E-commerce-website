"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Loader2, ExternalLink, ChevronLeft } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { http, ApiError } from "@/lib/api";
import type { ApiOrder, Paginated } from "@/lib/api-types";
import { formatPrice } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pending: "bg-charcoal/5 text-text-muted",
  paid: "bg-mint/10 text-mint",
  processing: "bg-gold/10 text-gold-dark",
  shipped: "bg-midnight/10 text-midnight",
  delivered: "bg-mint/10 text-mint",
  cancelled: "bg-coral/10 text-coral",
  refunded: "bg-coral/10 text-coral",
};

export default function MyOrdersPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const ready = useAuthStore((s) => s.ready);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!token) {
      router.replace("/login?redirect=/account/orders");
      return;
    }
    const run = async () => {
      try {
        const res = await http.get<Paginated<ApiOrder>>("/orders/my?limit=50");
        setOrders(res.data);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [ready, token, router]);

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-mint transition-colors mb-4"
        >
          <ChevronLeft size={16} /> Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] text-text-primary">
          My Orders
        </h1>
        <p className="text-text-muted mt-2">All your past orders with LUXE, in one place.</p>

        <div className="mt-8">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-text-muted">
              <Loader2 className="w-6 h-6 animate-spin text-mint mr-2" />
              <span>Loading…</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-coral/10 border border-coral/20 text-coral text-sm font-semibold">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-surface-elevated border border-border-subtle flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-text-muted" />
              </div>
              <p className="text-lg font-semibold text-text-primary">No orders yet</p>
              <p className="text-text-muted mt-1 mb-6">Start shopping to place your first order.</p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-mint text-midnight font-bold rounded-xl hover:bg-mint-dark transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-text-primary">#{o.orderNumber}</span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          statusStyles[o.status] || "bg-charcoal/5 text-text-muted"
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-mint">{formatPrice(o.total)}</span>
                    <span className="text-xs text-text-muted uppercase tracking-wider">
                      {o.paymentMethod} · {o.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
