"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { useCartStore, useWishlistStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const wishlistItems = useWishlistStore((s) => s.items);
  const toggleItem = useWishlistStore((s) => s.toggleItem);
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-midnight to-charcoal-light" />
        <div className="absolute inset-0 opacity-25">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-coral/25 rounded-full blur-[110px]" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-mint/20 rounded-full blur-[130px]" />
        </div>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-coral/10 text-coral text-xs font-semibold tracking-wider uppercase mb-4">
              <Heart size={14} /> Your Wishlist
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold font-[family-name:var(--font-heading)] text-warm-white mb-3">
              Saved for later
            </h1>
            <p className="text-warm-gray/70 text-lg max-w-xl mx-auto">
              Keep track of favorites and move them to your cart anytime.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Summary bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <p className="text-sm text-text-muted">
            {wishlistItems.length === 0 ? (
              "No items saved yet."
            ) : (
              <>
                You have{" "}
                <span className="font-semibold text-text-primary">
                  {wishlistItems.length}
                </span>{" "}
                item{wishlistItems.length !== 1 ? "s" : ""} in your wishlist.
              </>
            )}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-mint hover:text-mint-dark transition-colors"
          >
            Continue shopping <ArrowRight size={16} />
          </Link>
        </div>

        {/* Empty state */}
        {wishlistItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card p-10 sm:p-14 text-center"
          >
            <div className="mx-auto w-20 h-20 rounded-full bg-coral/10 flex items-center justify-center mb-6">
              <Heart size={34} className="text-coral" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-text-secondary max-w-md mx-auto mb-7">
              Tap the heart icon on any product to save it here for later.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-mint text-midnight font-bold text-sm rounded-full hover:bg-mint-dark transition-colors"
            >
              Browse products <ArrowRight size={16} />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {wishlistItems.map((product, index) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.25) }}
                  className="group"
                >
                  <Link href={`/products/${product.slug}`} className="block">
                    <div className="glass-card overflow-hidden">
                      <div className="relative aspect-square overflow-hidden bg-charcoal/5">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-midnight/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Actions */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addItem(product);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-mint text-midnight text-sm font-bold rounded-lg hover:bg-mint-dark transition-colors"
                          >
                            <ShoppingBag size={16} />
                            <span className="hidden sm:inline">Add</span>
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleItem(product);
                            }}
                            className="w-10 h-10 rounded-lg flex items-center justify-center bg-coral text-white hover:bg-coral/90 transition-colors"
                            aria-label="Remove from wishlist"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                          {product.category}
                        </p>
                        <h3 className="text-sm font-semibold text-text-primary truncate group-hover:text-mint transition-colors">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-lg font-bold text-mint">
                            {formatPrice(product.price)}
                          </span>
                          {product.oldPrice && (
                            <span className="text-sm text-text-muted line-through">
                              {formatPrice(product.oldPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

