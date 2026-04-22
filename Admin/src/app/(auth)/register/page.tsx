"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  User,
  Building,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-midnight">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-mint/10 blur-[150px] rounded-full animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold/10 blur-[120px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #C8A97E 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="rounded-2xl border border-mint/25 bg-charcoal p-8 md:p-10 shadow-2xl shadow-black/40">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl border-2 border-mint bg-midnight mb-4 flex items-center justify-center shadow-lg shadow-mint/15">
              <ShieldCheck className="w-7 h-7 text-mint" />
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-warm-white tracking-tight">
              Staff application
            </h1>
            <p className="text-mint/90 mt-2 text-sm max-w-sm">
              Request access to the Antigravity admin team. Standard vetting applies.
            </p>
          </div>

          <form className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <label
                  htmlFor="register-name"
                  className="text-sm font-medium text-warm-white px-0.5"
                >
                  Full name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mint/80">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="register-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="John Doe"
                    className="w-full bg-midnight border-2 border-white/20 rounded-xl py-3 pl-11 pr-3 text-base text-warm-white placeholder:text-warm-white/45 focus:outline-none focus:border-mint focus:ring-2 focus:ring-mint/25"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="register-department"
                  className="text-sm font-medium text-warm-white px-0.5"
                >
                  Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mint/80 z-[1]">
                    <Building className="w-4 h-4" />
                  </div>
                  <select
                    id="register-department"
                    name="department"
                    className="w-full bg-midnight border-2 border-white/20 rounded-xl py-3 pl-11 pr-10 text-base text-warm-white focus:outline-none focus:border-mint focus:ring-2 focus:ring-mint/25 appearance-none cursor-pointer"
                    defaultValue="operations"
                  >
                    <option value="operations" className="bg-charcoal">
                      Operations
                    </option>
                    <option value="marketing" className="bg-charcoal">
                      Marketing
                    </option>
                    <option value="finance" className="bg-charcoal">
                      Finance
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-warm-white/60">
                    <ChevronDown className="w-4 h-4" aria-hidden />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="register-email"
                className="text-sm font-medium text-warm-white px-0.5"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mint/80">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="identity@antigravity.io"
                  className="w-full bg-midnight border-2 border-white/20 rounded-xl py-3 pl-11 pr-3 text-base text-warm-white placeholder:text-warm-white/45 focus:outline-none focus:border-mint focus:ring-2 focus:ring-mint/25"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="register-password"
                className="text-sm font-medium text-warm-white px-0.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mint/80">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  className="w-full bg-midnight border-2 border-white/20 rounded-xl py-3 pl-11 pr-12 text-base text-warm-white placeholder:text-warm-white/45 focus:outline-none focus:border-mint focus:ring-2 focus:ring-mint/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-warm-white/80 hover:text-mint transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-xl border-2 border-white/15 bg-midnight/80 p-4 cursor-pointer">
              <input
                type="checkbox"
                required
                className="mt-0.5 size-4 shrink-0 rounded border-2 border-white/30 bg-midnight accent-[#C8A97E] focus:ring-2 focus:ring-mint/40"
              />
              <span className="text-sm text-warm-white/90 leading-snug">
                I understand that administrative actions are logged and may be audited
                by the Executive Board.
              </span>
            </label>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-mint text-midnight font-semibold text-base shadow-lg shadow-mint/25 hover:bg-mint-dark hover:shadow-mint/35 transition-colors flex items-center justify-center gap-2"
            >
              Submit application <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-sm text-warm-white/80 mt-8">
            Already have access?{" "}
            <Link
              href="/login"
              className="font-semibold text-mint hover:underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
