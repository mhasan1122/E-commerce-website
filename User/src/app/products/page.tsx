import { Suspense } from "react";
import ProductsClient from "./ProductsClient";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface pt-24 pb-20" />}>
      <ProductsClient />
    </Suspense>
  );
}
