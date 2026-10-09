function ProductDescription({ product }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      {" "}
      <h2 className="text-xl font-bold text-[#022B3A]">About this product </h2>
      <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
        {product.description}
      </p>
      {(product.usage || product.storage || product.expiryDate) && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {product.usage && (
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Usage
              </p>
              <p className="mt-2 text-sm font-medium text-[#022B3A]">
                {product.usage}
              </p>
            </div>
          )}

          {product.storage && (
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Storage
              </p>
              <p className="mt-2 text-sm font-medium text-[#022B3A]">
                {product.storage}
              </p>
            </div>
          )}

          {product.expiryDate && (
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Best before / expiry
              </p>
              <p className="mt-2 text-sm font-medium text-[#022B3A]">
                {product.expiryDate}
              </p>
            </div>
          )}

          {product.origin && (
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Origin
              </p>
              <p className="mt-2 text-sm font-medium text-[#022B3A]">
                {product.origin}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default ProductDescription;
