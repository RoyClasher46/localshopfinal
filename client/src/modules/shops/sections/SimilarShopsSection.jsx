import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ShopCard from "../components/ShopCard";

function SimilarShopsSection({ shops = [], userLocation }) {
  if (!shops.length) return null;

  return (
    <section className="bg-[#F8F9FA] py-16">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Header */}

        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[#022B3A]">
              Similar Shops Nearby
            </h2>

            <p className="mt-2 text-gray-600">
              Explore other trusted local shops in your area.
            </p>
          </div>

          <Link
            to="/shops"
            className="inline-flex items-center gap-2 rounded-xl border border-[#022B3A] px-5 py-3 font-semibold text-[#022B3A] transition hover:bg-[#022B3A] hover:text-white"
          >
            View All
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Shops Grid */}

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shops.map((shop) => (
            <ShopCard
              key={shop.id || shop._id}
              shop={shop}
              userLocation={userLocation}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default SimilarShopsSection;
