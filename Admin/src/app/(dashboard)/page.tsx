"use client";

import React from "react";
import { 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  ExternalLink,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { StatsCard } from "@/components/StatsCard";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

const recentOrders = [
  { id: "#ORD-7429", customer: "Sarah Johnson", status: "Delivered", amount: 12450, date: "2 mins ago" },
  { id: "#ORD-7428", customer: "Michael Chen", status: "Processing", amount: 8900, date: "15 mins ago" },
  { id: "#ORD-7427", customer: "Emma Wilson", status: "Shipped", amount: 21000, date: "1 hour ago" },
  { id: "#ORD-7426", customer: "James Anderson", status: "Pending", amount: 5600, date: "3 hours ago" },
];

const lowStockItems = [
  { name: "Premium Leather Jacket", sku: "PL-001", stock: 3, status: "Critical" },
  { name: "Wireless Headphones X5", sku: "WH-X5", stock: 8, status: "Low" },
  { name: "Organic Cotton T-Shirt", sku: "OT-321", stock: 12, status: "Warning" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-text-primary tracking-tight">
            Dashboard <span className="text-mint">Overview</span>
          </h1>
          <p className="text-text-muted mt-2 font-medium">
            Welcome back, <span className="text-midnight font-bold">Hasan</span>. Here's what's happening today.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 rounded-2xl bg-surface-elevated text-text-secondary font-bold text-sm border border-border-subtle hover:bg-white transition-all flex items-center gap-2">
            Download Report
          </button>
          <button className="px-5 py-2.5 rounded-2xl bg-midnight text-warm-white font-bold text-sm shadow-xl shadow-midnight/20 hover:scale-[1.02] transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={formatPrice(1284500)}
          icon={DollarSign}
          trend={{ value: 12.5, isUp: true }}
          color="mint"
        />
        <StatsCard
          title="Active Orders"
          value="156"
          icon={ShoppingCart}
          trend={{ value: 8.2, isUp: true }}
          color="gold"
        />
        <StatsCard
          title="Total Products"
          value="2,840"
          icon={Package}
          color="midnight"
          description="Across 12 categories"
        />
        <StatsCard
          title="Return Rate"
          value="1.4%"
          icon={TrendingUp}
          trend={{ value: 0.5, isUp: false }}
          color="coral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 glass-card p-6 border border-border-subtle overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-heading font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-mint" /> Recent Orders
            </h2>
            <Link href="/orders" className="text-xs font-bold text-mint hover:underline flex items-center gap-1 group">
              View All Orders <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">Order ID</th>
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">Customer</th>
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">Status</th>
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">Amount</th>
                  <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-surface-elevated/50 transition-colors">
                    <td className="py-4 font-bold text-sm text-midnight">{order.id}</td>
                    <td className="py-4 font-medium text-sm text-text-secondary">{order.customer}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'Delivered' ? 'bg-mint/10 text-mint' : 
                        order.status === 'Processing' ? 'bg-gold/10 text-gold' : 
                        order.status === 'Shipped' ? 'bg-midnight/10 text-midnight' : 'bg-coral/10 text-coral'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-sm">{formatPrice(order.amount)}</td>
                    <td className="py-4 text-xs text-text-muted font-medium">{order.date}</td>
                  </tr>
                ))}
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
            <Link href="/inventory" className="text-xs font-bold text-coral hover:underline">
              Manage
            </Link>
          </div>

          <div className="space-y-4">
            {lowStockItems.map((item) => (
              <div key={item.sku} className="p-4 rounded-2xl bg-white/50 border border-border-subtle hover:border-coral/30 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm truncate pr-4">{item.name}</h3>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                    item.status === 'Critical' ? 'bg-coral text-white' : 
                    item.status === 'Low' ? 'bg-gold text-midnight' : 'bg-midnight text-white'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-medium text-text-muted uppercase tracking-tighter">SKU: {item.sku}</span>
                  <span className="text-xs font-bold text-text-secondary">Stock: <span className="text-midnight">{item.stock}</span> left</span>
                </div>
                <div className="mt-3 h-1.5 w-full bg-surface-elevated rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${item.status === 'Critical' ? 'bg-coral' : 'bg-gold'}`} 
                    style={{ width: `${(item.stock / 20) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-6 py-3 rounded-2xl bg-coral/10 text-coral font-bold text-xs hover:bg-coral hover:text-white transition-all">
            Generate Restock Order
          </button>
        </div>
      </div>
    </div>
  );
}
