"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Check,
  Share2,
  Sparkles,
} from "lucide-react";
import { useCartStore, useWishlistStore, useUIStore, Product } from "@/lib/store";
import { http } from "@/lib/api";
import { mapApiProduct } from "@/lib/api-types";
import type { ApiProduct, Paginated } from "@/lib/api-types";
import { formatPrice } from "@/lib/utils";

export function ProductDetailClient({ product }: { product: Product }) {
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    if (!product.category) return;
    const run = async () => {
      try {
        const params = new URLSearchParams();
        params.set("category", product.category);
        params.set("limit", "8");
        const res = await http.get<Paginated<ApiProduct>>(`/products?${params.toString()}`);
        setRelated(
          res.data.map(mapApiProduct).filter((p) => p.id !== product.id).slice(0, 4)
        );
      } catch {
        setRelated([]);
      }
    };
    run();
  }, [product.category, product.id]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "features" | "reviews">("description");
  const [addedToCart, setAddedToCart] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const addItem = useCartStore((s) => s.addItem);
  const setCartDrawerOpen = useUIStore((s) => s.setCartDrawerOpen);
  const { toggleItem, hasItem } = useWishlistStore();
  const isWishlisted = hasItem(product.id);

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(product, quantity, selectedColor, selectedSize);
    setAddedToCart(true);
    setCartDrawerOpen(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const nextImage = () => setSelectedImage((prev) => (prev + 1) % product.images.length);
  const prevImage = () => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);


  return (
    <div className="min-h-screen bg-surface pt-24 pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-text-muted mb-8">
          <Link href="/" className="hover:text-mint transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-mint transition-colors">
            Products
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${product.category.toLowerCase().replace(/\s*&\s*/g, "-").replace(/\s+/g, "-")}`}
            className="hover:text-mint transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-text-primary font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div
              ref={imageContainerRef}
              className="relative aspect-square rounded-2xl overflow-hidden bg-charcoal/5 cursor-zoom-in group"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={product.images[selectedImage]}
                    alt={`${product.name} - Image ${selectedImage + 1}`}
                    fill
                    priority
                    className={`object-cover transition-transform duration-500 ${isZoomed ? "scale-150" : ""}`}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </motion.div>
              </AnimatePresence>

              {product.badge && (
                <div className={`ribbon ribbon-${product.badge}`}>
                  {product.badge === "hot" ? "🔥 Hot" : product.badge === "new" ? "✨ New" : `${discount}% Off`}
                </div>
              )}

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white transition-all shadow-lg"
                  >
                    <ChevronLeft size={20} className="text-midnight" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white transition-all shadow-lg"
                  >
                    <ChevronRight size={20} className="text-midnight" />
                  </button>
                </>
              )}

              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
                {selectedImage + 1} / {product.images.length}
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto no-scrollbar">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 transition-all duration-300 ${
                      selectedImage === i
                        ? "ring-2 ring-mint ring-offset-2 ring-offset-surface"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`Thumb ${i + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col"
          >
            <Link
              href={`/products?category=${product.category.toLowerCase().replace(/\s*&\s*/g, "-").replace(/\s+/g, "-")}`}
              className="text-mint text-sm font-semibold tracking-wider uppercase hover:underline"
            >
              {product.category}
            </Link>

            <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] text-text-primary mt-2">
              {product.name}
            </h1>

            <div className="flex items-center flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.floor(product.rating) ? "text-gold fill-gold" : "text-text-muted"}
                  />
                ))}
                <span className="ml-1 text-sm font-semibold text-text-primary">{product.rating}</span>
              </div>
              <span className="text-sm text-text-muted">{product.reviewCount.toLocaleString()} reviews</span>
              <span className="text-sm text-text-muted">{product.soldCount.toLocaleString()} sold</span>
              {product.stock < 20 && (
                <span className="px-2 py-0.5 rounded-md bg-coral/10 text-coral text-xs font-bold">
                  Only {product.stock} left
                </span>
              )}
            </div>

            <div className="flex items-end gap-3 mt-6">
              <span className="text-4xl font-bold text-mint">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <>
                  <span className="text-xl text-text-muted line-through mb-0.5">{formatPrice(product.oldPrice)}</span>
                  <span className="px-2 py-1 rounded-md bg-coral/10 text-coral text-sm font-bold mb-0.5">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            <p className="text-text-secondary mt-6 leading-relaxed">{product.description}</p>
            <div className="h-px bg-border-subtle my-6" />

            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <span className="text-sm font-semibold text-text-primary">Color</span>
                <div className="flex items-center gap-3 mt-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-9 h-9 rounded-full border-2 transition-all ${
                        selectedColor === color ? "border-mint scale-110 shadow-lg" : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <Check
                          size={16}
                          className="mx-auto"
                          style={{
                            color:
                              color === "#f8f6f3" || color === "#c0c0c0" || color === "#e8c547" ? "#1a1a2e" : "#fff",
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <span className="text-sm font-semibold text-text-primary">Size</span>
                <div className="flex items-center gap-2 mt-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] h-11 px-3 rounded-lg border text-sm font-semibold transition-all ${
                        selectedSize === size
                          ? "bg-mint text-midnight border-mint"
                          : "bg-surface-elevated text-text-secondary border-border-subtle hover:border-mint/50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <span className="text-sm font-semibold text-text-primary">Quantity</span>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center border border-border-subtle rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-charcoal/5 transition-colors"
                  >
                    <Minus size={16} className="text-text-secondary" />
                  </button>
                  <span className="w-14 h-11 flex items-center justify-center text-sm font-bold text-text-primary border-x border-border-subtle">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-charcoal/5 transition-colors"
                  >
                    <Plus size={16} className="text-text-secondary" />
                  </button>
                </div>
                <span className="text-sm text-text-muted">{product.stock} in stock</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                disabled={addedToCart}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-base transition-all duration-300 ${
                  addedToCart
                    ? "bg-amber-500 text-white"
                    : "bg-gradient-to-r from-mint to-mint-dark text-midnight hover:shadow-lg hover:shadow-mint/20 hover:scale-[1.02]"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check size={20} /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} /> Add to Cart — {formatPrice(product.price * quantity)}
                  </>
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleItem(product)}
                className={`w-14 h-14 rounded-xl border flex items-center justify-center transition-all ${
                  isWishlisted ? "bg-coral text-white border-coral" : "border-border-subtle text-text-muted hover:border-coral hover:text-coral"
                }`}
              >
                <Heart size={22} fill={isWishlisted ? "currentColor" : "none"} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-14 h-14 rounded-xl border border-border-subtle text-text-muted flex items-center justify-center hover:border-mint/50 hover:text-mint transition-all"
              >
                <Share2 size={20} />
              </motion.button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-8">
              {[
                { icon: Truck, label: "Free Shipping", sub: "Orders over $99" },
                { icon: Shield, label: "2-Year Warranty", sub: "Full coverage" },
                { icon: RotateCcw, label: "30-Day Returns", sub: "No questions asked" },
              ].map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="flex flex-col items-center text-center p-3 rounded-xl bg-surface-elevated border border-border-subtle"
                >
                  <Icon size={20} className="text-mint mb-1" />
                  <span className="text-xs font-semibold text-text-primary">{label}</span>
                  <span className="text-[10px] text-text-muted">{sub}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="mt-16">
          <div className="flex border-b border-border-subtle">
            {(["description", "features", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-semibold capitalize transition-all border-b-2 ${
                  activeTab === tab ? "border-mint text-mint" : "border-transparent text-text-muted hover:text-text-primary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="py-8">
            <AnimatePresence mode="wait">
              {activeTab === "description" && (
                <motion.div
                  key="desc"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-3xl"
                >
                  <p className="text-text-secondary leading-relaxed text-base">{product.description}</p>
                  <p className="text-text-secondary leading-relaxed text-base mt-4">
                    Crafted with meticulous attention to detail, this product represents the pinnacle of modern design and engineering. Each
                    unit undergoes rigorous quality testing to ensure it meets our exacting standards. Whether you&apos;re a professional or an
                    enthusiast, you&apos;ll appreciate the premium materials and thoughtful ergonomics that set this product apart from the
                    competition.
                  </p>
                </motion.div>
              )}

              {activeTab === "features" && (
                <motion.div
                  key="feat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-3xl"
                >
                  {product.features ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {product.features.map((feature, i) => (
                        <motion.div
                          key={feature}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-3 p-4 rounded-xl bg-surface-elevated border border-border-subtle"
                        >
                          <div className="w-8 h-8 rounded-lg bg-mint/10 flex items-center justify-center shrink-0">
                            <Sparkles size={16} className="text-mint" />
                          </div>
                          <span className="text-sm font-medium text-text-primary">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-muted">No additional features listed.</p>
                  )}
                </motion.div>
              )}

              {activeTab === "reviews" && (
                <motion.div
                  key="rev"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-3xl"
                >
                  <div className="flex items-center gap-6 mb-8 p-6 rounded-2xl bg-surface-elevated border border-border-subtle">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-text-primary">{product.rating}</div>
                      <div className="flex items-center gap-1 mt-1 justify-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < Math.floor(product.rating) ? "text-gold fill-gold" : "text-text-muted"}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-text-muted mt-1">{product.reviewCount.toLocaleString()} reviews</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const pct = star === 5 ? 68 : star === 4 ? 22 : star === 3 ? 7 : star === 2 ? 2 : 1;
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs text-text-muted w-4">{star}★</span>
                            <div className="flex-1 h-2 rounded-full bg-charcoal/10 overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-to-r from-gold to-amber-400" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-text-muted w-8">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-6">
                    {[
                      {
                        name: "Alex M.",
                        rating: 5,
                        date: "3 days ago",
                        text: "Absolutely premium quality. Exceeded my expectations in every way. The build quality is outstanding and it looks even better in person.",
                      },
                      {
                        name: "Sarah K.",
                        rating: 5,
                        date: "1 week ago",
                        text: "Fast shipping, gorgeous packaging, and the product itself is top-notch. Already recommended it to friends!",
                      },
                      {
                        name: "David R.",
                        rating: 4,
                        date: "2 weeks ago",
                        text: "Great product overall. Very well made and performs exactly as described. Minor wish: would love more color options.",
                      },
                    ].map((review, i) => (
                      <div key={i} className="p-5 rounded-xl bg-surface-elevated border border-border-subtle">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-mint to-mint-dark flex items-center justify-center text-midnight text-sm font-bold">
                              {review.name[0]}
                            </div>
                            <div>
                              <span className="text-sm font-semibold text-text-primary">{review.name}</span>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, j) => (
                                  <Star
                                    key={j}
                                    size={12}
                                    className={j < review.rating ? "text-gold fill-gold" : "text-text-muted"}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-text-muted">{review.date}</span>
                        </div>
                        <p className="text-sm text-text-secondary mt-3 leading-relaxed">{review.text}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-text-primary mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p) => (
                <Link key={p.id} href={`/products/${p.slug}`} className="block group">
                  <div className="glass-card overflow-hidden">
                    <div className="relative aspect-square overflow-hidden bg-charcoal/5">
                      <Image
                        src={p.images[0]}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{p.category}</p>
                      <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-mint transition-colors">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-2">
                        <Star size={14} className="text-gold fill-gold" />
                        <span className="text-xs font-semibold">{p.rating}</span>
                      </div>
                      <span className="text-lg font-bold text-mint mt-1 block">{formatPrice(p.price)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

