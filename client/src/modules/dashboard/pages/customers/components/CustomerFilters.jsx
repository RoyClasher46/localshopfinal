import { Search, SlidersHorizontal, X } from "lucide-react";

function CustomerFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}) {
  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "All";

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
  };

  return (
    <div className="rounded-2xl border border-[#DDE4E2] bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row">
        {/* SEARCH */}

        <div className="relative flex-1">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
          />

          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search customer name, phone or email..."
            className="h-11 w-full rounded-xl border border-[#DDE4E2] bg-[#F8F4E9] pl-11 pr-4 text-sm text-[#022B3A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
          />
        </div>

        {/* STATUS */}

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-[#64748B]" />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 min-w-[160px] rounded-xl border border-[#DDE4E2] bg-white px-4 text-sm font-medium text-[#022B3A] outline-none transition focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
          >
            <option value="All">All Customers</option>
            <option value="Active">Active Customers</option>
            <option value="Inactive">Inactive Customers</option>
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
    </div>
  );
}

export default CustomerFilters;
