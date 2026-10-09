import { PackageOpen } from "lucide-react";

import ProductCard from "./ProductCard";

function ProductList({ products, onEdit, onDelete, onProductUpdated }) {
  if (!products || products.length === 0) {
    return (
      <div className="rounded-2xl border border-[#DDE4E2] bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF0D9] text-[#FF8C00]">
          <PackageOpen size={30} />
        </div>

        <h2 className="mt-5 text-lg font-bold text-[#022B3A]">
          No products found
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">
          There are no products matching your current search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product._id || product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
          onProductUpdated={onProductUpdated}
        />
      ))}
    </div>
  );
}

export default ProductList;
