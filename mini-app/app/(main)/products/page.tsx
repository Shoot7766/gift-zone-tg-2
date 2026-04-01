import { Suspense } from "react";
import ProductsPageClient from "@/components/pages/ProductsPageClient";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";

function Fallback() {
  return (
    <div className="grid grid-cols-2 gap-3 p-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<Fallback />}>
      <ProductsPageClient />
    </Suspense>
  );
}
