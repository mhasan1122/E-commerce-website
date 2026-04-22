"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { http, ApiError } from "@/lib/api";
import { mapApiProduct } from "@/lib/api-types";
import type { ApiProduct, Envelope } from "@/lib/api-types";
import type { Product } from "@/lib/store";
import { ProductDetailClient } from "./ProductDetailClient";

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params?.slug) return;
    const load = async () => {
      try {
        const res = await http.get<Envelope<ApiProduct>>(
          `/products/${encodeURIComponent(params.slug)}`
        );
        setProduct(mapApiProduct(res.data));
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setError("Product not found.");
        } else {
          setError(err instanceof ApiError ? err.message : "Failed to load product");
        }
      }
    };
    load();
  }, [params?.slug]);

  if (error) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-text-primary">{error}</h1>
        <button
          onClick={() => router.push("/products")}
          className="px-6 py-2.5 rounded-full bg-mint text-midnight font-semibold text-sm"
        >
          Back to shop
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center text-text-muted">
        <Loader2 className="w-6 h-6 animate-spin text-mint mr-2" />
        <span className="font-medium">Loading…</span>
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}
