"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, ShoppingBag, ArrowRight, Package } from "lucide-react";
import { useCartStore } from "@/lib/store";

function PaymentSuccessContent() {
  const params = useSearchParams();
  const orderNumber = params.get("order");
  const clearCart = useCartStore((s) => s.clearCart);

  // Payment confirmed — now safe to clear the cart
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md w-full"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-28 h-28 rounded-full bg-gradient-to-br from-mint to-mint-dark flex items-center justify-center mx-auto mb-8 shadow-xl shadow-mint/30"
        >
          <CheckCircle size={56} className="text-midnight" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] text-text-primary mb-3">
            Payment Successful!
          </h1>
          <p className="text-text-secondary mb-4 leading-relaxed">
            Your payment has been confirmed and your order is being processed.
          </p>

          {orderNumber && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-mint/10 border border-mint/20 mb-8">
              <Package size={15} className="text-mint" />
              <span className="text-sm font-semibold text-text-primary">
                Order <span className="text-mint font-bold">#{orderNumber}</span>
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-mint to-mint-dark text-midnight font-bold rounded-xl hover:shadow-lg hover:shadow-mint/20 transition-all"
            >
              Track My Order <ArrowRight size={18} />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-elevated border border-border-subtle text-text-primary font-semibold rounded-xl hover:border-mint/30 transition-all"
            >
              <ShoppingBag size={18} /> Continue Shopping
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessContent />
    </Suspense>
  );
}
