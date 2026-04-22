"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ShoppingBag, ChevronLeft, ChevronRight, Star, Flame } from "lucide-react";
import { useCartStore, useUIStore, Product } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { http } from "@/lib/api";
import { mapApiProduct } from "@/lib/api-types";
import type { ApiProduct, Paginated } from "@/lib/api-types";

export function BestSellers() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentIndex, setCurrentIndex] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const setCartDrawerOpen = useUIStore((s) => s.setCartDrawerOpen);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);

  useEffect(() => {
    http
      .get<Paginated<ApiProduct>>("/products?sort=best_sellers&limit=8")
      .then((res) => setBestSellers(res.data.map(mapApiProduct)))
      .catch(() => setBestSellers([]));
  }, []);

  const itemsPerPage = 4;
  const maxIndex = Math.max(0, bestSellers.length - itemsPerPage);

  const next = () => setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  const prev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  return (
    <section ref={ref} className="section-padding bg-surface overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4"
        >
          <div>
            <span className="text-mint text-sm font-semibold tracking-wider uppercase flex items-center gap-1">
              <Flame size={16} className="text-coral" /> Trending Now
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] text-text-primary mt-2">
              Best Sellers
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={prev}
              disabled={currentIndex === 0}
              className="w-10 h-10 rounded-full border border-border-subtle flex items-center justify-center hover:bg-mint hover:text-midnight hover:border-mint transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-primary disabled:hover:border-border-subtle"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              disabled={currentIndex >= maxIndex}
              className="w-10 h-10 rounded-full border border-border-subtle flex items-center justify-center hover:bg-mint hover:text-midnight hover:border-mint transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-primary disabled:hover:border-border-subtle"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>

        {/* Carousel */}
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-5"
            animate={{ x: `-${currentIndex * (100 / itemsPerPage + 1.5)}%` }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
          >
            {bestSellers.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="shrink-0 w-[calc(50%-10px)] sm:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)]"
              >
                <Link href={`/products/${product.slug}`} className="group block">
                  <div className="relative rounded-2xl overflow-hidden bg-surface-elevated border border-border-subtle hover:border-mint/30 transition-all duration-300 hover:shadow-lg hover:shadow-mint/5">
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden">
                      {product.badge === "hot" && (
                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-coral rounded-full">
                          <Flame size={12} className="text-white" />
                          <span className="text-[11px] font-bold text-white uppercase">Hot</span>
                        </div>
                      )}
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      {/* Quick Add */}
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addItem(product);
                          setCartDrawerOpen(true);
                        }}
                        className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-mint text-midnight flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-mint-dark shadow-lg"
                      >
                        <ShoppingBag size={16} />
                      </motion.button>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <p className="text-[11px] text-text-muted uppercase tracking-wider">{product.category}</p>
                      <h3 className="text-sm font-semibold text-text-primary mt-1 truncate group-hover:text-mint transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star size={12} className="text-gold fill-gold" />
                        <span className="text-xs font-medium text-text-primary">{product.rating}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-bold text-mint">{formatPrice(product.price)}</span>
                          {product.oldPrice && (
                            <span className="text-xs text-text-muted line-through">{formatPrice(product.oldPrice)}</span>
                          )}
                        </div>
                        <span className="text-[11px] text-text-muted">{product.soldCount.toLocaleString()} sold</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
