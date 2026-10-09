import { MapPin, Search, SlidersHorizontal, Store } from "lucide-react";
import { useLocation } from "../../../shared/context/LocationContext";

function ShopsHero({ search, setSearch, totalShops, onOpenFilters, onSearch }) {
  const { location, openLocationModal } = useLocation();
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#022B3A] via-[#033B4F] to-[#022B3A]">
      {/* Background Decoration */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#FF8C00]/10 blur-3xl" />

      <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-10 px-5 py-16 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        {/*  LEFT  */}

        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white">
            <Store size={16} />
            Discover Local Businesses
          </div>

          <h1 className="text-4xl font-extrabold leading-tight text-white md:text-5xl">
            Discover Nearby
            <span className="block text-[#FF8C00]">Local Shops</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-8 text-white/75 md:text-lg">
            Explore trusted grocery stores, pharmacies, bakeries, electronics,
            fashion outlets and many more near your location.
          </p>

          {/* Stats */}

          <div className="mt-8 flex flex-wrap gap-6">
            <div>
              <h3 className="text-2xl font-bold text-[#FF8C00]">
                {totalShops}+
              </h3>

              <p className="text-sm text-white/70">Nearby Shops</p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-[#FF8C00]">20+</h3>

              <p className="text-sm text-white/70">Categories</p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-[#FF8C00]">4.8★</h3>

              <p className="text-sm text-white/70">Average Rating</p>
            </div>
          </div>
        </div>

        {/*  RIGHT  */}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearch();
          }}
          className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl"
        >
          {/* Search */}

          <label className="mb-2 block text-sm font-semibold text-[#022B3A]">
            Search Shops or Products
          </label>

          <div className="flex items-center rounded-xl border border-gray-200 px-4">
            <Search size={20} className="text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shops, products..."
              className="w-full border-0 bg-transparent px-3 py-4 outline-none focus:border-0 focus:outline-none focus:ring-0 focus-visible:!outline-none"
            />
          </div>

          {/* Location */}

          <label className="mb-2 mt-6 block text-sm font-semibold text-[#022B3A]">
            Your Location
          </label>

          <button
            type="button"
            onClick={openLocationModal}
            className="flex w-full items-center justify-between rounded-xl border border-gray-200 px-4 py-4 transition hover:border-[#FF8C00]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <MapPin size={20} className="shrink-0 text-[#FF8C00]" />

              <span className="truncate font-medium text-gray-700">
                {location.label || "Select your location"}
              </span>
            </div>

            <span className="shrink-0 text-sm font-medium text-[#FF8C00]">
              Change
            </span>
          </button>

          {/* Buttons */}

          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              className="cursor-pointer flex-1 rounded-xl bg-[#022B3A] py-4 font-semibold text-white transition hover:bg-[#033B4F]"
            >
              Search Shops
            </button>

            <button
              type="button"
              onClick={onOpenFilters}
              className="cursor-pointer flex items-center justify-center rounded-xl border border-[#022B3A] px-5 transition hover:bg-[#022B3A] hover:text-white lg:hidden"
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>

          {/* Result */}

          <p className="mt-5 text-center text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-[#022B3A]">{totalShops}</span>{" "}
            nearby shops around you
          </p>
        </form>
      </div>
    </section>
  );
}

export default ShopsHero;
