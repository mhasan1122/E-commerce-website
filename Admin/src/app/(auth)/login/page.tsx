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
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.push("/");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Sign-in failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-midnight">
      {/* Abstract Background Elements */}
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
        className="w-full max-w-[420px] z-10"
      >
        <div className="rounded-2xl border border-mint/25 bg-charcoal p-8 md:p-10 shadow-2xl shadow-black/40">
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

          {error && (
            <div className="mb-5 flex items-start gap-2 p-3 rounded-lg bg-coral/10 border border-coral/30 text-coral text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="admin-email" className="text-sm font-medium text-warm-white px-0.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mint/80">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-midnight border-2 border-white/20 rounded-xl py-3 pl-11 pr-3 text-base text-warm-white placeholder:text-warm-white/45 focus:outline-none focus:border-mint focus:ring-2 focus:ring-mint/25"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-0.5 gap-2">
                <label htmlFor="admin-password" className="text-sm font-medium text-warm-white">
                  Password
                </label>
                <Link href="#" className="text-sm font-medium text-mint shrink-0 hover:underline underline-offset-2">
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
                  required
                  minLength={6}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <input type="checkbox" defaultChecked className="size-4 rounded border-2 border-white/30 bg-midnight text-mint accent-[#C8A97E] focus:ring-2 focus:ring-mint/40" />
              Keep me signed in
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-mint text-midnight font-semibold text-base shadow-lg shadow-mint/25 hover:bg-mint-dark hover:shadow-mint/35 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-warm-white/80 mt-8">
            Need access?{" "}
            <Link href="/register" className="font-semibold text-mint hover:underline underline-offset-2">
              Create an account
            </Link>
          </p>
          <p className="text-center text-[11px] text-warm-white/50 mt-4">
            Default seeded admin: <span className="text-mint">admin@example.com</span> / <span className="text-mint">admin12345</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
