"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ShoppingBag, Heart, Star } from "lucide-react";
import { useCartStore, useWishlistStore, useUIStore, Product } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { http } from "@/lib/api";
import { mapApiProduct } from "@/lib/api-types";
import type { ApiProduct, Paginated } from "@/lib/api-types";

export function FeaturedProducts() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    http
      .get<Paginated<ApiProduct>>("/products?sort=rating&limit=8")
      .then((res) => setFeaturedProducts(res.data.map(mapApiProduct)))
      .catch(() => setFeaturedProducts([]));
  }, []);

  return (
    <section ref={ref} className="section-padding bg-surface overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4"
        >
          <div>
            <span className="text-mint text-sm font-semibold tracking-wider uppercase">Curated For You</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] text-text-primary mt-2">
              Featured Products
            </h2>
          </div>
          <Link
            href="/products"
            className="underline-draw text-sm font-semibold text-text-secondary hover:text-mint transition-colors"
          >
            View All Products →
          </Link>
        </motion.div>

        {/* Horizontal Scroll Rail */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory"
        >
          {featuredProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, index, isInView }: { product: Product; index: number; isInView: boolean }) {
  const addItem = useCartStore((s) => s.addItem);
  const setCartDrawerOpen = useUIStore((s) => s.setCartDrawerOpen);
  const { toggleItem, hasItem } = useWishlistStore();
  const isWishlisted = hasItem(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setCartDrawerOpen(true);
  };

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group snap-start shrink-0 w-[280px] sm:w-[300px]"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="glass-card overflow-hidden">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-charcoal/5">
            {product.badge && (
              <div className={`ribbon ribbon-${product.badge}`}>
                {product.badge === "hot" ? "🔥 Hot" : product.badge === "new" ? "✨ New" : `${discount}% Off`}
              </div>
            )}
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="300px"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Quick Actions */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-mint text-midnight text-sm font-bold rounded-lg hover:bg-mint-dark transition-colors"
              >
                <ShoppingBag size={16} />
                Add to Cart
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleItem(product); }}
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                  isWishlisted ? "bg-coral text-white" : "bg-white/90 text-charcoal hover:bg-coral hover:text-white"
                }`}
              >
                <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
              </motion.button>
            </div>
          </div>

          {/* Info */}
          <div className="p-4">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{product.category}</p>
            <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-mint transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-2">
              <Star size={14} className="text-gold fill-gold" />
              <span className="text-xs font-semibold text-text-primary">{product.rating}</span>
              <span className="text-xs text-text-muted">({product.reviewCount.toLocaleString()})</span>
            </div>

            {/* Price */}
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
