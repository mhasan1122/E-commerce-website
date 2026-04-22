"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Percent, Gift } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function PromoBanners() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="section-padding bg-surface">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Banner 1 - Summer Collection */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <Link href="/products?sale=true" className="block group">
              <div className="relative rounded-2xl overflow-hidden bg-[#F5F0EB] min-h-[300px] flex flex-col justify-end p-8 sm:p-10">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80"
                    alt="Summer Collection"
                    fill
                    className="object-cover opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#F5F0EB] via-[#F5F0EB]/80 to-[#F5F0EB]/40" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-gray-900 flex items-center justify-center mb-5">
                    <Percent size={20} className="text-amber-400" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500 tracking-wider uppercase mb-1">Limited Time</p>
                  <h3 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-gray-900">
                    Summer Collection
                  </h3>
                  <p className="text-xl font-bold text-gray-700 mt-1">Up to 50% Off</p>
                  <p className="text-gray-500 text-sm mt-2 max-w-xs">
                    Explore our curated summer essentials with premium discounts.
                  </p>
                  <div className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-gray-900 group-hover:gap-3 transition-all">
                    Shop Sale <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Banner 2 - Free Gift */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/products" className="block group">
              <div className="relative rounded-2xl overflow-hidden bg-gray-900 min-h-[300px] flex flex-col justify-end p-8 sm:p-10">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"
                    alt="Gift Offer"
                    fill
                    className="object-cover opacity-25 group-hover:opacity-35 group-hover:scale-105 transition-all duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/85 to-gray-900/50" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-5">
                    <Gift size={20} className="text-amber-400" />
                  </div>
                  <p className="text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1">Exclusive Offer</p>
                  <h3 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-white">
                    Free Gift Inside
                  </h3>
                  <p className="text-xl font-bold text-[#ff0] mt-1">Orders Over ৳19,999</p>
                  <p className="text-gray-400 text-sm mt-2 max-w-xs">
                    Get a surprise premium gift with every order over ৳19,999.
                  </p>

                  {/* Countdown */}
                  <PromoCountdown />

                  <div className="inline-flex items-center gap-2 mt-5 text-sm font-semibold text-white group-hover:gap-3 transition-all">
                    Shop Now <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Promo Countdown ─── */
function PromoCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 12, minutes: 30, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) { days = 3; hours = 12; minutes = 30; seconds = 45; }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-2 mt-4">
      {[
        { value: timeLeft.days, label: "D" },
        { value: timeLeft.hours, label: "H" },
        { value: timeLeft.minutes, label: "M" },
        { value: timeLeft.seconds, label: "S" },
      ].map((unit, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <span className="text-base font-bold text-white">{unit.value}</span>
          </div>
          <span className="text-[10px] text-gray-500 mt-1">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}
