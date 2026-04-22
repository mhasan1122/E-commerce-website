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
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { ApiError, http } from "@/lib/api";

/**
 * Two modes:
 * - If the current user is NOT logged in, POST /auth/register → creates a regular user.
 *   (Admin privileges can't be self-granted.)
 * - If the current user IS a logged-in admin, POST /auth/admin/create-user to
 *   create another admin/user directly.
 */
export default function RegisterPage() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.user);
  const register = useAuthStore((s) => s.register);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<"admin" | "user">("admin");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const isAdmin = currentUser?.role === "admin";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (isAdmin) {
        await http.post("/auth/admin/create-user", {
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        });
        setSuccess(`${role === "admin" ? "Admin" : "User"} "${email.trim()}" created.`);
        setName("");
        setEmail("");
        setPassword("");
      } else {
        await register(name.trim(), email.trim(), password);
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-midnight">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-mint/10 blur-[150px] rounded-full animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold/10 blur-[120px] rounded-full" />
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
              {isAdmin ? "Create a team account" : "Create an account"}
            </h1>
            <p className="text-mint/90 mt-2 text-sm max-w-sm">
              {isAdmin
                ? "As an admin, you can create admin or user accounts directly."
                : "Self-registration creates a standard user. Admins must be provisioned."}
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2 p-3 rounded-lg bg-coral/10 border border-coral/30 text-coral text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-5 flex items-start gap-2 p-3 rounded-lg bg-mint/10 border border-mint/30 text-mint text-sm">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-2">
                <label htmlFor="register-name" className="text-sm font-medium text-warm-white px-0.5">
                  Full name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mint/80">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="register-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    placeholder="John Doe"
                    className="w-full bg-midnight border-2 border-white/20 rounded-xl py-3 pl-11 pr-3 text-base text-warm-white placeholder:text-warm-white/45 focus:outline-none focus:border-mint focus:ring-2 focus:ring-mint/25"
                  />
                </div>
              </div>

              {isAdmin && (
                <div className="space-y-2">
                  <label htmlFor="register-role" className="text-sm font-medium text-warm-white px-0.5">
                    Role
                  </label>
                  <select
                    id="register-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as "admin" | "user")}
                    className="w-full bg-midnight border-2 border-white/20 rounded-xl py-3 px-4 text-base text-warm-white focus:outline-none focus:border-mint focus:ring-2 focus:ring-mint/25 appearance-none cursor-pointer"
                  >
                    <option value="admin" className="bg-charcoal">Admin</option>
                    <option value="user" className="bg-charcoal">User</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="register-email" className="text-sm font-medium text-warm-white px-0.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mint/80">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="register-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="name@example.com"
                  className="w-full bg-midnight border-2 border-white/20 rounded-xl py-3 pl-11 pr-3 text-base text-warm-white placeholder:text-warm-white/45 focus:outline-none focus:border-mint focus:ring-2 focus:ring-mint/25"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="register-password" className="text-sm font-medium text-warm-white px-0.5">
                Password <span className="text-warm-white/50">(min 6)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-mint/80">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-mint text-midnight font-semibold text-base shadow-lg shadow-mint/25 hover:bg-mint-dark hover:shadow-mint/35 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  {isAdmin ? "Create account" : "Sign up"} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-warm-white/80 mt-8">
            Already have access?{" "}
            <Link href="/login" className="font-semibold text-mint hover:underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
