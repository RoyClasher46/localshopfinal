import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ShopsHero from "../sections/ShopsHero";
import ShopsFilterSection from "../sections/ShopsFilterSection";
import ShopsGrid from "../sections/ShopsGrid";

import { useLocation } from "../../../shared/context/LocationContext";
import { getAllShops } from "../../../services/shopService";

function ShopsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const shopsSectionRef = useRef(null);

  const categoryFromUrl = searchParams.get("category");

  const [shops, setShops] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState(categoryFromUrl || "All");

  const [sortBy, setSortBy] = useState("distance");

  const [openOnly, setOpenOnly] = useState(false);

  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [maxDistance, setMaxDistance] = useState(10);

  const [minRating, setMinRating] = useState(0);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const { location } = useLocation();

  //-->>> SEARCH SCROLL TRIGGER

  const [shouldScrollToResults, setShouldScrollToResults] = useState(false);

  useEffect(() => {
    setCategory(categoryFromUrl || "All");
  }, [categoryFromUrl]);

  useLayoutEffect(() => {
    if (!shouldScrollToResults) return;

    if (loading) return;

    const resultsSection = shopsSectionRef.current;

    if (!resultsSection) return;

    requestAnimationFrame(() => {
      resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setShouldScrollToResults(false);
    });
  }, [shouldScrollToResults, loading]);

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);

    const params = new URLSearchParams(searchParams);

    if (newCategory === "All") {
      params.delete("category");
    } else {
      params.set("category", newCategory);
    }

    setSearchParams(params);
  };

  useEffect(() => {
    if (categoryFromUrl) {
      setShouldScrollToResults(true);
    }
  }, []);

  const handleSearch = () => {
    setShouldScrollToResults(true);
  };

  //--->>> FETCH SHOPS

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {};
        if (location?.latitude != null && location?.longitude != null) {
          params.latitude = location.latitude;
          params.longitude = location.longitude;
        }

        const response = await getAllShops(params);

        setShops(response.shops || []);
      } catch (error) {
        console.error("Fetch shops error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to load shops. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [location?.latitude, location?.longitude]);

  //--->> MOBILE FILTER

  const handleOpenFilters = () => {
    setIsMobileFiltersOpen(true);
  };
  const handleCloseFilters = () => {
    setIsMobileFiltersOpen(false);
  };

  //--->>> LOADING

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <ShopsHero
          search={search}
          setSearch={setSearch}
          location={location}
          totalShops={0}
          onOpenFilters={handleOpenFilters}
          onSearch={handleSearch}
        />

        <section
          ref={shopsSectionRef}
          className="mx-auto max-w-7xl px-5 py-20 lg:px-8"
        >
          <div className="rounded-3xl border border-gray-200 bg-white py-20 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF8C00]" />

            <p className="mt-5 text-gray-500">Loading shops...</p>
          </div>
        </section>
      </main>
    );
  }

  //--->>> ERROR

  if (error) {
    return (
      <main className="min-h-screen bg-[#F8F9FA]">
        <ShopsHero
          search={search}
          setSearch={setSearch}
          location={location}
          totalShops={0}
          onOpenFilters={handleOpenFilters}
          onSearch={handleSearch}
        />

        <section
          ref={shopsSectionRef}
          className="mx-auto max-w-7xl px-5 py-20 lg:px-8"
        >
          <div className="rounded-3xl border border-dashed border-red-300 bg-white py-20 text-center shadow-sm">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
              <span className="text-5xl">⚠️</span>
            </div>

            <h2 className="mt-6 text-2xl font-bold text-[#022B3A]">
              Unable to Load Shops
            </h2>

            <p className="mx-auto mt-3 max-w-md text-gray-500">{error}</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA]">
      {/* HERO  */}

      <ShopsHero
        search={search}
        setSearch={setSearch}
        totalShops={shops.length}
        onOpenFilters={handleOpenFilters}
        onSearch={handleSearch}
      />

      {/*  FILTERS  */}

      <ShopsFilterSection
        category={category}
        setCategory={handleCategoryChange}
        sortBy={sortBy}
        setSortBy={setSortBy}
        openOnly={openOnly}
        setOpenOnly={setOpenOnly}
        verifiedOnly={verifiedOnly}
        setVerifiedOnly={setVerifiedOnly}
        maxDistance={maxDistance}
        setMaxDistance={setMaxDistance}
        minRating={minRating}
        setMinRating={setMinRating}
        isMobileFiltersOpen={isMobileFiltersOpen}
        onCloseFilters={handleCloseFilters}
      />

      {/*  SHOP RESULTS  */}

      <div ref={shopsSectionRef} className="scroll-mt-24">
        <ShopsGrid
          shops={shops}
          search={search}
          category={category}
          sortBy={sortBy}
          openOnly={openOnly}
          verifiedOnly={verifiedOnly}
          maxDistance={maxDistance}
          minRating={minRating}
          userLocation={location}
        />
      </div>
    </main>
  );
}

export default ShopsPage;
