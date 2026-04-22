"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
} from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";

type Step = 1 | 2 | 3;

export default function CheckoutPage() {
  const { items, totalPrice, removeItem, updateQuantity, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>(1);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Form state
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });

  const shipping = totalPrice() > 9999 ? 0 : 999;
  const tax = totalPrice() * 0.08;
  const total = totalPrice() + shipping + tax;

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = () => {
    clearCart();
    setOrderPlaced(true);
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-surface pt-24 pb-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
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

  if (orderPlaced) {
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
            Order Placed! 🎉
          </h1>
          <p className="text-text-secondary mb-2">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          <p className="text-text-muted text-sm mb-8">
            Order #{Math.random().toString(36).substring(2, 10).toUpperCase()} • A confirmation email has been sent.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-mint to-mint-dark text-midnight font-bold rounded-xl hover:shadow-lg hover:shadow-mint/20 transition-all"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-elevated border border-border-subtle text-text-primary font-semibold rounded-xl hover:border-mint/30 transition-all"
            >
              Go Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pt-24 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/products" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-mint transition-colors mb-4">
            <ChevronLeft size={16} /> Continue Shopping
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] text-text-primary">
            Checkout
          </h1>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {[
            { num: 1 as Step, label: "Shipping" },
            { num: 2 as Step, label: "Payment" },
            { num: 3 as Step, label: "Review" },
          ].map(({ num, label }, i) => (
            <div key={num} className="flex items-center">
              <button
                onClick={() => num < step && setStep(num)}
                className="flex items-center gap-2"
              >
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
          {/* ─── LEFT: Form Steps ─── */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Shipping */}
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
                      <InputField icon={Mail} label="Email" value={form.email} onChange={(v) => updateForm("email", v)} placeholder="john@example.com" className="sm:col-span-2" />
                      <InputField icon={Phone} label="Phone" value={form.phone} onChange={(v) => updateForm("phone", v)} placeholder="+1 (555) 000-0000" className="sm:col-span-2" />
                      <InputField icon={MapPin} label="Address" value={form.address} onChange={(v) => updateForm("address", v)} placeholder="123 Main St, Apt 4" className="sm:col-span-2" />
                      <InputField label="City" value={form.city} onChange={(v) => updateForm("city", v)} placeholder="New York" />
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="State" value={form.state} onChange={(v) => updateForm("state", v)} placeholder="NY" />
                        <InputField label="ZIP Code" value={form.zip} onChange={(v) => updateForm("zip", v)} placeholder="10001" />
                      </div>
                    </div>

                    <button
                      onClick={() => setStep(2)}
                      className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-mint to-mint-dark text-midnight font-bold rounded-xl hover:shadow-lg hover:shadow-mint/20 transition-all"
                    >
                      Continue to Payment <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment */}
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
                      <CreditCard size={20} className="text-mint" /> Payment Details
                    </h2>

                    <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-surface-elevated">
                      <Lock size={16} className="text-mint" />
                      <span className="text-xs text-text-muted">Your payment information is encrypted and secure</span>
                    </div>

                    <div className="space-y-4">
                      <InputField icon={CreditCard} label="Card Number" value={form.cardNumber} onChange={(v) => updateForm("cardNumber", v)} placeholder="4242 4242 4242 4242" />
                      <InputField icon={User} label="Cardholder Name" value={form.cardName} onChange={(v) => updateForm("cardName", v)} placeholder="John Doe" />
                      <div className="grid grid-cols-2 gap-4">
                        <InputField label="Expiry Date" value={form.expiry} onChange={(v) => updateForm("expiry", v)} placeholder="MM/YY" />
                        <InputField label="CVV" value={form.cvv} onChange={(v) => updateForm("cvv", v)} placeholder="123" />
                      </div>
                    </div>

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

              {/* Step 3: Review */}
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

                    {/* Shipping Summary */}
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
                        {form.firstName} {form.lastName}<br />
                        {form.address}<br />
                        {form.city}, {form.state} {form.zip}
                      </p>
                    </div>

                    {/* Payment Summary */}
                    <div className="p-4 rounded-xl bg-surface-elevated border border-border-subtle mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-text-primary flex items-center gap-2">
                          <CreditCard size={14} className="text-mint" /> Payment Method
                        </span>
                        <button onClick={() => setStep(2)} className="text-xs text-mint hover:underline">
                          Edit
                        </button>
                      </div>
                      <p className="text-sm text-text-secondary">
                        •••• •••• •••• {form.cardNumber.slice(-4) || "4242"}
                      </p>
                    </div>

                    {/* Items */}
                    <div className="space-y-3 mb-6">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex items-center gap-4 p-3 rounded-xl bg-surface-elevated">
                          <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                            <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="56px" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-text-primary truncate">{item.product.name}</h4>
                            <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                          </div>
                          <span className="text-sm font-bold text-mint">{formatPrice(item.product.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(2)}
                        className="px-6 py-3.5 bg-surface-elevated border border-border-subtle text-text-primary font-semibold rounded-xl hover:border-mint/30 transition-all"
                      >
                        Back
                      </button>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handlePlaceOrder}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-mint to-mint-dark text-midnight font-bold rounded-xl hover:shadow-lg hover:shadow-mint/20 transition-all"
                      >
                        <Lock size={16} /> Place Order — {formatPrice(total)}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ─── RIGHT: Order Summary ─── */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 sticky top-28">
              <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-text-primary mb-4">
                Order Summary
              </h3>

              {/* Items */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar mb-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-charcoal/5">
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="48px" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-mint text-midnight text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text-primary truncate">{item.product.name}</p>
                    </div>
                    <span className="text-xs font-bold text-text-primary">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
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

              {/* Totals */}
              <div className="border-t border-border-subtle pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span className="font-semibold text-text-primary">{formatPrice(totalPrice())}</span>
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
                  <span className="font-bold text-text-primary text-base px-2 py-0.5 rounded taka-badge-bw">Total</span>
                  <span className="font-bold text-xl text-mint">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Trust */}
              <div className="mt-6 flex items-center gap-2 justify-center text-text-muted">
                <Shield size={14} className="text-mint" />
                <span className="text-xs">Secure 256-bit SSL Checkout</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { icon: Truck, label: "Free Ship" },
                  { icon: Shield, label: "Warranty" },
                  { icon: Lock, label: "Secure" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center p-2 rounded-lg bg-surface-elevated text-center">
                    <Icon size={14} className="text-mint mb-1" />
                    <span className="text-[10px] text-text-muted">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Reusable Input Field ─── */
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
