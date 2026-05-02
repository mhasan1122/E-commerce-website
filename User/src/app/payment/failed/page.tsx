"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, RefreshCw, ShoppingBag, ArrowLeft } from "lucide-react";

function PaymentFailedContent() {
  const params = useSearchParams();
  const router = useRouter();
  const orderNumber = params.get("order");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Blurred backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Popup card */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 220 }}
            className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-5"
          >
            <XCircle size={44} className="text-red-500" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-2">
              Payment Cancelled
            </h2>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Your payment was not completed. No charges were made.
            </p>

            {orderNumber && (
              <p className="text-xs text-gray-400 mb-6">
                Order ref:{" "}
                <span className="font-semibold text-gray-600">#{orderNumber}</span>
              </p>
            )}

            {/* Divider */}
            <div className="border-t border-gray-100 mb-6" />

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push("/checkout?step=payment")}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-mint to-mint-dark text-midnight font-bold rounded-xl hover:shadow-lg hover:shadow-mint/25 transition-all active:scale-[0.98]"
              >
                <RefreshCw size={16} /> Try Again
              </button>

              

              <Link
                href="/products"
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ShoppingBag size={14} /> Continue Shopping
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense>
      <PaymentFailedContent />
    </Suspense>
  );
}
