"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Lock,
  Truck,
  ChevronLeft,
  Shield,
  Tag,
  Check,
  Package,
  MapPin,
  Phone,
  Mail,
  User,
  ShoppingBag,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useCartStore } from "@/lib/store";
import { useAuthStore } from "@/lib/authStore";
import { http, ApiError } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

type Step = 1 | 2 | 3;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const ready = useAuthStore((s) => s.ready);

  const [step, setStep] = useState<Step>(1);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    email: user?.email || "",
    phone: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "Bangladesh",
    paymentMethod: "cod" as "cod" | "card",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
    notes: "",
  });

  const subtotal = totalPrice();
  const shipping = subtotal > 9999 ? 0 : 200;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      const payload = {
        items: items.map((it) => ({
          productId: Number(it.product.id),
          quantity: it.quantity,
          selectedColor: it.selectedColor || null,
          selectedSize: it.selectedSize || null,
        })),
        shippingAddress: {
          fullName: `${form.firstName} ${form.lastName}`.trim(),
          phone: form.phone || undefined,
          line1: form.address,
          line2: form.address2 || undefined,
          city: form.city,
          state: form.state || undefined,
          postalCode: form.zip || undefined,
          country: form.country || "Bangladesh",
        },
        paymentMethod: form.paymentMethod,
        notes: form.notes || undefined,
        shippingFee: shipping,
        tax,
        discount: 0,
      };

      const res = await http.post<{
        success: true;
        data: { id: number; orderNumber: string };
      }>("/orders", payload);

      clearCart();
      setOrderNumber(res.data.orderNumber);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-screen pt-28 flex items-center justify-center text-text-muted">
        <Loader2 className="w-6 h-6 animate-spin text-mint mr-2" />
        <span>Loading…</span>
      </div>
    );
  }

  if (items.length === 0 && !orderNumber) {
    return (
      <div className="min-h-screen bg-surface pt-24 pb-20 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-24 h-24 rounded-full bg-charcoal/5 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-text-muted" />
          </div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-text-primary mb-3">
            Your cart is empty
          </h1>
          <p className="text-text-muted mb-6">Add some products before checking out</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-mint to-mint-dark text-midnight font-bold rounded-xl hover:shadow-lg hover:shadow-mint/20 transition-all"
          >
            Browse Products <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  if (orderNumber) {
    return (
      <div className="min-h-screen bg-surface pt-24 pb-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-mint to-mint-dark flex items-center justify-center mx-auto mb-6"
          >
            <Check size={48} className="text-midnight" />
          </motion.div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-text-primary mb-3">
            Order Placed!
          </h1>
          <p className="text-text-secondary mb-2">Thank you for your purchase. Your order has been confirmed.</p>
          <p className="text-text-muted text-sm mb-8">
            Order <span className="font-bold text-text-primary">#{orderNumber}</span> — A confirmation will be
            sent to {form.email || user?.email}.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/account/orders"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-mint to-mint-dark text-midnight font-bold rounded-xl hover:shadow-lg hover:shadow-mint/20 transition-all"
            >
              View my orders
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-elevated border border-border-subtle text-text-primary font-semibold rounded-xl hover:border-mint/30 transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-mint transition-colors mb-4"
          >
            <ChevronLeft size={16} /> Continue Shopping
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] text-text-primary">
            Checkout
          </h1>
          {!user && (
            <p className="mt-2 text-sm text-text-secondary">
              You&apos;ll be asked to sign in before placing the order.{" "}
              <Link
                href={`/login?redirect=${encodeURIComponent("/checkout")}`}
                className="text-mint font-semibold hover:underline"
              >
                Sign in now
              </Link>
            </p>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {[
            { num: 1 as Step, label: "Shipping" },
            { num: 2 as Step, label: "Payment" },
            { num: 3 as Step, label: "Review" },
          ].map(({ num, label }, i) => (
            <div key={num} className="flex items-center">
              <button onClick={() => num < step && setStep(num)} className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step >= num
                      ? "bg-gradient-to-br from-mint to-mint-dark text-midnight"
                      : "bg-surface-elevated border border-border-subtle text-text-muted"
                  }`}
                >
                  {step > num ? <Check size={16} /> : num}
                </div>
                <span
                  className={`hidden sm:block text-sm font-medium ${
                    step >= num ? "text-text-primary" : "text-text-muted"
                  }`}
                >
                  {label}
                </span>
              </button>
              {i < 2 && (
                <div
                  className={`w-12 sm:w-20 h-0.5 mx-3 rounded-full transition-colors ${
                    step > num ? "bg-mint" : "bg-border-subtle"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="glass-card p-6 sm:p-8">
                    <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-text-primary mb-6 flex items-center gap-2">
                      <MapPin size={20} className="text-mint" /> Shipping Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField icon={User} label="First Name" value={form.firstName} onChange={(v) => updateForm("firstName", v)} placeholder="John" />
                      <InputField icon={User} label="Last Name" value={form.lastName} onChange={(v) => updateForm("lastName", v)} placeholder="Doe" />
                      <InputField icon={Mail} label="Email" value={form.email} onChange={(v) => updateForm("email", v)} placeholder="you@example.com" className="sm:col-span-2" />
                      <InputField icon={Phone} label="Phone" value={form.phone} onChange={(v) => updateForm("phone", v)} placeholder="+880 1700 000000" className="sm:col-span-2" />
                      <InputField icon={MapPin} label="Address" value={form.address} onChange={(v) => updateForm("address", v)} placeholder="House 123, Road 5" className="sm:col-span-2" />
                      <InputField label="Apt / Suite (optional)" value={form.address2} onChange={(v) => updateForm("address2", v)} placeholder="Apt 4B" className="sm:col-span-2" />
                      <InputField label="City" value={form.city} onChange={(v) => updateForm("city", v)} placeholder="Dhaka" />
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="State" value={form.state} onChange={(v) => updateForm("state", v)} placeholder="Dhaka" />
                        <InputField label="ZIP Code" value={form.zip} onChange={(v) => updateForm("zip", v)} placeholder="1205" />
                      </div>
                      <InputField label="Country" value={form.country} onChange={(v) => updateForm("country", v)} placeholder="Bangladesh" className="sm:col-span-2" />
                    </div>

                    <button
                      onClick={() => setStep(2)}
                      disabled={!form.firstName || !form.address || !form.city}
                      className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-mint to-mint-dark text-midnight font-bold rounded-xl hover:shadow-lg hover:shadow-mint/20 transition-all disabled:opacity-50"
                    >
                      Continue to Payment <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="glass-card p-6 sm:p-8">
                    <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-text-primary mb-6 flex items-center gap-2">
                      <CreditCard size={20} className="text-mint" /> Payment Method
                    </h2>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <button
                        onClick={() => updateForm("paymentMethod", "cod")}
                        className={`p-4 rounded-xl border text-sm font-semibold text-left transition-all ${
                          form.paymentMethod === "cod"
                            ? "border-mint bg-mint/5 text-midnight"
                            : "border-border-subtle bg-surface-elevated text-text-secondary"
                        }`}
                      >
                        <Truck size={18} className="mb-2 text-mint" />
                        Cash on Delivery
                        <span className="block text-[11px] font-normal text-text-muted mt-1">
                          Pay when you receive your order
                        </span>
                      </button>
                      <button
                        onClick={() => updateForm("paymentMethod", "card")}
                        className={`p-4 rounded-xl border text-sm font-semibold text-left transition-all ${
                          form.paymentMethod === "card"
                            ? "border-mint bg-mint/5 text-midnight"
                            : "border-border-subtle bg-surface-elevated text-text-secondary"
                        }`}
                      >
                        <CreditCard size={18} className="mb-2 text-mint" />
                        Credit / Debit card
                        <span className="block text-[11px] font-normal text-text-muted mt-1">
                          Secure payment via card
                        </span>
                      </button>
                    </div>

                    {form.paymentMethod === "card" && (
                      <>
                        <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-surface-elevated">
                          <Lock size={16} className="text-mint" />
                          <span className="text-xs text-text-muted">
                            Your payment information is encrypted and secure
                          </span>
                        </div>
                        <div className="space-y-4">
                          <InputField icon={CreditCard} label="Card Number" value={form.cardNumber} onChange={(v) => updateForm("cardNumber", v)} placeholder="4242 4242 4242 4242" />
                          <InputField icon={User} label="Cardholder Name" value={form.cardName} onChange={(v) => updateForm("cardName", v)} placeholder="John Doe" />
                          <div className="grid grid-cols-2 gap-4">
                            <InputField label="Expiry" value={form.expiry} onChange={(v) => updateForm("expiry", v)} placeholder="MM/YY" />
                            <InputField label="CVV" value={form.cvv} onChange={(v) => updateForm("cvv", v)} placeholder="123" />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setStep(1)}
                        className="px-6 py-3.5 bg-surface-elevated border border-border-subtle text-text-primary font-semibold rounded-xl hover:border-mint/30 transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-mint to-mint-dark text-midnight font-bold rounded-xl hover:shadow-lg hover:shadow-mint/20 transition-all"
                      >
                        Review Order <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="glass-card p-6 sm:p-8">
                    <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-text-primary mb-6 flex items-center gap-2">
                      <Package size={20} className="text-mint" /> Order Review
                    </h2>

                    <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-text-primary flex items-center gap-2">
                          <MapPin size={14} className="text-mint" /> Shipping To
                        </span>
                        <button onClick={() => setStep(1)} className="text-xs text-mint hover:underline">
                          Edit
                        </button>
                      </div>
                      <p className="text-sm text-text-secondary">
                        {form.firstName} {form.lastName}
                        <br />
                        {form.address}
                        {form.address2 ? `, ${form.address2}` : ""}
                        <br />
                        {form.city}
                        {form.state ? `, ${form.state}` : ""} {form.zip}
                        <br />
                        {form.country}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-text-primary flex items-center gap-2">
                          <CreditCard size={14} className="text-mint" /> Payment Method
                        </span>
                        <button onClick={() => setStep(2)} className="text-xs text-mint hover:underline">
                          Edit
                        </button>
                      </div>
                      <p className="text-sm text-text-secondary uppercase tracking-wider">
                        {form.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : `Card ending in ${form.cardNumber.slice(-4) || "****"}`}
                      </p>
                    </div>

                    <div className="space-y-3 mb-6">
                      {items.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center gap-4 p-3 rounded-xl bg-surface-elevated"
                        >
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="56px"
                              unoptimized
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-text-primary truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-xs text-text-muted">
                              Qty: {item.quantity}
                              {item.selectedColor ? ` · ${item.selectedColor}` : ""}
                              {item.selectedSize ? ` · ${item.selectedSize}` : ""}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-mint">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {submitError && (
                      <div className="mb-4 p-3 rounded-xl bg-coral/10 border border-coral/20 text-coral text-xs font-semibold">
                        {submitError}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(2)}
                        disabled={submitting}
                        className="px-6 py-3.5 bg-surface-elevated border border-border-subtle text-text-primary font-semibold rounded-xl hover:border-mint/30 transition-all disabled:opacity-50"
                      >
                        Back
                      </button>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handlePlaceOrder}
                        disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-mint to-mint-dark text-midnight font-bold rounded-xl hover:shadow-lg hover:shadow-mint/20 transition-all disabled:opacity-60"
                      >
                        {submitting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Lock size={16} />
                        )}{" "}
                        Place Order — {formatPrice(total)}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-28">
              <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-text-primary mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-charcoal/5">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                        unoptimized
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-mint text-midnight text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-primary truncate">{item.product.name}</p>
                    </div>
                    <span className="text-xs font-bold text-text-primary">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mb-4">
                <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-elevated border border-border-subtle">
                  <Tag size={14} className="text-text-muted shrink-0" />
                  <input
                    type="text"
                    placeholder="Coupon code"
                    className="flex-1 bg-transparent text-xs outline-none text-text-primary placeholder-text-muted"
                  />
                </div>
                <button className="px-3 py-2 bg-charcoal text-warm-white text-xs font-semibold rounded-lg hover:bg-charcoal-light transition-colors">
                  Apply
                </button>
              </div>

              <div className="border-t border-border-subtle pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span className="font-semibold text-text-primary">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Shipping</span>
                  <span className={`font-semibold ${shipping === 0 ? "text-mint" : "text-text-primary"}`}>
                    {shipping === 0 ? "FREE" : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Tax</span>
                  <span className="font-semibold text-text-primary">{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-border-subtle">
                  <span className="font-bold text-text-primary text-base">Total</span>
                  <span className="font-bold text-xl text-mint">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 justify-center text-text-muted">
                <Shield size={14} className="text-mint" />
                <span className="text-xs">Secure 256-bit SSL Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  icon?: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-text-secondary mb-1.5">{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${Icon ? "pl-10" : "pl-3"} pr-3 py-3 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary placeholder-text-muted text-sm focus:outline-none focus:ring-2 focus:ring-mint/30 focus:border-mint transition-all`}
        />
      </div>
    </div>
  );
}
