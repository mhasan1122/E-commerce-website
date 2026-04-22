"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  LayoutList,
  ShoppingBag,
  Heart,
  Star,
  ChevronDown,
  X,
  ArrowUpDown,
  Filter,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useCartStore, useWishlistStore, useUIStore, Product } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { http, ApiError } from "@/lib/api";
import { mapApiProduct } from "@/lib/api-types";
import type { ApiCategory, ApiProduct, Envelope, Paginated } from "@/lib/api-types";

type SortOption = "featured" | "price-asc" | "price-desc" | "rating" | "newest" | "popular";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "newest", label: "Newest" },
];

const priceRanges: { label: string; min: number; max: number | null }[] = [
  { label: "All Prices", min: 0, max: null },
  { label: "Under ৳5,000", min: 0, max: 4999 },
  { label: "৳5,000 – ৳10,000", min: 5000, max: 9999 },
  { label: "৳10,000 – ৳20,000", min: 10000, max: 19999 },
  { label: "৳20,000 – ৳50,000", min: 20000, max: 49999 },
  { label: "৳50,000+", min: 50000, max: null },
];

const sortToApi: Record<SortOption, string | undefined> = {
  featured: undefined,
  popular: "best_sellers",
  rating: "rating",
  "price-asc": "price_asc",
  "price-desc": "price_desc",
  newest: "newest",
};

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || "all");
  const [sort, setSort] = useState<SortOption>("featured");
  const [priceRange, setPriceRange] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSort(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load categories once
  useEffect(() => {
    http
      .get<Envelope<ApiCategory[]>>("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  // Load products based on filters
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim());
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        const apiSort = sortToApi[sort];
        if (apiSort) params.set("sort", apiSort);
        const range = priceRanges[priceRange];
        if (range.min > 0) params.set("minPrice", String(range.min));
        if (range.max != null) params.set("maxPrice", String(range.max));
        params.set("limit", "48");
        const res = await http.get<Paginated<ApiProduct>>(`/products?${params.toString()}`);
        setProducts(res.data.map(mapApiProduct));
      } catch (err) {
        if (err instanceof ApiError) {
          console.error("[products]", err.message);
        }
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [debouncedSearch, selectedCategory, sort, priceRange]);

  const activeFilters = useMemo(
    () =>
      [
        selectedCategory !== "all" &&
          `Category: ${categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}`,
        priceRange !== 0 && `Price: ${priceRanges[priceRange].label}`,
        search.trim() && `Search: "${search}"`,
      ].filter(Boolean) as string[],
    [selectedCategory, priceRange, search, categories]
  );

  const clearFilters = useCallback(() => {
    setSelectedCategory("all");
    setPriceRange(0);
    setSearch("");
  }, []);

  const displayedTitle =
    selectedCategory !== "all"
      ? categories.find((c) => c.slug === selectedCategory)?.name || "Shop"
      : "All Products";

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20">
      {/* Hero Header */}
      <div ref={headerRef} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#F5F0EB]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(circle, #000 0.5px, transparent 0.5px)`,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-900 text-white text-xs font-medium tracking-wider uppercase mb-4">
              <Sparkles size={14} className="text-amber-400" /> Premium Collection
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-4">
              {displayedTitle}
            </h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Discover our curated collection of premium products, handpicked for quality and style.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Search + Controls Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={18} className="absolute top-1/2 left-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-text-muted hover:text-text-primary"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                showFilters
                  ? "bg-mint/10 border-mint/30 text-mint"
                  : "bg-surface-elevated border-border-subtle text-text-secondary hover:border-mint/30"
              }`}
            >
              <SlidersHorizontal size={16} />
              <span className="hidden sm:inline">Filters</span>
              {activeFilters.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-mint text-midnight text-[10px] font-bold flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
            </button>

            <div ref={sortRef} className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-sm font-medium text-text-secondary hover:border-mint/30 transition-all"
              >
                <ArrowUpDown size={16} />
                <span className="hidden sm:inline">{sortOptions.find((s) => s.value === sort)?.label}</span>
                <ChevronDown size={14} className={`transition-transform ${showSort ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {showSort && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-surface-elevated border border-border-subtle rounded-xl shadow-xl overflow-hidden z-30"
                  >
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSort(opt.value);
                          setShowSort(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          sort === opt.value
                            ? "bg-mint/10 text-mint font-semibold"
                            : "text-text-secondary hover:bg-charcoal/5 hover:text-text-primary"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden md:flex items-center bg-surface-elevated border border-border-subtle rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 transition-colors ${
                  viewMode === "grid" ? "bg-mint/10 text-mint" : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Grid3X3 size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 transition-colors ${
                  viewMode === "list" ? "bg-mint/10 text-mint" : "text-text-muted hover:text-text-primary"
                }`}
              >
                <LayoutList size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-6"
            >
              <div className="glass-card p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                    <Filter size={14} className="text-mint" /> Category
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedCategory === "all"
                          ? "bg-mint text-midnight"
                          : "bg-surface-elevated text-text-secondary hover:text-text-primary border border-border-subtle"
                      }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          selectedCategory === cat.slug
                            ? "bg-mint text-midnight"
                            : "bg-surface-elevated text-text-secondary hover:text-text-primary border border-border-subtle"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Price Range</h3>
                  <div className="flex flex-wrap gap-2">
                    {priceRanges.map((range, i) => (
                      <button
                        key={i}
                        onClick={() => setPriceRange(i)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          priceRange === i
                            ? "bg-mint text-midnight"
                            : "bg-surface-elevated text-text-secondary hover:text-text-primary border border-border-subtle"
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-end">
                  {activeFilters.length > 0 && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 rounded-lg text-xs font-semibold text-coral border border-coral/30 hover:bg-coral/10 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-xs text-text-muted">Active:</span>
            {activeFilters.map((f, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-mint/10 text-mint text-xs font-medium">
                {f}
              </span>
            ))}
            <button onClick={clearFilters} className="text-xs text-coral hover:underline ml-2">
              Clear all
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-text-muted">
            Showing <span className="font-semibold text-text-primary">{products.length}</span> product
            {products.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-text-muted">
            <Loader2 className="w-8 h-8 animate-spin text-mint" />
            <p className="mt-3 text-sm font-medium">Loading products…</p>
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-charcoal/5 flex items-center justify-center mb-6">
              <Search size={40} className="text-text-muted" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">No products found</h3>
            <p className="text-text-muted mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-mint text-midnight font-semibold text-sm rounded-full hover:bg-mint-dark transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {products.map((product, i) => (
                <ProductGridCard key={product.id} product={product} index={i} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {products.map((product, i) => (
                <ProductListCard key={product.id} product={product} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────── GRID CARD ─────────── */
function ProductGridCard({ product, index }: { product: Product; index: number }) {
  const addItem = useCartStore((s) => s.addItem);
  const setCartDrawerOpen = useUIStore((s) => s.setCartDrawerOpen);
  const { toggleItem, hasItem } = useWishlistStore();
  const isWishlisted = hasItem(product.id);

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setCartDrawerOpen(true);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="group"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="glass-card overflow-hidden">
          <div className="relative aspect-square overflow-hidden bg-charcoal/5">
            {product.badge && (
              <div className={`ribbon ribbon-${product.badge}`}>
                {product.badge === "hot"
                  ? "🔥 Hot"
                  : product.badge === "new"
                    ? "✨ New"
                    : `${discount}% Off`}
              </div>
            )}
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-mint text-midnight text-sm font-bold rounded-lg hover:bg-mint-dark transition-colors"
              >
                <ShoppingBag size={16} />
                <span className="hidden sm:inline">Add to Cart</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleItem(product);
                }}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isWishlisted ? "bg-coral text-white" : "bg-white/90 text-charcoal hover:bg-coral hover:text-white"
                }`}
              >
                <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
              </motion.button>
            </div>
          </div>

          <div className="p-4">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{product.category}</p>
            <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-mint transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-1 mt-2">
              <Star size={14} className="text-gold fill-gold" />
              <span className="text-xs font-semibold text-text-primary">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-text-muted">({product.reviewCount.toLocaleString()})</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg font-bold text-mint">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="text-sm text-text-muted line-through">{formatPrice(product.oldPrice)}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─────────── LIST CARD ─────────── */
function ProductListCard({ product, index }: { product: Product; index: number }) {
  const addItem = useCartStore((s) => s.addItem);
  const setCartDrawerOpen = useUIStore((s) => s.setCartDrawerOpen);
  const { toggleItem, hasItem } = useWishlistStore();
  const isWishlisted = hasItem(product.id);

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="glass-card overflow-hidden flex flex-col sm:flex-row group">
          <div className="relative w-full sm:w-56 h-56 sm:h-auto shrink-0 overflow-hidden bg-charcoal/5">
            {product.badge && (
              <div className={`ribbon ribbon-${product.badge}`}>
                {product.badge === "hot"
                  ? "🔥 Hot"
                  : product.badge === "new"
                    ? "✨ New"
                    : `${discount}% Off`}
              </div>
            )}
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="224px"
              unoptimized
            />
          </div>

          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{product.category}</p>
              <h3 className="text-lg font-semibold text-text-primary group-hover:text-mint transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-text-secondary mt-2 line-clamp-2">{product.description}</p>
              <div className="flex items-center gap-1 mt-3">
                <Star size={14} className="text-gold fill-gold" />
                <span className="text-sm font-semibold text-text-primary">{product.rating.toFixed(1)}</span>
                <span className="text-sm text-text-muted">
                  ({product.reviewCount.toLocaleString()} reviews)
                </span>
                <span className="text-xs text-text-muted ml-2">
                  • {product.soldCount.toLocaleString()} sold
                </span>
              </div>

              {product.features && product.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {product.features.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 rounded-md bg-surface text-text-muted text-xs border border-border-subtle"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-mint">{formatPrice(product.price)}</span>
                {product.oldPrice && (
                  <span className="text-sm text-text-muted line-through">{formatPrice(product.oldPrice)}</span>
                )}
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleItem(product);
                  }}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors border ${
                    isWishlisted
                      ? "bg-coral text-white border-coral"
                      : "text-text-muted border-border-subtle hover:border-coral hover:text-coral"
                  }`}
                >
                  <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addItem(product);
                    setCartDrawerOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-mint text-midnight font-bold text-sm rounded-lg hover:bg-mint-dark transition-colors"
                >
                  <ShoppingBag size={16} />
                  Add to Cart
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
