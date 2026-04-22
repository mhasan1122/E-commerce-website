"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Globe,
  Eye,
  EyeOff,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);

  /** Dev login: any email/password (or empty) signs in until real auth exists */
  const signInDev = () => {
    localStorage.setItem("adminToken", "dev");
    router.push("/");
    router.refresh();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    signInDev();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-midnight">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-mint/10 blur-[150px] rounded-full animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold/10 blur-[120px] rounded-full" />
        
        <div className="absolute inset-0 opacity-[0.03]" style={{ 
          backgroundImage: `radial-gradient(circle at 2px 2px, #C8A97E 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px] z-10"
      >
        {/* Solid dark panel: high contrast text vs background (no washed-out glass) */}
        <div className="rounded-2xl border border-mint/25 bg-charcoal p-8 md:p-10 shadow-2xl shadow-black/40">
          {/* Logo Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl border-2 border-mint bg-midnight mb-4 flex items-center justify-center shadow-lg shadow-mint/15">
              <ShieldCheck className="w-7 h-7 text-mint" />
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-warm-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-mint/90 mt-2 text-sm">
              Sign in to your admin dashboard.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2 group">
              <label
                htmlFor="admin-email"
                className="text-sm font-medium text-warm-white px-0.5"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mint/80">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@antigravity.io"
                  className="w-full bg-midnight border-2 border-white/20 rounded-xl py-3 pl-11 pr-3 text-base text-warm-white placeholder:text-warm-white/45 focus:outline-none focus:border-mint focus:ring-2 focus:ring-mint/25"
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <div className="flex items-center justify-between px-0.5 gap-2">
                <label
                  htmlFor="admin-password"
                  className="text-sm font-medium text-warm-white"
                >
                  Password
                </label>
                <Link
                  href="#"
                  className="text-sm font-medium text-mint shrink-0 hover:underline underline-offset-2"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mint/80">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full bg-midnight border-2 border-white/20 rounded-xl py-3 pl-11 pr-12 text-base text-warm-white placeholder:text-warm-white/45 focus:outline-none focus:border-mint focus:ring-2 focus:ring-mint/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-warm-white/80 hover:text-mint transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-sm text-warm-white cursor-pointer">
              <input
                type="checkbox"
                className="size-4 rounded border-2 border-white/30 bg-midnight text-mint accent-[#C8A97E] focus:ring-2 focus:ring-mint/40"
              />
              Keep me signed in
            </label>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-mint text-midnight font-semibold text-base shadow-lg shadow-mint/25 hover:bg-mint-dark hover:shadow-mint/35 transition-colors flex items-center justify-center gap-2"
            >
              Sign in <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center gap-3 my-8">
            <div className="h-px flex-1 bg-white/15" />
            <span className="text-xs font-medium text-warm-white/70 whitespace-nowrap">
              Other options
            </span>
            <div className="h-px flex-1 bg-white/15" />
          </div>

          <button
            type="button"
            onClick={signInDev}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-white/20 bg-midnight/80 text-warm-white text-sm font-medium hover:border-mint/50 hover:bg-midnight transition-colors"
          >
            <Globe className="w-4 h-4 text-mint" aria-hidden /> Continue with Google
          </button>

          <p className="text-center text-sm text-warm-white/80 mt-8">
            Need access?{" "}
            <Link href="/register" className="font-semibold text-mint hover:underline underline-offset-2">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
