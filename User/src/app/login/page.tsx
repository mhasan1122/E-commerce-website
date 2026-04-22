"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get("redirect") || "/";

  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-surface">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto px-6"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-[family-name:var(--font-heading)] font-bold text-text-primary">
            Welcome back
          </h1>
          <p className="text-text-secondary mt-2">Sign in to continue your luxury journey.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-charcoal/5 p-8">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                Email
              </label>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface border border-charcoal/10 focus:border-mint focus:ring-2 focus:ring-mint/20 outline-none transition-all text-sm font-medium text-text-primary"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[11px] font-semibold text-mint hover:underline"
                  onClick={() => alert("Password reset coming soon.")}
                >
                  Forgot?
                </button>
              </div>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type={showPass ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-surface border border-charcoal/10 focus:border-mint focus:ring-2 focus:ring-mint/20 outline-none transition-all text-sm font-medium text-text-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-coral/10 border border-coral/20 text-coral text-xs font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-midnight text-warm-white font-bold text-sm hover:bg-midnight/90 disabled:opacity-60 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Sign in <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-text-secondary mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-mint hover:underline">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-[11px] text-text-secondary mt-6">
          By signing in, you agree to our Terms & Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
