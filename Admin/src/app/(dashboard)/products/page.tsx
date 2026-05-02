"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Upload,
  X,
  ImagePlus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice, cn } from "@/lib/utils";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";
import { http, ApiError, uploadImage } from "@/lib/api";
import type { Product, Category, Paginated } from "@/lib/types";

const PAGE_SIZE = 8;

const IMG_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'%3E%3Crect width='56' height='56' fill='%23f1f5f9'/%3E%3Cpath d='M10 40 l12-16 8 10 6-7 10 13z' fill='%23cbd5e1'/%3E%3Ccircle cx='38' cy='18' r='5' fill='%23cbd5e1'/%3E%3C/svg%3E";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function statusLabel(p: Product) {
  if (p.stock === 0) return "Out of Stock";
  if (p.stock < 15) return "Low Stock";
  return "Active";
}

const statusColor: Record<string, string> = {
  Active: "bg-mint/10 text-mint",
  "Low Stock": "bg-gold/10 text-gold",
  "Out of Stock": "bg-coral/10 text-coral",
};

type FormState = {
  name: string;
  slug: string;
  description: string;
  price: string;
  oldPrice: string;
  stock: string;
  categoryId: string;
  badge: "" | "hot" | "new" | "sale";
  images: string;
  colors: string;
  sizes: string;
  features: string;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  price: "",
  oldPrice: "",
  stock: "",
  categoryId: "",
  badge: "",
  images: "",
  colors: "",
  sizes: "",
  features: "",
};

function productToForm(p: Product): FormState {
  return {
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    price: String(p.price ?? ""),
    oldPrice: p.oldPrice ? String(p.oldPrice) : "",
    stock: String(p.stock ?? 0),
    categoryId: p.categoryId ? String(p.categoryId) : "",
    badge: p.badge || "",
    images: (p.images || []).join("\n"),
    colors: (p.colors || []).join(", "),
    sizes: (p.sizes || []).join(", "),
    features: (p.features || []).join(", "),
  };
}

function formToPayload(form: FormState) {
  const toList = (s: string, sep: RegExp | string = /[,\n]/) =>
    s
      .split(sep)
      .map((x) => x.trim())
      .filter(Boolean);

  return {
    name: form.name.trim(),
    slug: form.slug.trim() || slugify(form.name),
    description: form.description.trim() || null,
    price: Number(form.price),
    oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
    stock: Number(form.stock),
    categoryId: form.categoryId ? Number(form.categoryId) : null,
    badge: form.badge || null,
    images: toList(form.images, "\n"),
    colors: toList(form.colors),
    sizes: toList(form.sizes),
    features: toList(form.features),
    isActive: true,
  };
}

export default function ProductsPage() {
  const { toast } = useToast();

  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [sortField, setSortField] = useState<
    "created" | "price" | "rating" | "best"
  >("created");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  /* ---------- fetchers ---------- */

  const fetchCategories = useCallback(async () => {
    try {
      const res = await http.get<{ success: true; data: Category[] }>(
        "/categories",
        { auth: false }
      );
      setCategories(res.data);
    } catch {
      /* non-fatal */
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("q", searchTerm.trim());
      if (filterCategory !== "All") params.set("category", filterCategory);
      const sortVal =
        sortField === "price"
          ? sortAsc
            ? "price_asc"
            : "price_desc"
          : sortField === "rating"
            ? "rating"
            : sortField === "best"
              ? "best_sellers"
              : "newest";
      params.set("sort", sortVal);
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));

      const res = await http.get<Paginated<Product>>(
        `/products?${params.toString()}`
      );
      let list = res.data;
      if (filterStatus !== "All") {
        list = list.filter((p) => statusLabel(p) === filterStatus);
      }
      setItems(list);
      setTotal(res.total);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Failed to load products";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterCategory, filterStatus, sortField, sortAsc, page, toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ---------- handlers ---------- */

  const openAdd = () => {
    setForm(emptyForm);
    setShowAdd(true);
  };
  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm(productToForm(p));
    setShowEdit(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = formToPayload(form);
    setSubmitting(true);
    try {
      if (showAdd) {
        await http.post("/products", payload);
        toast(`"${payload.name}" added`);
        setShowAdd(false);
      } else if (showEdit && editProduct) {
        await http.put(`/products/${editProduct.id}`, payload);
        toast(`"${payload.name}" updated`);
        setShowEdit(false);
      }
      setPage(1);
      fetchProducts();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Save failed";
      toast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p: Product) => {
    setOpenMenuId(null);
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await http.delete(`/products/${p.id}`);
      toast(`"${p.name}" deleted`, "error");
      fetchProducts();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Delete failed";
      toast(msg, "error");
    }
  };

  const handleDuplicate = async (p: Product) => {
    setOpenMenuId(null);
    try {
      const payload = {
        name: `${p.name} (Copy)`,
        slug: `${p.slug}-copy-${Date.now()}`,
        description: p.description ?? null,
        price: p.price,
        oldPrice: p.oldPrice ?? null,
        stock: p.stock,
        categoryId: p.categoryId ?? null,
        badge: p.badge ?? null,
        images: p.images ?? [],
        colors: p.colors ?? [],
        sizes: p.sizes ?? [],
        features: p.features ?? [],
        isActive: true,
      };
      await http.post("/products", payload);
      toast(`"${p.name}" duplicated`);
      fetchProducts();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Duplicate failed";
      toast(msg, "error");
    }
  };

  const exportCSV = () => {
    const headers = ["ID", "Name", "Slug", "Category", "Stock", "Price", "Status"];
    const rows = items.map((p) => [
      p.id,
      p.name,
      p.slug,
      p.category || "—",
      p.stock,
      p.price,
      statusLabel(p),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast("Products exported as CSV!");
  };

  /* ---------- image upload helpers ---------- */

  const appendImageUrls = (urls: string[]) => {
    setForm((prev) => {
      const existing = prev.images.trim();
      const joined = urls.join("\n");
      return { ...prev, images: existing ? `${existing}\n${joined}` : joined };
    });
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setUploadingImage(true);
    try {
      const urls: string[] = [];
      for (const file of list) {
        const url = await uploadImage(file);
        urls.push(url);
      }
      appendImageUrls(urls);
      toast(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded successfully`);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Image upload failed";
      toast(msg, "error");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeImageUrl = (urlToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images
        .split("\n")
        .filter((u) => u.trim() !== urlToRemove.trim())
        .join("\n"),
    }));
  };

  /* ---------- form UI ---------- */
  const formFields = (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div>
        <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">
          Product Name *
        </label>
        <input
          required
          value={form.name}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
              slug: form.slug || slugify(e.target.value),
            })
          }
          className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all"
          placeholder="e.g. Premium Silk Saree"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Slug</label>
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all"
            placeholder="auto-generated"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all bg-white"
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all"
          placeholder="Short product description"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Price (৳) *</label>
          <input
            required
            type="number"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Old Price (৳)</label>
          <input
            type="number"
            min="0"
            value={form.oldPrice}
            onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
            className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all"
            placeholder="optional"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Stock *</label>
          <input
            required
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all"
            placeholder="0"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Badge</label>
        <select
          value={form.badge}
          onChange={(e) => setForm({ ...form, badge: e.target.value as FormState["badge"] })}
          className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all bg-white"
        >
          <option value="">None</option>
          <option value="hot">Hot</option>
          <option value="new">New</option>
          <option value="sale">Sale</option>
        </select>
      </div>
      {/* Images section */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-text-muted uppercase tracking-widest">
          Product Images
        </label>

        {/* Drop zone */}
        <div
          className={cn(
            "relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
            isDragOver
              ? "border-mint bg-mint/5"
              : "border-border-subtle hover:border-mint/50 hover:bg-surface-elevated/50"
          )}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          {uploadingImage ? (
            <div className="flex flex-col items-center gap-2 py-1">
              <Loader2 className="w-6 h-6 animate-spin text-mint" />
              <p className="text-xs font-semibold text-text-muted">Uploading…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="w-10 h-10 rounded-full bg-mint/10 flex items-center justify-center">
                <ImagePlus className="w-5 h-5 text-mint" />
              </div>
              <p className="text-xs font-semibold text-midnight">Click to upload or drag &amp; drop</p>
              <p className="text-[10px] text-text-muted">JPG, PNG, WEBP, GIF up to 10 MB · multiple files OK</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />
        </div>

        {/* Image previews */}
        {form.images.trim() && (
          <div className="flex flex-wrap gap-2">
            {form.images
              .split("\n")
              .map((u) => u.trim())
              .filter(Boolean)
              .map((url, i) => (
                <div key={i} className="relative group w-16 h-16">
                  <img
                    src={url}
                    alt={`preview-${i}`}
                    className="w-full h-full object-cover rounded-xl border border-border-subtle"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = IMG_PLACEHOLDER;
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImageUrl(url)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-coral text-white rounded-full text-xs hidden group-hover:flex items-center justify-center shadow-md transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-16 rounded-xl border-2 border-dashed border-border-subtle hover:border-mint/50 flex items-center justify-center text-text-muted hover:text-mint transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Colors</label>
          <input
            value={form.colors}
            onChange={(e) => setForm({ ...form, colors: e.target.value })}
            className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all"
            placeholder="red, blue"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Sizes</label>
          <input
            value={form.sizes}
            onChange={(e) => setForm({ ...form, sizes: e.target.value })}
            className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all"
            placeholder="S, M, L"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Features</label>
          <input
            value={form.features}
            onChange={(e) => setForm({ ...form, features: e.target.value })}
            className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all"
            placeholder="Waterproof, Warranty"
          />
        </div>
      </div>
      <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-1">
        <button
          type="button"
          onClick={() => {
            setShowAdd(false);
            setShowEdit(false);
          }}
          className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all shadow-lg shadow-midnight/20 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {showAdd ? "Add Product" : "Save Changes"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-8 animate-fade-in" onClick={() => setOpenMenuId(null)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary tracking-tight">
            Product <span className="text-mint">Management</span>
          </h1>
          <p className="text-text-muted mt-1 font-medium italic">
            Manage your inventory, catalogs, and product variants.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-surface-elevated text-text-secondary font-bold text-sm border border-border-subtle hover:bg-white transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-midnight text-warm-white font-bold text-sm shadow-xl shadow-midnight/20 hover:scale-[1.02] transition-all"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative group w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-mint transition-colors" />
          <input
            type="text"
            placeholder="Search by name..."
            className="w-full bg-surface/50 border border-border-subtle rounded-xl py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowFilter(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-sm font-bold text-text-secondary hover:text-midnight transition-all"
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filterCategory !== "All" || filterStatus !== "All") && (
              <span className="w-2 h-2 rounded-full bg-mint" />
            )}
          </button>
          <select
            value={`${sortField}-${sortAsc}`}
            onChange={(e) => {
              const [field, asc] = e.target.value.split("-");
              setSortField(field as typeof sortField);
              setSortAsc(asc === "true");
            }}
            className="px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-sm font-bold text-text-secondary bg-white"
          >
            <option value="created-false">Newest</option>
            <option value="created-true">Oldest</option>
            <option value="price-true">Price: Low → High</option>
            <option value="price-false">Price: High → Low</option>
            <option value="rating-false">Top Rated</option>
            <option value="best-false">Best Sellers</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden border border-border-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-elevated">
              <tr>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Product</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Category</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Inventory</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Price</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/40">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-text-muted">
                    <Loader2 className="w-5 h-5 animate-spin inline-block text-mint" />
                    <span className="ml-2 font-medium">Loading products…</span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-text-muted font-medium">
                    No products found.
                  </td>
                </tr>
              ) : (
                items.map((product) => {
                  const status = statusLabel(product);
                  const image = product.images?.[0] || IMG_PLACEHOLDER;
                  return (
                    <tr key={product.id} className="group hover:bg-surface-elevated/30 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-border-subtle bg-surface-elevated relative flex-shrink-0">
                            <img
                              src={image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = IMG_PLACEHOLDER;
                              }}
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-midnight group-hover:text-mint transition-colors truncate max-w-[220px]">
                              {product.name}
                            </span>
                            <span className="text-[10px] font-medium text-text-muted uppercase tracking-tight mt-0.5">
                              SKU: PROD-{String(product.id).padStart(3, "0")}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className="px-2 py-0.5 rounded-md bg-midnight/5 text-midnight text-[10px] font-bold w-fit uppercase inline-block">
                          {product.category || "—"}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col gap-2">
                          <span className="text-xs font-bold">{product.stock} Units</span>
                          <div className="h-1.5 w-24 bg-surface-elevated rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                product.stock === 0
                                  ? "bg-coral"
                                  : product.stock < 20
                                    ? "bg-gold"
                                    : "bg-mint"
                              )}
                              style={{ width: `${Math.min(product.stock, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-5 font-bold text-sm text-midnight">{formatPrice(product.price)}</td>
                      <td className="p-5">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                            statusColor[status]
                          )}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setViewProduct(product);
                              setShowView(true);
                            }}
                            className="p-2 rounded-lg text-text-muted hover:bg-surface-elevated hover:text-midnight transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEdit(product)}
                            className="p-2 rounded-lg text-text-muted hover:bg-surface-elevated hover:text-mint transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenMenuId(openMenuId === product.id ? null : product.id)
                              }
                              className="p-2 rounded-lg text-text-muted hover:bg-surface-elevated hover:text-midnight transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                              {openMenuId === product.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  className="absolute right-0 top-10 z-20 w-40 bg-white rounded-2xl border border-border-subtle shadow-xl overflow-hidden"
                                >
                                  <button
                                    onClick={() => handleDuplicate(product)}
                                    className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-text-secondary hover:bg-surface-elevated hover:text-midnight transition-colors"
                                  >
                                    <Copy className="w-3.5 h-3.5" /> Duplicate
                                  </button>
                                  <button
                                    onClick={() => handleDelete(product)}
                                    className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-coral hover:bg-coral/5 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
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

        {/* Pagination */}
        <div className="p-5 bg-surface-elevated/50 flex items-center justify-between border-t border-border-subtle">
          <span className="text-xs text-text-muted font-medium">
            Showing <span className="font-bold text-midnight">{items.length}</span> of{" "}
            <span className="font-bold text-midnight">{total}</span> products
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-border-subtle text-xs font-bold disabled:opacity-30 hover:bg-white transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-midnight">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-border-subtle text-xs font-bold disabled:opacity-30 hover:bg-white transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Product" size="lg">
        {formFields}
      </Modal>
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Product" size="lg">
        {formFields}
      </Modal>

      <Modal open={showView} onClose={() => setShowView(false)} title="Product Details" size="lg">
        {viewProduct && (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <img
                src={viewProduct.images?.[0] || IMG_PLACEHOLDER}
                alt={viewProduct.name}
                className="w-24 h-24 rounded-2xl object-cover border border-border-subtle bg-surface-elevated"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = IMG_PLACEHOLDER;
                }}
              />
              <div>
                <h3 className="text-xl font-bold text-midnight">{viewProduct.name}</h3>
                <p className="text-xs text-text-muted uppercase tracking-widest mt-1">
                  SKU: PROD-{String(viewProduct.id).padStart(3, "0")}
                </p>
                <span
                  className={cn(
                    "mt-2 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                    statusColor[statusLabel(viewProduct)]
                  )}
                >
                  {statusLabel(viewProduct)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Category", value: viewProduct.category || "—" },
                { label: "Stock", value: `${viewProduct.stock} units` },
                { label: "Price", value: formatPrice(viewProduct.price) },
                { label: "Sold", value: String(viewProduct.soldCount || 0) },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 rounded-2xl bg-surface-elevated">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</span>
                  <p className="text-sm font-bold text-midnight mt-1">{value}</p>
                </div>
              ))}
            </div>
            {viewProduct.description && (
              <p className="text-sm text-text-secondary leading-relaxed">{viewProduct.description}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowView(false);
                  openEdit(viewProduct);
                }}
                className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all shadow-lg"
              >
                <Edit className="w-4 h-4 inline mr-2" /> Edit Product
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showFilter} onClose={() => setShowFilter(false)} title="Filter Products" size="sm">
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setFilterCategory("All");
                  setPage(1);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                  filterCategory === "All"
                    ? "bg-mint text-midnight border-mint"
                    : "bg-surface-elevated border-border-subtle text-text-secondary hover:border-mint/40"
                )}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setFilterCategory(c.slug);
                    setPage(1);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                    filterCategory === c.slug
                      ? "bg-mint text-midnight border-mint"
                      : "bg-surface-elevated border-border-subtle text-text-secondary hover:border-mint/40"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {["All", "Active", "Low Stock", "Out of Stock"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setFilterStatus(s);
                    setPage(1);
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                    filterStatus === s
                      ? "bg-mint text-midnight border-mint"
                      : "bg-surface-elevated border-border-subtle text-text-secondary hover:border-mint/40"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setFilterCategory("All");
                setFilterStatus("All");
                setPage(1);
              }}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all"
            >
              Clear All
            </button>
            <button
              onClick={() => {
                setShowFilter(false);
                setPage(1);
              }}
              className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
