"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Star, ShoppingBag } from "lucide-react";
import { useCartStore, useUIStore, Product } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { http } from "@/lib/api";
import { mapApiProduct } from "@/lib/api-types";
import type { ApiProduct, Paginated } from "@/lib/api-types";

export function NewArrivals() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const addItem = useCartStore((s) => s.addItem);
  const setCartDrawerOpen = useUIStore((s) => s.setCartDrawerOpen);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);

  useEffect(() => {
    http
      .get<Paginated<ApiProduct>>("/products?sort=newest&limit=6")
      .then((res) => setNewArrivals(res.data.map(mapApiProduct)))
      .catch(() => setNewArrivals([]));
  }, []);

  const allProducts = newArrivals;

  return (
    <section ref={ref} className="section-padding bg-surface-elevated">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-mint text-sm font-semibold tracking-wider uppercase">Just Dropped</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] text-text-primary mt-2">
            New Arrivals
          </h2>
        </motion.div>

        {/* Masonry Grid */}
        <div className="masonry-grid">
          {allProducts.map((product, i) => {
            const isLarge = i % 3 === 0;
            return (
              <motion.div
                key={`${product.id}-${i}`}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link href={`/products/${product.slug}`} className="group block">
                  <div className="relative rounded-2xl overflow-hidden bg-surface border border-border-subtle hover:border-mint/30 transition-all duration-300">
                    {/* Badge */}
                    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-mint/90 backdrop-blur-sm">
                      <span className="text-[11px] font-bold text-midnight uppercase">✨ New</span>
                    </div>

                    {/* Image */}
                    <div className={`relative overflow-hidden ${isLarge ? "aspect-[3/4]" : "aspect-square"}`}>
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-midnight/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Quick Add */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addItem(product);
                          setCartDrawerOpen(true);
                        }}
                        className="absolute bottom-3 left-3 right-3 py-2.5 bg-white/95 text-midnight text-sm font-bold rounded-xl flex items-center justify-center gap-2 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-mint"
                      >
                        <ShoppingBag size={16} />
                        Quick Add
                      </motion.button>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-mint transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-base font-bold text-mint">{formatPrice(product.price)}</span>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-gold fill-gold" />
                          <span className="text-xs text-text-muted">{product.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
