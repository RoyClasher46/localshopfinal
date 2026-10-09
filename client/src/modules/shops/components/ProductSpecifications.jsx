function ProductSpecifications({ product }) {
  const specifications = [
    ["Category", product.category],
    ["Unit", product.unit],
    ["Price", `₹${product.price}`],
    ["Available Stock", `${product.stock} ${product.unit}`],
  ];

  if (product.discount > 0) {
    specifications.push(["Discount", `${product.discount}%`]);

    specifications.push([
      "Selling Price",
      `₹${Math.round(
        product.price - (product.price * product.discount) / 100,
      )}`,
    ]);
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold text-[#022B3A]">Product details </h2>
      <div className="mt-5 divide-y divide-gray-100 rounded-2xl border border-gray-100">
        {specifications.map(([label, value]) => (
          <div
            key={label}
            className="flex flex-col gap-1 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-sm text-gray-500">{label}</span>

            <span className="text-sm font-semibold text-[#022B3A]">
              {value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProductSpecifications;
