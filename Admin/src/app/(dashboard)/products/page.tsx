"use client";

import React, { useState, useMemo } from "react";
import { 
  Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Copy, Eye,
  ArrowUpDown, Download, Upload, X, ChevronLeft, ChevronRight, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice, cn } from "@/lib/utils";
import { Modal } from "@/components/Modal";
import { useToast } from "@/components/Toast";

type Product = {
  id: number;
  name: string;
  category: string;
  brand: string;
  stock: number;
  price: number;
  status: "Active" | "Low Stock" | "Out of Stock";
  image: string;
};

const initialProducts: Product[] = [
  { id: 1, name: "Premium Silk Saree", category: "Ethnic", brand: "Aarong", stock: 45, price: 12500, status: "Active", image: "https://placehold.co/100x100" },
  { id: 2, name: "Leather Messenger Bag", category: "Accessories", brand: "Wildcraft", stock: 12, price: 4200, status: "Low Stock", image: "https://placehold.co/100x100" },
  { id: 3, name: "Floral Print Kurta", category: "Menswear", brand: "Yellow", stock: 89, price: 2800, status: "Active", image: "https://placehold.co/100x100" },
  { id: 4, name: "Embroidered Panjabi", category: "Menswear", brand: "Cats Eye", stock: 0, price: 5500, status: "Out of Stock", image: "https://placehold.co/100x100" },
  { id: 5, name: "Cotton Kurti Set", category: "Ethnic", brand: "Aarong", stock: 33, price: 3200, status: "Active", image: "https://placehold.co/100x100" },
  { id: 6, name: "Denim Jacket", category: "Casual", brand: "Yellow", stock: 8, price: 6800, status: "Low Stock", image: "https://placehold.co/100x100" },
];

const categories = ["Ethnic", "Accessories", "Menswear", "Casual", "Footwear", "Sportswear"];
const brands = ["Aarong", "Wildcraft", "Yellow", "Cats Eye", "Lubnan", "Westecs"];
const PAGE_SIZE = 4;

function getStatus(stock: number): Product["status"] {
  if (stock === 0) return "Out of Stock";
  if (stock < 15) return "Low Stock";
  return "Active";
}

function exportCSV(products: Product[]) {
  const headers = ["ID", "Name", "Category", "Brand", "Stock", "Price", "Status"];
  const rows = products.map((p) => [
    `PROD-00${p.id}`, p.name, p.category, p.brand, p.stock, p.price, p.status
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "products.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const emptyForm = { name: "", category: "", brand: "", stock: "", price: "" };

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState<"name" | "price" | "stock">("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const term = searchTerm.toLowerCase();
      const matchSearch = !term || p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term);
      const matchCat = filterCategory === "All" || p.category === filterCategory;
      const matchStatus = filterStatus === "All" || p.status === filterStatus;
      return matchSearch && matchCat && matchStatus;
    });
    list = [...list].sort((a, b) => {
      const va = a[sortField]; const vb = b[sortField];
      return sortAsc ? (va < vb ? -1 : 1) : (va > vb ? -1 : 1);
    });
    return list;
  }, [products, searchTerm, filterCategory, filterStatus, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const handleAddOpen = () => { setForm(emptyForm); setShowAdd(true); };
  const handleEditOpen = (p: Product) => {
    setEditProduct(p);
    setForm({ name: p.name, category: p.category, brand: p.brand, stock: String(p.stock), price: String(p.price) });
    setShowEdit(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stock = Number(form.stock);
    const newId = Math.max(...products.map((p) => p.id)) + 1;
    const newProduct: Product = {
      id: newId,
      name: form.name.trim(),
      category: form.category,
      brand: form.brand,
      stock,
      price: Number(form.price),
      status: getStatus(stock),
      image: "https://placehold.co/100x100",
    };
    setProducts((prev) => [newProduct, ...prev]);
    setShowAdd(false);
    toast(`"${newProduct.name}" added successfully!`);
    setPage(1);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    const stock = Number(form.stock);
    const updated: Product = {
      ...editProduct,
      name: form.name.trim(),
      category: form.category,
      brand: form.brand,
      stock,
      price: Number(form.price),
      status: getStatus(stock),
    };
    setProducts((prev) => prev.map((p) => (p.id === editProduct.id ? updated : p)));
    setShowEdit(false);
    toast(`"${updated.name}" updated successfully!`);
  };

  const handleDelete = (p: Product) => {
    setProducts((prev) => prev.filter((x) => x.id !== p.id));
    setOpenMenuId(null);
    toast(`"${p.name}" deleted.`, "error");
  };

  const handleDuplicate = (p: Product) => {
    const newId = Math.max(...products.map((x) => x.id)) + 1;
    setProducts((prev) => [...prev, { ...p, id: newId, name: `${p.name} (Copy)` }]);
    setOpenMenuId(null);
    toast(`"${p.name}" duplicated!`);
  };

  const formFields = (
    <form onSubmit={showAdd ? handleAddSubmit : handleEditSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Product Name *</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="e.g. Premium Silk Saree" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Category *</label>
          <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all bg-white">
            <option value="">Select category</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Brand *</label>
          <select required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
            className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all bg-white">
            <option value="">Select brand</option>
            {brands.map((b) => <option key={b}>{b}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Stock Quantity *</label>
          <input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="0" />
        </div>
        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5">Price (৳) *</label>
          <input required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full border border-border-subtle rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all" placeholder="0" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => { setShowAdd(false); setShowEdit(false); }}
          className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all">Cancel</button>
        <button type="submit"
          className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all shadow-lg shadow-midnight/20">
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
          <button onClick={() => setShowBulk(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-surface-elevated text-text-secondary font-bold text-sm border border-border-subtle hover:bg-white transition-all">
            <Upload className="w-4 h-4" /> Bulk Upload
          </button>
          <button onClick={handleAddOpen}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-midnight text-warm-white font-bold text-sm shadow-xl shadow-midnight/20 hover:scale-[1.02] transition-all">
            <Plus className="w-4 h-4" /> Add New Product
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative group w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-mint transition-colors" />
          <input type="text" placeholder="Search by name, brand, or category..."
            className="w-full bg-surface/50 border border-border-subtle rounded-xl py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-mint/20 focus:border-mint transition-all text-sm font-medium"
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={() => setShowFilter(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-sm font-bold text-text-secondary hover:text-midnight transition-all">
            <Filter className="w-4 h-4" /> Filters {(filterCategory !== "All" || filterStatus !== "All") && <span className="w-2 h-2 rounded-full bg-mint" />}
          </button>
          <button onClick={() => handleSort("price")}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-sm font-bold text-text-secondary hover:text-midnight transition-all">
            <ArrowUpDown className="w-4 h-4" /> Sort
          </button>
          <button onClick={() => { exportCSV(filtered); toast("Products exported as CSV!"); }}
            className="p-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-text-secondary hover:text-mint transition-all">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="glass-card overflow-hidden border border-border-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-elevated">
              <tr>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">
                  <button onClick={() => handleSort("name")} className="flex items-center gap-1 hover:text-midnight transition-colors">
                    Product Details {sortField === "name" && <ArrowUpDown className="w-3 h-3" />}
                  </button>
                </th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Category & Brand</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">
                  <button onClick={() => handleSort("stock")} className="flex items-center gap-1 hover:text-midnight transition-colors">
                    Inventory {sortField === "stock" && <ArrowUpDown className="w-3 h-3" />}
                  </button>
                </th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">
                  <button onClick={() => handleSort("price")} className="flex items-center gap-1 hover:text-midnight transition-colors">
                    Price {sortField === "price" && <ArrowUpDown className="w-3 h-3" />}
                  </button>
                </th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted">Status</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-text-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/40">
              <AnimatePresence>
                {paged.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-text-muted font-medium">No products found.</td></tr>
                ) : (
                  paged.map((product) => (
                    <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="group hover:bg-surface-elevated/30 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-border-subtle bg-white relative flex-shrink-0">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            {product.stock <= 5 && product.stock > 0 && (
                              <div className="absolute top-0 right-0 w-3 h-3 bg-gold border-2 border-white rounded-full animate-pulse" />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-midnight group-hover:text-mint transition-colors truncate max-w-[200px]">{product.name}</span>
                            <span className="text-[10px] font-medium text-text-muted uppercase tracking-tight mt-0.5">SKU: PROD-00{product.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col gap-1">
                          <span className="px-2 py-0.5 rounded-md bg-midnight/5 text-midnight text-[10px] font-bold w-fit uppercase">{product.category}</span>
                          <span className="text-xs text-text-muted font-medium ml-1">{product.brand}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between w-24">
                            <span className="text-xs font-bold">{product.stock} Units</span>
                            <span className="text-[10px] text-text-muted font-medium bg-surface-elevated px-1.5 rounded">{Math.min(product.stock, 100)}%</span>
                          </div>
                          <div className="h-1.5 w-24 bg-surface-elevated rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all duration-1000",
                              product.stock === 0 ? "bg-coral" : product.stock < 20 ? "bg-gold" : "bg-mint")}
                              style={{ width: `${Math.min(product.stock, 100)}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="p-5 font-bold text-sm text-midnight">{formatPrice(product.price)}</td>
                      <td className="p-5">
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                          product.status === "Active" ? "bg-mint/10 text-mint" :
                          product.status === "Low Stock" ? "bg-gold/10 text-gold" : "bg-coral/10 text-coral")}>
                          {product.status}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => { setViewProduct(product); setShowView(true); }}
                            className="p-2 rounded-lg text-text-muted hover:bg-surface-elevated hover:text-midnight transition-all translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 duration-200">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEditOpen(product)}
                            className="p-2 rounded-lg text-text-muted hover:bg-surface-elevated hover:text-mint transition-all translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 duration-300">
                            <Edit className="w-4 h-4" />
                          </button>
                          <div className="relative">
                            <button onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                              className="p-2 rounded-lg text-text-muted hover:bg-surface-elevated hover:text-midnight transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                              {openMenuId === product.id && (
                                <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  className="absolute right-0 top-10 z-20 w-40 bg-white rounded-2xl border border-border-subtle shadow-xl overflow-hidden">
                                  <button onClick={() => handleDuplicate(product)}
                                    className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-text-secondary hover:bg-surface-elevated hover:text-midnight transition-colors">
                                    <Copy className="w-3.5 h-3.5" /> Duplicate
                                  </button>
                                  <button onClick={() => handleDelete(product)}
                                    className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-bold text-coral hover:bg-coral/5 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-5 bg-surface-elevated/50 flex items-center justify-between border-t border-border-subtle">
          <span className="text-xs text-text-muted font-medium">
            Showing <span className="font-bold text-midnight">{Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}-{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-bold text-midnight">{filtered.length}</span> products
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="p-2 rounded-lg border border-border-subtle text-xs font-bold disabled:opacity-30 hover:bg-white transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={cn("w-8 h-8 rounded-lg text-xs font-bold transition-all", p === page ? "bg-mint text-midnight" : "hover:bg-white text-text-muted")}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
              className="p-2 rounded-lg border border-border-subtle text-xs font-bold disabled:opacity-30 hover:bg-white transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Product">{formFields}</Modal>

      {/* Edit Product Modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Product">{formFields}</Modal>

      {/* View Product Modal */}
      <Modal open={showView} onClose={() => setShowView(false)} title="Product Details" size="lg">
        {viewProduct && (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <img src={viewProduct.image} alt={viewProduct.name} className="w-24 h-24 rounded-2xl object-cover border border-border-subtle" />
              <div>
                <h3 className="text-xl font-bold text-midnight">{viewProduct.name}</h3>
                <p className="text-xs text-text-muted uppercase tracking-widest mt-1">SKU: PROD-00{viewProduct.id}</p>
                <span className={cn("mt-2 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                  viewProduct.status === "Active" ? "bg-mint/10 text-mint" : viewProduct.status === "Low Stock" ? "bg-gold/10 text-gold" : "bg-coral/10 text-coral")}>
                  {viewProduct.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Category", value: viewProduct.category },
                { label: "Brand", value: viewProduct.brand },
                { label: "Stock", value: `${viewProduct.stock} units` },
                { label: "Price", value: formatPrice(viewProduct.price) },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 rounded-2xl bg-surface-elevated">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</span>
                  <p className="text-sm font-bold text-midnight mt-1">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowView(false); handleEditOpen(viewProduct); }}
                className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all shadow-lg">
                <Edit className="w-4 h-4 inline mr-2" /> Edit Product
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Filter Modal */}
      <Modal open={showFilter} onClose={() => setShowFilter(false)} title="Filter Products" size="sm">
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {["All", ...categories].map((c) => (
                <button key={c} onClick={() => setFilterCategory(c)}
                  className={cn("px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                    filterCategory === c ? "bg-mint text-midnight border-mint" : "bg-surface-elevated border-border-subtle text-text-secondary hover:border-mint/40")}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {["All", "Active", "Low Stock", "Out of Stock"].map((s) => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={cn("px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                    filterStatus === s ? "bg-mint text-midnight border-mint" : "bg-surface-elevated border-border-subtle text-text-secondary hover:border-mint/40")}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setFilterCategory("All"); setFilterStatus("All"); setPage(1); }}
              className="flex-1 py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all">
              Clear All
            </button>
            <button onClick={() => { setShowFilter(false); setPage(1); }}
              className="flex-1 py-2.5 rounded-xl bg-midnight text-warm-white text-sm font-bold hover:scale-[1.02] transition-all">
              Apply Filters
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal open={showBulk} onClose={() => setShowBulk(false)} title="Bulk Upload Products" size="sm">
        <div className="space-y-5">
          <div className="p-8 rounded-2xl border-2 border-dashed border-border-subtle flex flex-col items-center text-center gap-3 hover:border-mint/50 transition-all cursor-pointer group"
            onClick={() => { toast("CSV template downloaded!"); }}>
            <div className="w-14 h-14 rounded-full bg-surface-elevated flex items-center justify-center group-hover:bg-mint/10 transition-all">
              <Upload className="w-6 h-6 text-text-muted group-hover:text-mint" />
            </div>
            <div>
              <p className="text-sm font-bold text-midnight">Click to upload CSV</p>
              <p className="text-xs text-text-muted mt-0.5">or drag & drop your file here</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Max 5MB · CSV only</span>
          </div>
          <button onClick={() => { toast("CSV template downloaded!"); }}
            className="w-full py-2.5 rounded-xl border border-border-subtle text-sm font-bold text-text-secondary hover:bg-surface-elevated transition-all flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download CSV Template
          </button>
        </div>
      </Modal>
    </div>
  );
}
