"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Quote, BadgeCheck } from "lucide-react";
import { testimonials } from "@/lib/data/testimonials";

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  // Double the list for seamless infinite scroll
  const doubled = [...testimonials, ...testimonials];

  return (
    <section ref={ref} className="section-padding bg-surface overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-mint text-sm font-semibold tracking-wider uppercase">Real Reviews</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] text-text-primary mt-2">
            What Our Customers Say
          </h2>
        </motion.div>
      </div>

      {/* Infinite Marquee Row 1 */}
      <div className="relative mb-5">
        <div className="flex animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused]">
          {doubled.map((testimonial, i) => (
            <TestimonialCard key={`row1-${i}`} testimonial={testimonial} />
          ))}
        </div>
      </div>

      {/* Infinite Marquee Row 2 - Reverse */}
      <div className="relative">
        <div className="flex animate-[marquee-reverse_45s_linear_infinite] hover:[animation-play-state:paused]">
          {[...doubled].reverse().map((testimonial, i) => (
            <TestimonialCard key={`row2-${i}`} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <div className="shrink-0 w-[350px] mx-2.5">
      <div className="glass-card p-5 h-full">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-mint/20"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-semibold text-text-primary truncate">{testimonial.name}</h4>
              {testimonial.verified && <BadgeCheck size={14} className="text-mint shrink-0" />}
            </div>
            <p className="text-[11px] text-text-muted truncate">{testimonial.product}</p>
          </div>
          <Quote size={20} className="text-mint/30 shrink-0" />
        </div>

        {/* Stars */}
        <div className="flex gap-0.5 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < testimonial.rating ? "text-gold fill-gold" : "text-charcoal/20"}
            />
          ))}
        </div>

        <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">{testimonial.text}</p>
      </div>
    </div>
  );
}
