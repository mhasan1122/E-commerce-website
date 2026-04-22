"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useCartStore, useUIStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";

export function CartDrawer() {
  const { cartDrawerOpen, setCartDrawerOpen } = useUIStore();
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  const shipping = totalPrice() > 9999 ? 0 : 999;
  const shippingProgress = Math.min((totalPrice() / 9999) * 100, 100);

  return (
    <AnimatePresence>
      {cartDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartDrawerOpen(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-surface shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <ShoppingBag size={22} className="text-mint" />
                <h2 className="text-lg font-[family-name:var(--font-heading)] font-bold text-text-primary">
                  Your Cart
                </h2>
                <span className="ml-1 px-2 py-0.5 rounded-full bg-mint/10 text-mint text-xs font-bold">
                  {items.length}
                </span>
              </div>
              <button
                onClick={() => setCartDrawerOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-charcoal/10 transition-colors"
                aria-label="Close cart"
              >
                <X size={20} className="text-text-secondary" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            {totalPrice() < 9999 && (
              <div className="px-6 py-3 bg-surface-elevated">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-text-muted">Free shipping on orders over ৳9,999</span>
                  <span className="text-xs font-semibold text-mint">{formatPrice(9999 - totalPrice())} away</span>
                </div>
                <div className="h-1.5 bg-charcoal/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-mint to-mint-dark rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingProgress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-charcoal/5 flex items-center justify-center">
                    <ShoppingBag size={32} className="text-text-muted" />
                  </div>
                  <p className="text-text-muted">Your cart is empty</p>
                  <Link
                    href="/products"
                    onClick={() => setCartDrawerOpen(false)}
                    className="px-6 py-2.5 bg-mint text-midnight font-semibold text-sm rounded-full hover:bg-mint-dark transition-colors"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="flex gap-4 p-3 rounded-xl bg-surface-elevated"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-charcoal/5">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-text-primary truncate">{item.product.name}</h3>
                        <p className="text-sm font-bold text-mint mt-1">{formatPrice(item.product.price)}</p>

                        {/* Quantity */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-md bg-charcoal/10 flex items-center justify-center hover:bg-charcoal/20 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-semibold w-6 text-center text-text-primary">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-md bg-charcoal/10 flex items-center justify-center hover:bg-charcoal/20 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="ml-auto w-7 h-7 rounded-md flex items-center justify-center text-coral/60 hover:text-coral hover:bg-coral/10 transition-colors"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border-subtle px-6 py-4 space-y-3">
                {/* Coupon */}
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle">
                    <Tag size={16} className="text-text-muted shrink-0" />
                    <input
                      type="text"
                      placeholder="Coupon code"
                      className="flex-1 bg-transparent text-sm outline-none text-text-primary placeholder-text-muted"
                    />
                  </div>
                  <button className="px-4 py-2 bg-charcoal text-warm-white text-sm font-semibold rounded-lg hover:bg-charcoal-light transition-colors">
                    Apply
                  </button>
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-text-secondary">
                    <span>Subtotal</span>
                    <span className="font-semibold text-text-primary">{formatPrice(totalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-text-secondary">
                    <span>Shipping</span>
                    <span className={`font-semibold ${shipping === 0 ? "text-mint" : "text-text-primary"}`}>
                      {shipping === 0 ? "FREE" : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border-subtle">
                    <span className="font-bold text-text-primary px-2 py-0.5 rounded taka-badge-bw">Total</span>
                    <span className="font-bold text-lg text-mint">{formatPrice(totalPrice() + shipping)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  onClick={() => setCartDrawerOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-mint to-mint-dark text-midnight font-bold rounded-xl hover:shadow-lg hover:shadow-mint/20 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  Checkout
                  <ArrowRight size={18} />
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
