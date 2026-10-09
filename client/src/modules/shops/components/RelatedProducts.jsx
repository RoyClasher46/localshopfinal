import { ArrowRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

function RelatedProducts({ products, shopId }) {
  const navigate = useNavigate();

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#022B3A]">
            More from this shop{" "}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Explore other products available at this shop.
          </p>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const image = product.image || product.images?.[0] || "";

          const sellingPrice =
            product.discount > 0
              ? Math.round(
                  product.price - (product.price * product.discount) / 100,
                )
              : product.price;

          return (
            <button
              key={product.id}
              type="button"
              onClick={() =>
                navigate(`/shops/${shopId}/products/${product.id}`)
              }
              className="cursor-pointer group overflow-hidden rounded-2xl bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative overflow-hidden bg-gray-100">
                <img
                  src={image}
                  alt={product.name}
                  className="h-48 w-full object-cover transition duration-500 group-hover:scale-105"
                />

                {product.discount > 0 && (
                  <span className="absolute left-3 top-3 rounded-full bg-[#FF8C00] px-2.5 py-1 text-xs font-bold text-white">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#FF8C00]">
                  {product.category}
                </p>

                <h3 className="mt-1 line-clamp-1 font-bold text-[#022B3A]">
                  {product.name}
                </h3>

                <div className="mt-3 flex items-center justify-between">
                  <span className="font-bold text-[#022B3A]">
                    ₹{sellingPrice}
                    <span className="ml-1 text-xs font-normal text-gray-500">
                      / {product.unit}
                    </span>
                  </span>

                  <span className="flex items-center gap-1 text-xs font-semibold text-gray-600">
                    <Star size={13} fill="#FF8C00" className="text-[#FF8C00]" />
                    {product.rating}
                    {product.reviews > 0 && ` (${product.reviews})`}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-semibold text-[#022B3A]">
                  View product
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default RelatedProducts;
