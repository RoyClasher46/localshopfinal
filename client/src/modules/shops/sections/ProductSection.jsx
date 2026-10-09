import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import ProductCard from "../components/ProductCard";

function ProductSection({ products, shop }) {
  const [sortBy, setSortBy] = useState("popular");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const unique = [...new Set(products.map((item) => item.category))];
    return ["All", ...unique];
  }, [products]);

  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "priceLow":
          return a.price - b.price;

        case "priceHigh":
          return b.price - a.price;

        case "rating":
          return b.rating - a.rating;

        case "popular":
          return b.reviews - a.reviews;

        case "newest":
          return b.id.localeCompare(a.id);

        default:
          return 0;
      }
    });

  return (
    <section className="bg-[#F8F9FA] py-16">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          {/* Heading */}
          <div>
            <h2 className="text-3xl font-bold text-[#022B3A]">Products</h2>

            <p className="mt-2 text-gray-600">
              Browse all available products from this shop.
            </p>
          </div>

          {/* Search + Sort */}
          <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto">
            {/* Search */}
            <div className="relative w-full lg:w-96">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-[#FF8C00]"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="cursor-pointer rounded-xl border border-gray-300 bg-white px-5 py-3 font-medium text-[#022B3A] outline-none transition focus:border-[#FF8C00]"
            >
              <option value="popular">Popularity</option>
              <option value="rating">Highest Rated</option>
              <option value="priceLow">Price: Low → High</option>
              <option value="priceHigh">Price: High → Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* Categories */}

        <div className="mt-10 flex gap-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`cursor-pointer whitespace-nowrap rounded-full px-6 py-3 text-sm font-semibold transition

              ${
                selectedCategory === category
                  ? "bg-[#022B3A] text-white"
                  : "border border-gray-300 bg-white text-gray-700 hover:border-[#FF8C00] hover:text-[#FF8C00]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products */}

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} shop={shop} />
          ))}
        </div>

        {/* Empty State */}

        {filteredProducts.length === 0 && (
          <div className="mt-16 rounded-3xl bg-white py-20 text-center shadow-sm">
            <div className="text-6xl">🛒</div>

            <h3 className="mt-6 text-2xl font-bold text-[#022B3A]">
              No Products Found
            </h3>

            <p className="mt-3 text-gray-500">
              Try searching with another keyword or category.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductSection;
