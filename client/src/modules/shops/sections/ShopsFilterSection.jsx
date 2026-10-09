import { RotateCcw } from "lucide-react";

const categories = [
  "All",
  "Grocery",
  "Bakery",
  "Fruits & Vegetables",
  "Dairy",
  "Meat & Fish",
  "Restaurants",
  "Cafés",
  "Sweets & Snacks",
  "Medical",
  "Fashion",
  "Footwear",
  "Jewellery",
  "Electronics",
  "Mobiles",
  "Mobile Accessories",
  "Hardware",
  "Electrical",
  "Home & Furniture",
  "Beauty",
  "Baby Care",
  "Books",
  "Stationery",
  "Sports",
  "Toys",
  "Pet Supplies",
  "Florists",
  "Auto Parts",
  "Tailoring",
  "Laundry",
  "Gifts",
];

function ShopsFilterSection({
  category,
  setCategory,
  sortBy,
  setSortBy,
  openOnly,
  setOpenOnly,
  verifiedOnly,
  setVerifiedOnly,
  maxDistance,
  setMaxDistance,
  minRating,
  setMinRating,
  isMobileFiltersOpen,
  onCloseFilters,
}) {
  const resetFilters = () => {
    setCategory("All");
    setSortBy("distance");
    setOpenOnly(false);
    setVerifiedOnly(false);
    setMaxDistance(10);
    setMinRating(0);
  };

  return (
    <section
      className={`
    border-b border-gray-200 bg-white
    ${isMobileFiltersOpen ? "block" : "hidden"}
    lg:block
  `}
    >
      <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
        {/* Heading */}

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#022B3A]">Filter Shops</h2>

            <p className="mt-1 text-sm text-gray-500">
              Find exactly what you're looking for.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:border-[#FF8C00] hover:text-[#FF8C00]"
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              type="button"
              onClick={onCloseFilters}
              className="rounded-lg border border-[#022B3A] px-4 py-2 text-sm font-medium text-[#022B3A] transition hover:bg-[#022B3A] hover:text-white lg:hidden"
            >
              Close
            </button>
          </div>
        </div>

        {/* Categories */}

        <div>
          <p className="mb-3 text-sm font-semibold text-[#022B3A]">
            Categories
          </p>

          <div
            className="
    flex
    gap-3
    overflow-x-auto
    pb-2
    scrollbar-thin
    scrollbar-track-transparent
    scrollbar-thumb-[#022B3A]/20
  "
          >
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`cursor-pointer whitespace-nowrap rounded-full border px-5 py-2 text-sm font-medium transition ${
                  category === item
                    ? "border-[#FF8C00] bg-[#FF8C00] text-white"
                    : "border-gray-300 bg-white hover:border-[#FF8C00]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Other Filters */}

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* Distance */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#022B3A]">
              Maximum Distance
            </label>

            <input
              type="range"
              min="1"
              max="20"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="cursor-pointer w-full accent-[#FF8C00]"
            />

            <p className="mt-2 text-sm text-gray-500">{maxDistance} km</p>
          </div>

          {/* Rating */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#022B3A]">
              Minimum Rating
            </label>

            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="cursor-pointer w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#FF8C00]"
            >
              <option value={0}>Any Rating</option>
              <option value={3}>3★ & Above</option>
              <option value={4}>4★ & Above</option>
              <option value={4.5}>4.5★ & Above</option>
            </select>
          </div>

          {/* Sort */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#022B3A]">
              Sort By
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="cursor-pointer w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#FF8C00]"
            >
              <option value="distance">Nearest First</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviewed</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* Toggle Filters */}

          <div className="flex flex-col justify-center gap-4">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={openOnly}
                onChange={() => setOpenOnly(!openOnly)}
                className="cursor-pointer h-5 w-5 accent-[#FF8C00]"
              />

              <span className="text-sm font-medium text-gray-700">
                Open Now
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={() => setVerifiedOnly(!verifiedOnly)}
                className="cursor-pointer h-5 w-5 accent-[#FF8C00]"
              />

              <span className="text-sm font-medium text-gray-700">
                Verified Shops Only
              </span>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShopsFilterSection;
