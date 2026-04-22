"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useCartStore, useWishlistStore, useUIStore } from "@/lib/store";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { cartDrawerOpen, setCartDrawerOpen, mobileMenuOpen, setMobileMenuOpen, theme, toggleTheme } = useUIStore();
  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Shop" },
    { href: "/products?category=electronics", label: "Electronics" },
    { href: "/products?category=fashion", label: "Fashion" },
    { href: "/products?category=beauty", label: "Beauty" },
  ];

  return (
    <>
      <nav
        ref={navRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass py-3 shadow-lg"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint to-mint-dark flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
              <span className="text-midnight font-bold text-lg font-[family-name:var(--font-heading)]">L</span>
            </div>
            <span className="text-xl font-bold tracking-wider font-[family-name:var(--font-heading)] text-text-primary">
              LUXE
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="underline-draw text-text-secondary hover:text-text-primary text-sm font-medium transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle - disabled (light mode only)
            <button
              onClick={toggleTheme}
              className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-charcoal/10 transition-colors"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Sun size={20} className="text-gold" />
                  </motion.div>
                ) : (
                  <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Moon size={20} className="text-charcoal" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            */}

            {/* Search */}
            <button className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center hover:bg-charcoal/10 transition-colors" aria-label="Search">
              <Search size={20} className="text-text-secondary" />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-charcoal/10 transition-colors" aria-label="Wishlist">
              <Heart size={20} className="text-text-secondary" />
              {wishlistItems.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-coral text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {wishlistItems.length}
                </motion.span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => setCartDrawerOpen(!cartDrawerOpen)}
              className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-charcoal/10 transition-colors"
              aria-label="Shopping cart"
            >
              <ShoppingBag size={20} className="text-text-secondary" />
              {totalCartItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-mint text-midnight text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {totalCartItems}
                </motion.span>
              )}
            </button>

            {/* Account */}
            <Link href="/account" className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center hover:bg-charcoal/10 transition-colors" aria-label="Account">
              <User size={20} className="text-text-secondary" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-charcoal/10 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={22} className="text-text-primary" /> : <Menu size={22} className="text-text-primary" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-surface/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-3xl font-[family-name:var(--font-heading)] font-bold text-text-primary hover:text-mint transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
