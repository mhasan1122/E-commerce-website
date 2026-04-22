"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Cpu, Shirt, Lamp, Sparkles, Dumbbell, Watch } from "lucide-react";
import { http } from "@/lib/api";
import type { ApiCategory, Envelope } from "@/lib/api-types";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Cpu,
  Shirt,
  Lamp,
  Sparkles,
  Dumbbell,
  Watch,
};

type UiCategory = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  image: string;
  gradient: string;
  productCount: number;
};

const fallbackGradients = [
  "from-indigo-900/80 via-indigo-600/50 to-transparent",
  "from-rose-900/80 via-rose-600/50 to-transparent",
  "from-amber-900/80 via-amber-600/50 to-transparent",
  "from-emerald-900/80 via-emerald-600/50 to-transparent",
  "from-sky-900/80 via-sky-600/50 to-transparent",
  "from-violet-900/80 via-violet-600/50 to-transparent",
];

export function CategoriesGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [categories, setCategories] = useState<UiCategory[]>([]);

  useEffect(() => {
    http
      .get<Envelope<ApiCategory[]>>("/categories")
      .then((res) =>
        setCategories(
          res.data.map((c, i) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            icon: c.icon || "Cpu",
            image:
              c.image ||
              `https://source.unsplash.com/600x450/?${encodeURIComponent(c.name)}`,
            gradient: c.gradient || fallbackGradients[i % fallbackGradients.length],
            productCount: c.productCount,
          }))
        )
      )
      .catch(() => setCategories([]));
  }, []);

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
          <span className="text-mint text-sm font-semibold tracking-wider uppercase">Browse</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] text-text-primary mt-2">
            Shop by Category
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  index,
  isInView,
}: {
  category: UiCategory;
  index: number;
  isInView: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const Icon = iconMap[category.icon] || Cpu;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (y - 0.5) * -15;
    const rotateY = (x - 0.5) * 15;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/products?category=${category.slug}`}>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer transition-transform duration-150 ease-out"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Background Image */}
          <img
            src={category.image}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-70 group-hover:opacity-80 transition-opacity duration-300`} />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4" style={{ transform: "translateZ(30px)" }}>
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3"
            >
              <Icon size={28} />
            </motion.div>
            <h3 className="text-lg sm:text-xl font-bold font-[family-name:var(--font-heading)] text-center">{category.name}</h3>
            <p className="text-white/70 text-sm mt-1">{category.productCount} Products</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
