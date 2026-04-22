"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Download,
  UserCheck,
  Mail,
  Phone,
  Ban,
  Trash2,
  MoreVertical,
  Loader2,
  Shield,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { AnimatePresence, motion } from "framer-motion";
import { http, ApiError } from "@/lib/api";
import type { AdminUser, Paginated, UserRole } from "@/lib/types";

const PAGE_SIZE = 20;

interface CustomerDetail extends AdminUser {
  stats?: { orders: number; totalSpent: number };
}

function fmtDate(d?: string) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

const ROLE_TABS: Array<"All" | UserRole> = ["All", "user", "admin"];

export default function CustomersPage() {
  const { toast } = useToast();

  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<(typeof ROLE_TABS)[number]>("All");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [showProfile, setShowProfile] = useState(false);
  const [selected, setSelected] = useState<CustomerDetail | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("q", searchTerm.trim());
      if (roleFilter !== "All") params.set("role", roleFilter);
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
      const res = await http.get<Paginated<AdminUser>>(`/users?${params.toString()}`);
      setItems(res.data);
      setTotal(res.total);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to load users";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, page, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openProfile = async (u: AdminUser) => {
    setSelected(u);
    setShowProfile(true);
    try {
      const [full, orderCount] = await Promise.all([
        http.get<{ success: true; data: AdminUser }>(`/users/${u.id}`),
        http
          .get<{ success: true; total: number; data: Array<{ total: number }> }>(
            `/orders/admin/all?userId=${u.id}&limit=100`
          )
          .catch(() => null),
      ]);
      const stats = orderCount
        ? {
            orders: orderCount.total,
            totalSpent: orderCount.data.reduce((s, o) => s + Number(o.total || 0), 0),
          }
        : { orders: 0, totalSpent: 0 };
      setSelected({ ...full.data, stats });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to load profile";
      toast(msg, "error");
    }
  };

  const handleToggleActive = async (u: AdminUser) => {
    setOpenMenuId(null);
    try {
      await http.put(`/users/${u.id}`, { isActive: !u.isActive });
      toast(`${u.name} ${u.isActive ? "deactivated" : "reactivated"}.`);
      if (selected?.id === u.id) setSelected({ ...selected, isActive: !u.isActive });
      fetchUsers();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Update failed";
      toast(msg, "error");
    }
  };

  const handleDelete = async (u: AdminUser) => {
    setOpenMenuId(null);
    if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    try {
      await http.delete(`/users/${u.id}`);
      toast(`${u.name} deleted.`, "info");
      if (selected?.id === u.id) setShowProfile(false);
      fetchUsers();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Delete failed";
      toast(msg, "error");
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Name", "Email", "Role", "Phone", "Active", "Created"];
    const rows = items.map((c) => [
      c.id,
      c.name,
      c.email,
      c.role,
      c.phone || "",
      c.isActive ? "yes" : "no",
      c.createdAt || "",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast("Exported as CSV");
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-8 animate-fade-in" onClick={() => setOpenMenuId(null)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight">
            Customer <span className="text-mint">Intelligence</span>
          </h1>
          <p className="text-text-muted mt-1 font-medium">
            Manage customer & admin accounts, roles and access.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-surface-elevated text-text-secondary font-bold text-sm border border-border-subtle hover:bg-white transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 p-1.5 bg-surface-elevated rounded-2xl w-fit border border-border-subtle">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setRoleFilter(tab);
                setPage(1);
              }}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold transition-all capitalize",
                roleFilter === tab
                  ? "bg-white text-midnight shadow-sm border border-border-subtle"
                  : "text-text-muted hover:text-midnight"
              )}
            >
              {tab === "user" ? "Customers" : tab === "admin" ? "Admins" : "All"}
            </button>
          ))}
        </div>

        <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative group w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-mint transition-colors" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full bg-surface/50 border border-border-subtle rounded-xl py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all text-sm font-medium"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden border border-border-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-elevated">
              <tr>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">User</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Contact</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Role</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Joined</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-text-muted">
                    <Loader2 className="w-5 h-5 animate-spin inline-block text-mint" />
                    <span className="ml-2 font-medium">Loading users…</span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-text-muted font-medium">
                    No users found.
                  </td>
                </tr>
              ) : (
                items.map((u) => (
                  <tr key={u.id} className="group hover:bg-surface-elevated/30 transition-colors">
                    <td className="p-5">
                      <button
                        onClick={() => openProfile(u)}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      >
                        <div className="w-10 h-10 rounded-full bg-surface-elevated border border-border-subtle flex items-center justify-center">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-text-secondary">
                              {u.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-midnight">{u.name}</p>
                          <p className="text-[11px] text-text-muted">ID #{u.id}</p>
                        </div>
                      </button>
                    </td>
                    <td className="p-5">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="flex items-center gap-1.5 text-text-secondary font-medium">
                          <Mail className="w-3 h-3 text-text-muted" /> {u.email}
                        </span>
                        {u.phone && (
                          <span className="flex items-center gap-1.5 text-text-muted">
                            <Phone className="w-3 h-3" /> {u.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-5">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                          u.role === "admin"
                            ? "bg-midnight text-warm-white"
                            : "bg-surface-elevated text-text-muted"
                        )}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-5">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                          u.isActive
                            ? "bg-mint/10 text-mint border-mint/20"
                            : "bg-coral/10 text-coral border-coral/20"
                        )}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-5 text-xs text-text-muted font-medium">{fmtDate(u.createdAt)}</td>
                    <td className="p-5">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openProfile(u)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle text-[10px] font-bold text-text-secondary hover:bg-white hover:text-midnight transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" /> Profile
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === u.id ? null : u.id)}
                            className="p-2 rounded-lg text-text-muted hover:bg-surface-elevated hover:text-midnight transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <AnimatePresence>
                            {openMenuId === u.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                className="absolute right-0 top-10 z-20 w-52 bg-white rounded-2xl border border-border-subtle shadow-xl overflow-hidden"
                              >
                                <button
                                  onClick={() => handleToggleActive(u)}
                                  className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-text-secondary hover:bg-surface-elevated hover:text-midnight transition-colors"
                                >
                                  <Ban className="w-3.5 h-3.5" />{" "}
                                  {u.isActive ? "Deactivate" : "Reactivate"}
                                </button>
                                <button
                                  onClick={() => handleDelete(u)}
                                  className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-coral hover:bg-coral/5 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete User
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

        <div className="p-5 bg-surface-elevated/50 flex items-center justify-between border-t border-border-subtle">
          <span className="text-xs text-text-muted font-medium">
            <Users className="w-3 h-3 inline-block mr-1" />
            Showing <span className="font-bold text-midnight">{items.length}</span> of{" "}
            <span className="font-bold text-midnight">{total}</span>
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

      {/* Profile modal */}
      <Modal open={showProfile} onClose={() => setShowProfile(false)} title="Customer Profile" size="md">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-mint/20 to-mint/5 border border-mint/20 flex items-center justify-center text-xl font-black text-mint">
                {selected.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-midnight">{selected.name}</h3>
                <p className="text-xs text-text-muted">{selected.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider",
                      selected.role === "admin"
                        ? "bg-midnight text-warm-white"
                        : "bg-surface-elevated text-text-muted"
                    )}
                  >
                    <Shield className="inline w-2.5 h-2.5 mr-1" />
                    {selected.role}
                  </span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider",
                      selected.isActive
                        ? "bg-mint/10 text-mint"
                        : "bg-coral/10 text-coral"
                    )}
                  >
                    {selected.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-surface-elevated text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Orders</p>
                <p className="text-lg font-black text-midnight mt-0.5">
                  {selected.stats ? selected.stats.orders : "—"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-surface-elevated text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Spent</p>
                <p className="text-lg font-black text-mint mt-0.5">
                  {selected.stats ? formatPrice(selected.stats.totalSpent) : "—"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-surface-elevated text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Joined</p>
                <p className="text-sm font-bold text-midnight mt-1">{fmtDate(selected.createdAt)}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-text-muted" />
                <span className="text-text-secondary">{selected.email}</span>
              </div>
              {selected.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-text-muted" />
                  <span className="text-text-secondary">{selected.phone}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-3 border-t border-border-subtle">
              <button
                onClick={() => handleToggleActive(selected)}
                className="flex-1 py-2 rounded-xl bg-surface-elevated text-text-secondary text-xs font-bold border border-border-subtle hover:bg-white transition-all"
              >
                {selected.isActive ? "Deactivate" : "Reactivate"}
              </button>
              <button
                onClick={() => handleDelete(selected)}
                className="flex-1 py-2 rounded-xl bg-coral/10 text-coral text-xs font-bold border border-coral/20 hover:bg-coral/20 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
