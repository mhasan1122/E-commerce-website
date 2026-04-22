"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Mail, Send, Check, Sparkles } from "lucide-react";

export function Newsletter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail("");
    }, 4000);
  };

  return (
    <section ref={ref} className="section-padding bg-[#F5F0EB] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.1, 1], x: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-amber-200/20 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: [0, -10, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-orange-100/20 blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Animated Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, type: "spring" }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg shadow-gray-200/40 border border-gray-100 mb-6"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Mail size={28} className="text-gray-700" />
          </motion.div>
        </motion.div>

        {/* Copy */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-3"
        >
          Stay in the Loop
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-gray-500 mb-8"
        >
          Subscribe for exclusive deals, new arrivals, and insider-only discounts. No spam, ever.
        </motion.p>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
        >
          <div className="relative flex-1">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white shadow-sm border border-gray-200 text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200 transition-all"
            />
          </div>
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gray-900 text-white font-bold"
              >
                <Check size={18} />
                Subscribed!
              </motion.div>
            ) : (
              <motion.button
                key="submit"
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 hover:shadow-lg transition-all"
              >
                <Send size={16} />
                Subscribe
              </motion.button>
            )}
          </AnimatePresence>
        </motion.form>

        {/* Trust */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-4"
        >
          <Sparkles size={12} /> Join 50,000+ subscribers • Unsubscribe anytime
        </motion.p>
      </div>
    </section>
  );
}
