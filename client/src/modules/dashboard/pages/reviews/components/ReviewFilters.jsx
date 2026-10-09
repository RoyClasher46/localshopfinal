import { Search, SlidersHorizontal, X } from "lucide-react";

function ReviewFilters({
  searchQuery,
  setSearchQuery,
  ratingFilter,
  setRatingFilter,
}) {
  const clearFilters = () => {
    setSearchQuery("");
    setRatingFilter("All");
  };

  const hasActiveFilters = searchQuery.trim() !== "" || ratingFilter !== "All";

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {/* SEARCH */}

      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
        />

        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search customer or review..."
          className="h-11 w-full rounded-xl border border-[#DDE4E2] bg-[#F8F4E9] pl-11 pr-4 text-sm text-[#022B3A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
        />
      </div>

      {/* RATING */}

      <div className="flex items-center gap-2">
        <SlidersHorizontal size={18} className="text-[#64748B]" />

        <select
          value={ratingFilter}
          onChange={(event) => setRatingFilter(event.target.value)}
          className="h-11 min-w-[145px] rounded-xl border border-[#DDE4E2] bg-white px-4 text-sm font-medium text-[#022B3A] outline-none transition focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
        >
          <option value="All">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>
      </div>

      {/* CLEAR */}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="cursor-pointer flex h-11 items-center justify-center gap-2 rounded-xl border border-[#DDE4E2] px-4 text-sm font-semibold text-[#64748B] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <X size={16} />
          Clear
        </button>
      )}
    </div>
  );
}

export default ReviewFilters;
