"use client";

import React, { useState, useMemo } from "react";
import { 
  ShieldCheck, Plus, Search, UserPlus, ShieldAlert, Settings2,
  ChevronRight, Lock, Users, ExternalLink, Trash2, X, Mail, KeyRound
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { AnimatePresence, motion } from "framer-motion";

type StaffMember = {
  id: number;
  name: string;
  role: string;
  email: string;
  status: "Active" | "Inactive";
  permissions: string;
};

type Role = {
  id: number;
  name: string;
  count: number;
  description: string;
  permissions: string[];
};

const initialStaff: StaffMember[] = [
  { id: 1, name: "Hasan Mirza", role: "Super Admin", email: "hasan@admin.com", status: "Active", permissions: "Full Access" },
  { id: 2, name: "Muna Alam", role: "Store Manager", email: "muna@store.com", status: "Active", permissions: "Products, Orders, Customers" },
  { id: 3, name: "Sufian Khan", role: "Support Staff", email: "sufian@support.com", status: "Inactive", permissions: "Orders, Customers" },
  { id: 4, name: "Ria Ahmed", role: "Content Editor", email: "ria@cms.com", status: "Active", permissions: "CMS, Blogs" },
];

const initialRoles: Role[] = [
  { id: 1, name: "Super Admin", count: 2, description: "Total control over all store assets, financial reports, and staff management.", permissions: ["View Orders", "Edit Products", "Manage Staff", "Access Reports", "Financial Data"] },
  { id: 2, name: "Store Manager", count: 3, description: "Manage products, orders, customers, and basic analytical reports.", permissions: ["View Orders", "Edit Products", "Manage Customers", "View Reports"] },
  { id: 3, name: "Support Staff", count: 5, description: "Can view and update orders, customer notes, and handle returns.", permissions: ["View Orders", "Customer Notes", "Process Returns"] },
  { id: 4, name: "Editor", count: 2, description: "Can modify homepage banners, content pages, and blog posts.", permissions: ["Edit CMS", "Manage Blogs", "Upload Banners"] },
];

const availableRoles = initialRoles.map((r) => r.name);

const emptyStaffForm = { name: "", email: "", role: "", password: "" };
const emptyRoleForm = { name: "", description: "" };

export default function StaffRolesPage() {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<"users" | "roles">("users");
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showAudit, setShowAudit] = useState(false);
  const [showConfigRole, setShowConfigRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [roleForm, setRoleForm] = useState(emptyRoleForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);

  const filteredStaff = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return staff.filter((s) => !term || s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term));
  }, [staff, searchTerm]);

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const roleData = roles.find((r) => r.name === staffForm.role);
    const newMember: StaffMember = {
      id: Date.now(),
      name: staffForm.name.trim(),
      email: staffForm.email.trim(),
      role: staffForm.role,
      status: "Active",
      permissions: roleData?.permissions.join(", ") || "Basic Access",
    };
    setStaff((prev) => [...prev, newMember]);
    setRoles((prev) => prev.map((r) => r.name === staffForm.role ? { ...r, count: r.count + 1 } : r));
    setShowAddStaff(false);
    setStaffForm(emptyStaffForm);
    toast(`${newMember.name} added to the team!`);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    const newRole: Role = {
      id: Date.now(),
      name: roleForm.name.trim(),
      count: 0,
      description: roleForm.description.trim(),
      permissions: ["View Dashboard"],
    };
    setRoles((prev) => [...prev, newRole]);
    setShowCreateRole(false);
    setRoleForm(emptyRoleForm);
    toast(`Role "${newRole.name}" created!`);
  };

  const handleDeleteStaff = () => {
    if (!deletingStaff) return;
    setStaff((prev) => prev.filter((s) => s.id !== deletingStaff.id));
    setRoles((prev) => prev.map((r) => r.name === deletingStaff.role ? { ...r, count: Math.max(0, r.count - 1) } : r));
    setShowDeleteConfirm(false);
    toast(`${deletingStaff.name} removed.`, "error");
    setDeletingStaff(null);
  };

  const handleToggleStatus = (member: StaffMember) => {
    const newStatus = member.status === "Active" ? "Inactive" : "Active";
    setStaff((prev) => prev.map((s) => s.id === member.id ? { ...s, status: newStatus } : s));
    toast(`${member.name} ${newStatus === "Active" ? "reactivated" : "deactivated"}.`, newStatus === "Active" ? "success" : "info");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight">
            Staff & <span className="text-mint">Roles</span>
          </h1>
          <p className="text-text-muted mt-1 font-medium italic">
            Manage administrative access and define granular permissions for your team.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowAudit(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-surface-elevated text-text-secondary font-bold text-sm border border-border-subtle hover:bg-white transition-all">
            <Lock className="w-4 h-4" /> Security Audit
          </button>
          <button onClick={() => activeView === "users" ? setShowAddStaff(true) : setShowCreateRole(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-midnight text-warm-white font-bold text-sm shadow-xl shadow-midnight/20 hover:scale-[1.02] transition-all">
            {activeView === "users" ? <UserPlus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {activeView === "users" ? "Add Staff Member" : "Create New Role"}
          </button>
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex items-center gap-3 border-b border-border-subtle pb-1">
        {[
          { id: "users" as const, label: "Team Members" },
          { id: "roles" as const, label: "Roles & Permissions" },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setActiveView(id)}
            className={cn("pb-3 px-6 text-sm font-bold tracking-tight transition-all relative",
              activeView === id ? "text-mint" : "text-text-muted hover:text-midnight")}>
            {label}
            {activeView === id && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-mint" />}
          </button>
        ))}
      </div>

      {activeView === "users" ? (
        <>
          {/* Filters */}
          <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
            <div className="relative group w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-mint" />
              <input type="text" placeholder="Search staff by name or email..."
                className="w-full bg-surface/50 border border-border-subtle rounded-xl py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all text-sm font-medium"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest hidden md:block">
                Active Members: <span className="text-mint">{staff.filter((s) => s.status === "Active").length}</span>
              </span>
            </div>
          </div>

          {/* Staff Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {filteredStaff.length === 0 ? (
              <div className="col-span-4 p-12 text-center text-text-muted glass-card rounded-3xl">No staff members found.</div>
            ) : (
              filteredStaff.map((member) => (
                <div key={member.id} className="glass-card p-6 border border-border-subtle hover:border-mint/30 transition-all group relative overflow-hidden">
                  <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-mint/10 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-midnight/5 border border-border-subtle flex items-center justify-center p-0.5">
                      <img src={`https://ui-avatars.com/api/?name=${member.name}&background=C8A97E&color=0a0a1a`}
                        alt={member.name} className="w-full h-full rounded-xl" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-midnight truncate">{member.name}</h3>
                      <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">{member.role}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">Permissions</span>
                      <p className="text-xs font-medium text-text-secondary truncate">{member.permissions}</p>
                    </div>
                    <div className="pt-4 border-t border-border-subtle/50 flex items-center justify-between">
                      <button onClick={() => handleToggleStatus(member)}
                        className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer hover:opacity-80 transition-opacity",
                          member.status === "Active" ? "bg-mint/10 text-mint" : "bg-coral/10 text-coral")}>
                        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", member.status === "Active" ? "bg-mint" : "bg-coral")} />
                        {member.status}
                      </button>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toast(`Editing ${member.name}'s permissions...`, "info")}
                          className="p-2 rounded-lg text-text-muted hover:bg-surface-elevated hover:text-midnight transition-colors">
                          <Settings2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => { setDeletingStaff(member); setShowDeleteConfirm(true); }}
                          className="p-2 rounded-lg text-text-muted hover:bg-coral/10 hover:text-coral transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* Roles View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {roles.map((role) => (
              <div key={role.id} className="glass-card p-8 border border-border-subtle hover:border-mint/50 transition-all flex flex-col md:flex-row gap-8 group">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-mint/10 flex items-center justify-center text-mint">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-bold text-midnight">{role.name}</h3>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">{role.count} Active Users</span>
                    </div>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed italic">"{role.description}"</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {role.permissions.slice(0, 3).map((p) => (
                      <span key={p} className="px-2.5 py-1 rounded-lg text-[9px] font-bold border bg-surface-elevated border-border-subtle">{p}</span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="px-2.5 py-1 rounded-lg text-[9px] font-bold bg-midnight/5 text-midnight">+{role.permissions.length - 3} More</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <button onClick={() => { setSelectedRole(role); setShowConfigRole(true); }}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-midnight text-warm-white text-xs font-bold hover:bg-mint hover:text-midnight hover:scale-105 transition-all shadow-xl shadow-midnight/10">
                    Configure <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Security Notice */}
          <div className="p-6 rounded-3xl bg-midnight text-warm-white flex items-start gap-4 border border-mint/20 shadow-2xl shadow-mint/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-mint/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="p-2 rounded-xl bg-mint/20 text-mint mt-1"><ShieldAlert className="w-6 h-6" /></div>
            <div>
              <h4 className="text-lg font-heading font-bold text-mint">Security Notice</h4>
              <p className="text-sm text-warm-white/70 max-w-2xl mt-1 font-medium leading-relaxed">
                Granular permissions allow you to restrict sensitive data like financial reports from general staff.
                Ensure that at least two users have "Super Admin" privileges for recovery purposes.
              </p>
              <button onClick={() => toast("Opening RBAC documentation...", "info")}
                className="mt-4 text-xs font-bold text-mint hover:underline flex items-center gap-1.5 uppercase tracking-widest">
                Learn more about RBAC <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal open={showAddStaff} onClose={() => setShowAddStaff(false)} title="Add Staff Member">
        <form onSubmit={handleAddStaff} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Full Name *</label>
            <input required value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="e.g. Fatema Begum" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Email Address *</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input required type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                className="w-full border border-border-subtle rounded-xl px-4 py-2.5 pl-11 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="email@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Role *</label>
            <select required value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all">
              <option value="">Select a role</option>
              {availableRoles.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Temporary Password *</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input required type="password" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                className="w-full border border-border-subtle rounded-xl px-4 py-2.5 pl-11 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="Minimum 8 characters" minLength={8} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAddStaff(false)}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all">
              Add Member
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Role Modal */}
      <Modal open={showCreateRole} onClose={() => setShowCreateRole(false)} title="Create New Role" size="sm">
        <form onSubmit={handleCreateRole} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Role Name *</label>
            <input required value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="e.g. Marketing Manager" />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Description</label>
            <textarea value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
              rows={3} placeholder="What can this role do?"
              className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowCreateRole(false)}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all">Cancel</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all">
              Create Role
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Remove Staff Member" size="sm">
        <div className="space-y-5">
          <p className="text-sm text-text-secondary leading-relaxed">
            Are you sure you want to remove <span className="font-bold text-midnight">{deletingStaff?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all">Cancel</button>
            <button onClick={handleDeleteStaff}
              className="flex-1 py-2.5 rounded-xl bg-coral text-white text-sm font-bold hover:scale-[1.02] transition-all shadow-lg shadow-coral/20">
              Remove Member
            </button>
          </div>
        </div>
      </Modal>

      {/* Configure Role Modal */}
      <Modal open={showConfigRole} onClose={() => setShowConfigRole(false)} title={`Configure — ${selectedRole?.name}`} size="lg">
        {selectedRole && (
          <div className="space-y-5">
            <p className="text-sm text-text-secondary italic">"{selectedRole.description}"</p>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3">Current Permissions</p>
              <div className="flex flex-wrap gap-2">
                {selectedRole.permissions.map((p) => (
                  <span key={p} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-mint/10 text-mint text-xs font-bold border border-mint/20">
                    {p}
                    <button onClick={() => {
                      setRoles((prev) => prev.map((r) => r.id === selectedRole.id
                        ? { ...r, permissions: r.permissions.filter((x) => x !== p) }
                        : r));
                      setSelectedRole((prev) => prev ? { ...prev, permissions: prev.permissions.filter((x) => x !== p) } : prev);
                    }}
                      className="hover:text-coral transition-colors"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
            <button onClick={() => toast("Role configuration saved!", "success")}
              className="w-full py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all">
              Save Configuration
            </button>
          </div>
        )}
      </Modal>

      {/* Security Audit Modal */}
      <Modal open={showAudit} onClose={() => setShowAudit(false)} title="Security Audit" size="lg">
        <div className="space-y-4">
          {[
            { check: "Two-Factor Authentication", status: "Enabled", ok: true },
            { check: "Super Admin backup access", status: "2 accounts have full access", ok: true },
            { check: "Inactive staff accounts", status: `${staff.filter((s) => s.status === "Inactive").length} inactive accounts found`, ok: staff.filter((s) => s.status === "Inactive").length === 0 },
            { check: "Last password rotation", status: "45 days ago", ok: false },
            { check: "API key exposure", status: "No exposed keys found", ok: true },
          ].map(({ check, status, ok }) => (
            <div key={check} className="flex items-center justify-between p-4 rounded-2xl bg-surface-elevated">
              <div className="flex items-center gap-3">
                <div className={cn("w-2.5 h-2.5 rounded-full", ok ? "bg-mint" : "bg-coral")} />
                <span className="text-sm font-bold text-midnight">{check}</span>
              </div>
              <span className={cn("text-xs font-medium", ok ? "text-mint" : "text-coral")}>{status}</span>
            </div>
          ))}
          <button onClick={() => { toast("Full security report downloaded!"); setShowAudit(false); }}
            className="w-full py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all mt-2">
            Download Full Report
          </button>
        </div>
      </Modal>
    </div>
  );
}
