"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Star, ShoppingBag, TrendingUp, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ─── Countdown Timer ─── */
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-1.5">
      {[
        { value: pad(timeLeft.hours), label: "h" },
        { value: pad(timeLeft.minutes), label: "m" },
        { value: pad(timeLeft.seconds), label: "s" },
      ].map((unit, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center">
              <span className="text-base font-bold text-white font-[family-name:var(--font-heading)]">
                {unit.value}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 ml-0.5">{unit.label}</span>
          </div>
          {i < 2 && <span className="text-gray-300 font-bold mx-0.5">:</span>}
        </div>
      ))}
    </div>
  );
}

/* ─── Magnetic Button ─── */
function MagneticButton({ children, href, variant = "primary" }: { children: React.ReactNode; href: string; variant?: "primary" | "secondary" }) {
  const btnRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (btnRef.current) {
      btnRef.current.style.transform = "translate(0, 0)";
    }
  }, []);

  return (
    <Link
      ref={btnRef}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`magnetic-btn inline-flex items-center gap-2.5 px-7 py-3.5 font-semibold rounded-full text-sm transition-all duration-300 ${variant === "primary"
          ? "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-xl hover:shadow-gray-900/15"
          : "bg-white text-gray-900 border border-gray-200 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-900/5"
        }`}
    >
      {children}
    </Link>
  );
}

/* ─── Product data for right side showcase ─── */
const HERO_PRODUCTS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85",
    name: "Quantum Pro Wireless",
    price: "৳29,900",
    rating: 4.8,
    tag: "Best Seller",
    tagColor: "#10b981",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=85",
    name: "Nebula Running X9",
    price: "৳18,900",
    rating: 4.7,
    tag: "New Arrival",
    tagColor: "#6366f1",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=85",
    name: "Aether Smartwatch Ultra",
    price: "৳44,900",
    rating: 4.9,
    tag: "Premium",
    tagColor: "#f59e0b",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&q=85",
    name: "Apex Training Pro",
    price: "৳12,500",
    rating: 4.6,
    tag: "Popular",
    tagColor: "#ec4899",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=600&q=85",
    name: "Luxe Perfume Collection",
    price: "৳8,900",
    rating: 4.8,
    tag: "Trending",
    tagColor: "#14b8a6",
  },
];

/* ─── Hero Banner ─── */
export function HeroBanner() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative flex items-start lg:items-center overflow-hidden bg-[#FAFAF8] lg:min-h-screen">
      {/* ─── Premium Animated Background ─── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Dynamic Morphing Gradients */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -right-[10%] w-[60%] h-[70%] bg-gradient-to-br from-amber-100/40 via-orange-50/20 to-transparent blur-[120px] rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, -8, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[80%] bg-gradient-to-tr from-amber-50/30 via-orange-50/10 to-transparent blur-[140px] rounded-full"
        />

        {/* Floating Glassmorphic Orbs */}
        {mounted && [...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              y: [0, (i + 1) * -30 - 20, 0],
              x: [0, (i % 2 === 0 ? 1 : -1) * 30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "easeInOut", delay: i * 1.5 }}
            className="absolute rounded-full border border-white/40 bg-white/10 backdrop-blur-[2px]"
            style={{
              width: `${150 + i * 30}px`,
              height: `${150 + i * 20}px`,
              top: `${i * 15 + 10}%`,
              left: `${i * 12 + 5}%`,
              boxShadow: "inset 0 0 40px rgba(255,255,255,0.2)",
            }}
          />
        ))}

        {/* Dot Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `radial-gradient(circle, #000 1px, transparent 1px)`, backgroundSize: "32px 32px" }}
        />

        {/* Grain Texture */}
        <div
          className="absolute inset-0 opacity-[0.015] contrast-150 brightness-150 pointer-events-none mix-blend-multiply"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 sm:py-24 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center lg:min-h-[92vh]">

          {/* ─── LEFT COLUMN: Text Content ─── */}
          <div className="lg:col-span-5 xl:col-span-5">
            {/* Flash Sale Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gray-900 mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
              </span>
              <span className="text-xs font-medium text-white tracking-wide">Flash Sale — Up to 50% Off</span>
              <div className="w-px h-3 bg-white/20" />
              <CountdownTimer />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-[2.75rem] sm:text-5xl md:text-[3.5rem] font-bold font-[family-name:var(--font-heading)] text-gray-900 leading-[1.08] tracking-tight mb-5"
            >
              Discover{" "}
              <span className="relative inline-block">
                Premium
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <motion.path
                    d="M2 8C40 2 80 2 100 6C120 10 160 10 198 4"
                    stroke="url(#underline-grad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                  <defs>
                    <linearGradient id="underline-grad" x1="0" y1="0" x2="200" y2="0">
                      <stop stopColor="#C8A97E" />
                      <stop offset="1" stopColor="#D4A853" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <br />
              Products
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-base text-gray-500 mb-8 max-w-md leading-relaxed"
            >
              Curated collections of the finest products, crafted for the modern lifestyle. Experience luxury redefined.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="flex flex-wrap items-center gap-3 mb-10"
            >
              <MagneticButton href="/products" variant="primary">
                <ShoppingBag size={17} />
                Shop Collection
                <ArrowRight size={16} />
              </MagneticButton>
              <MagneticButton href="/products?category=electronics" variant="secondary">
                <TrendingUp size={16} />
                Trending Now
              </MagneticButton>
            </motion.div>

            {/* Trust Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex items-center gap-6 pt-6 border-t border-gray-200/80"
            >
              {[
                { value: "50K+", label: "Customers" },
                { value: "10K+", label: "Products" },
                { value: "4.9", label: "Rating", icon: true },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                      {stat.value}
                    </span>
                    {stat.icon && <Star size={14} className="text-amber-400 fill-amber-400" />}
                  </div>
                  <span className="text-[11px] text-gray-400 mt-0.5">{stat.label}</span>
                </div>
              ))}

              {/* Avatars */}
              <div className="hidden sm:flex items-center ml-2">
                <div className="flex -space-x-2">
                  {["A", "B", "C", "D"].map((letter, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ background: ["#10b981", "#f59e0b", "#6366f1", "#ec4899"][i] }}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <span className="text-[11px] text-gray-400 ml-2">Happy shoppers</span>
              </div>
            </motion.div>
          </div>

          {/* ─── RIGHT COLUMN: Professional Product Showcase ─── */}
          <div className="lg:col-span-7 xl:col-span-7 relative hidden lg:flex items-center justify-center">
            <div className="relative w-full h-[640px]">

              {/* ── Rotating Glow Ring behind everything ── */}
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full pointer-events-none"
                style={{
                  background: "conic-gradient(from 0deg, transparent 0%, #fde68a40 25%, transparent 50%, #fbbf2440 75%, transparent 100%)",
                  filter: "blur(40px)",
                }}
              />

              {/* ── Pulsing center orb ── */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-gradient-to-br from-amber-200/40 via-orange-100/20 to-rose-100/20 blur-3xl pointer-events-none"
              />

              {/* ══════════════════════════════
                  HERO IMAGE — large, center-left
                  ══════════════════════════════ */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute top-1/2 left-[4%] -translate-y-1/2 w-[270px] z-20"
              >
                <motion.div
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  className="relative rounded-3xl overflow-hidden shadow-2xl shadow-gray-400/25 border border-white/80 group cursor-pointer"
                  style={{ aspectRatio: "3/4" }}
                >
                  <Image
                    src={HERO_PRODUCTS[0].image}
                    alt={HERO_PRODUCTS[0].name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="270px"
                    priority
                  />
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Tag */}
                  <div
                    className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: HERO_PRODUCTS[0].tagColor }}
                  >
                    {HERO_PRODUCTS[0].tag}
                  </div>

                  {/* Info at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white/80 text-[11px] font-medium truncate">{HERO_PRODUCTS[0].name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-white font-bold text-base">{HERO_PRODUCTS[0].price}</span>
                      <div className="flex items-center gap-0.5 bg-white/20 backdrop-blur-md rounded-full px-2 py-0.5">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <span className="text-white text-[11px] font-semibold">{HERO_PRODUCTS[0].rating}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* ══════════════════════════════
                  TOP-RIGHT card
                  ══════════════════════════════ */}
              <motion.div
                initial={{ opacity: 0, x: 40, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute top-[3%] right-[2%] w-[200px] z-20"
              >
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="relative rounded-2xl overflow-hidden shadow-xl shadow-gray-300/30 border border-white/70 group cursor-pointer bg-white"
                >
                  <div className="relative h-[160px]">
                    <Image
                      src={HERO_PRODUCTS[1].image}
                      alt={HERO_PRODUCTS[1].name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="200px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <div
                      className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-white text-[9px] font-bold uppercase tracking-wider"
                      style={{ background: HERO_PRODUCTS[1].tagColor }}
                    >
                      {HERO_PRODUCTS[1].tag}
                    </div>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="text-[11px] font-medium text-gray-600 truncate">{HERO_PRODUCTS[1].name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-bold text-gray-900">{HERO_PRODUCTS[1].price}</span>
                      <div className="flex items-center gap-0.5">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <span className="text-[10px] text-gray-500">{HERO_PRODUCTS[1].rating}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* ══════════════════════════════
                  CENTER-RIGHT large card (tall)
                  ══════════════════════════════ */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute top-[18%] right-[18%] w-[195px] z-30"
              >
                <motion.div
                  animate={{ y: [6, -6, 6] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="relative rounded-2xl overflow-hidden shadow-2xl shadow-gray-400/20 border border-white/80 group cursor-pointer"
                  style={{ aspectRatio: "4/5" }}
                >
                  <Image
                    src={HERO_PRODUCTS[2].image}
                    alt={HERO_PRODUCTS[2].name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="195px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                  <div
                    className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-black text-[9px] font-bold uppercase tracking-wider"
                    style={{ background: HERO_PRODUCTS[2].tagColor }}
                  >
                    {HERO_PRODUCTS[2].tag}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white/80 text-[10px] truncate">{HERO_PRODUCTS[2].name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-white font-bold text-sm">{HERO_PRODUCTS[2].price}</span>
                      <div className="flex items-center gap-0.5 bg-white/20 backdrop-blur-md rounded-full px-1.5 py-0.5">
                        <Star size={9} className="text-amber-300 fill-amber-300" />
                        <span className="text-white text-[10px]">{HERO_PRODUCTS[2].rating}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* ══════════════════════════════
                  BOTTOM-CENTER card
                  ══════════════════════════════ */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute bottom-[4%] left-[34%] w-[185px] z-20"
              >
                <motion.div
                  animate={{ y: [-4, 4, -4] }}
                  transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-xl shadow-gray-300/25 border border-gray-100 group cursor-pointer"
                >
                  <div className="relative h-[130px]">
                    <Image
                      src={HERO_PRODUCTS[3].image}
                      alt={HERO_PRODUCTS[3].name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="185px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                    <div
                      className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-[9px] font-bold uppercase"
                      style={{ background: HERO_PRODUCTS[3].tagColor }}
                    >
                      {HERO_PRODUCTS[3].tag}
                    </div>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="text-[11px] font-medium text-gray-600 truncate">{HERO_PRODUCTS[3].name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-bold text-gray-900">{HERO_PRODUCTS[3].price}</span>
                      <div className="flex items-center gap-0.5">
                        <Star size={10} className="text-amber-400 fill-amber-400" />
                        <span className="text-[10px] text-gray-500">{HERO_PRODUCTS[3].rating}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* ══════════════════════════════
                  FAR-RIGHT small card
                  ══════════════════════════════ */}
              <motion.div
                initial={{ opacity: 0, x: 40, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.75, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute bottom-[12%] right-[1%] w-[170px] z-20"
              >
                <motion.div
                  animate={{ y: [5, -5, 5] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  className="relative rounded-2xl overflow-hidden shadow-xl shadow-gray-300/25 border border-white/70 group cursor-pointer"
                  style={{ aspectRatio: "3/4" }}
                >
                  <Image
                    src={HERO_PRODUCTS[4].image}
                    alt={HERO_PRODUCTS[4].name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="170px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                  <div
                    className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-[9px] font-bold uppercase"
                    style={{ background: HERO_PRODUCTS[4].tagColor }}
                  >
                    {HERO_PRODUCTS[4].tag}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="text-white/80 text-[10px] truncate">{HERO_PRODUCTS[4].name}</p>
                    <span className="text-white font-bold text-sm">{HERO_PRODUCTS[4].price}</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* ══════════════════════════════
                  Floating Badge — Trending
                  ══════════════════════════════ */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, type: "spring", stiffness: 200 }}
                className="absolute top-[10%] left-[30%] z-40"
              >
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center gap-2 px-3.5 py-2 bg-gray-900 rounded-full shadow-xl shadow-gray-900/20"
                >
                  <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
                    <TrendingUp size={11} className="text-gray-900" />
                  </div>
                  <span className="text-xs font-bold text-white uppercase tracking-tight">Trending</span>
                </motion.div>
              </motion.div>

              {/* ══════════════════════════════
                  Floating Badge — Free Shipping
                  ══════════════════════════════ */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3, type: "spring", stiffness: 200 }}
                className="absolute top-[52%] left-[30%] z-40"
              >
                <motion.div
                  animate={{ y: [4, -4, 4] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30"
                >
                  <Zap size={11} className="text-white" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-tight">Free Shipping</span>
                </motion.div>
              </motion.div>

              {/* ══════════════════════════════
                  Floating Badge — Reviews
                  ══════════════════════════════ */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
                className="absolute bottom-[22%] left-[3%] z-40"
              >
                <motion.div
                  animate={{ y: [-3, 3, -3] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-full shadow-xl shadow-gray-200/70 border border-gray-100"
                >
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={10} className="text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-900">2,341 Reviews</span>
                </motion.div>
              </motion.div>

              {/* ══════════════════════════════
                  Floating Badge — Secure
                  ══════════════════════════════ */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.7, type: "spring", stiffness: 200 }}
                className="absolute top-[28%] right-[1%] z-40"
              >
                <motion.div
                  animate={{ y: [3, -3, 3] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-lg shadow-gray-200/60 border border-gray-100"
                >
                  <Shield size={11} className="text-indigo-500" />
                  <span className="text-[11px] font-bold text-gray-800">Secure Pay</span>
                </motion.div>
              </motion.div>

              {/* Connecting decorative lines (SVG) */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-20"
                viewBox="0 0 600 640"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  d="M 135 320 Q 240 220 310 180"
                  stroke="#d4a853"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 1.8, duration: 1 }}
                />
                <motion.path
                  d="M 135 360 Q 220 430 295 490"
                  stroke="#d4a853"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 2, duration: 1 }}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom edge fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FAFAF8] to-transparent z-[5]" />
    </section>
  );
}
