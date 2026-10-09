import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Package,
  Store,
  Layers,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Tag,
  CheckCircle2,
  ChevronRight,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import ProductCard from "../components/ProductCard";
import { productAPI, shopAPI } from "../../../services/api";

function PublicProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & display modes
  const [viewMode, setViewMode] = useState("categories"); // 'categories' | 'shops' | 'grid'
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "All",
  );
  const [selectedShop, setSelectedShop] = useState(
    searchParams.get("shop") || "All",
  );
  const [sortBy, setSortBy] = useState("featured"); // 'featured' | 'price-low' | 'price-high' | 'name'
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams]);

  // Load products and shops
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [productsRes, shopsRes] = await Promise.all([
          productAPI.list(),
          shopAPI.list(),
        ]);

        if (productsRes.data?.success) {
          setProducts(productsRes.data.products || []);
        }

        if (shopsRes.data?.success) {
          setShops(shopsRes.data.shops || []);
        }
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Unable to load products. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute unique categories
  const categories = useMemo(() => {
    const unique = [
      ...new Set(
        products.map((p) => p.category?.trim()).filter(Boolean),
      ),
    ];
    return ["All", ...unique];
  }, [products]);

  // Compute unique shops from products or shops endpoint
  const shopOptions = useMemo(() => {
    const shopList = [];
    const seenIds = new Set();

    products.forEach((p) => {
      const s = p.shop;
      const sId = s?._id || s?.id;
      if (sId && !seenIds.has(String(sId))) {
        seenIds.add(String(sId));
        shopList.push({
          id: String(sId),
          name: s.name || "Local Shop",
        });
      }
    });

    return [{ id: "All", name: "All Shops" }, ...shopList];
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        const catMatch = p.category?.toLowerCase().includes(q);
        const shopMatch = p.shop?.name?.toLowerCase().includes(q);
        return nameMatch || descMatch || catMatch || shopMatch;
      });
    }

    // Category filter
    if (selectedCategory && selectedCategory !== "All") {
      result = result.filter(
        (p) =>
          p.category?.toLowerCase() === selectedCategory.toLowerCase(),
      );
    }

    // Shop filter
    if (selectedShop && selectedShop !== "All") {
      result = result.filter((p) => {
        const sId = p.shop?._id || p.shop?.id || p.shop;
        return String(sId) === String(selectedShop);
      });
    }

    // In stock filter
    if (inStockOnly) {
      result = result.filter((p) => (Number(p.stock) || 0) > 0);
    }

    // Sort
    if (sortBy === "price-low") {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "name") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    return result;
  }, [products, search, selectedCategory, selectedShop, inStockOnly, sortBy]);

  // Group products by Category
  const productsByCategory = useMemo(() => {
    const groups = {};
    filteredProducts.forEach((product) => {
      const cat = product.category?.trim() || "Uncategorized";
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(product);
    });
    return groups;
  }, [filteredProducts]);

  // Group products by Shop
  const productsByShop = useMemo(() => {
    const groups = {};
    filteredProducts.forEach((product) => {
      const shopObj = product.shop || {};
      const shopId = String(shopObj._id || shopObj.id || "unknown");
      const shopName = shopObj.name || "Local Shop";

      if (!groups[shopId]) {
        groups[shopId] = {
          shop: shopObj,
          name: shopName,
          category: shopObj.category || "General",
          location: shopObj.location,
          image: shopObj.image,
          products: [],
        };
      }
      groups[shopId].products.push(product);
    });
    return groups;
  }, [filteredProducts]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    const params = new URLSearchParams(searchParams);
    if (cat === "All") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("All");
    setSelectedShop("All");
    setSortBy("featured");
    setInStockOnly(false);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-[#022B3A]">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#022B3A] via-[#033B4F] to-[#022B3A] py-14 text-white">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#FF8C00]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white">
                <ShoppingBag size={14} className="text-[#FF8C00]" />
                Explore Products & Inventory
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">
                Browse Products <br />
                <span className="text-[#FF8C00]">Category & Shop Wise</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
                Discover genuine products from verified local sellers. Filter by category, view products organized by store, or search your favorite essentials.
              </p>

              {/* Quick Metrics */}
              <div className="mt-6 flex flex-wrap gap-5 text-sm">
                <div>
                  <span className="text-2xl font-extrabold text-[#FF8C00]">
                    {products.length}
                  </span>
                  <p className="text-xs text-white/70">Total Products</p>
                </div>
                <div className="h-8 w-px bg-white/20 my-auto" />
                <div>
                  <span className="text-2xl font-extrabold text-[#FF8C00]">
                    {categories.length - 1}
                  </span>
                  <p className="text-xs text-white/70">Categories</p>
                </div>
                <div className="h-8 w-px bg-white/20 my-auto" />
                <div>
                  <span className="text-2xl font-extrabold text-[#FF8C00]">
                    {shops.length}
                  </span>
                  <p className="text-xs text-white/70">Local Shops</p>
                </div>
              </div>
            </div>

            {/* Quick Hero Search Input */}
            <div className="w-full md:max-w-md">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-2 shadow-2xl backdrop-blur-md">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products by name, shop, or category..."
                    className="w-full rounded-xl bg-white py-3 pl-11 pr-4 text-sm text-[#022B3A] placeholder-[#64748B] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#FF8C00]"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-700 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* CONTROL TOOLBAR: View Toggles & Filters */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          {/* View Mode Tabs: Category-wise, Shop-wise, All */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-1 hidden lg:inline">
              View By:
            </span>

            <button
              onClick={() => setViewMode("categories")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                viewMode === "categories"
                  ? "bg-[#022B3A] text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Tag size={15} />
              Category Wise
            </button>

            <button
              onClick={() => setViewMode("shops")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                viewMode === "shops"
                  ? "bg-[#022B3A] text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Store size={15} />
              Shop Wise
            </button>

            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                viewMode === "grid"
                  ? "bg-[#022B3A] text-white shadow"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Package size={15} />
              All Products
            </button>
          </div>

          {/* Right Filters Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Shop Filter */}
            <select
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-700 focus:border-[#FF8C00] focus:outline-none"
            >
              {shopOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-xs font-medium text-gray-700 focus:border-[#FF8C00] focus:outline-none"
            >
              <option value="featured">Featured / Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>

            {/* In Stock Only Checkbox */}
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600 cursor-pointer select-none px-2">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-gray-300 text-[#FF8C00] focus:ring-[#FF8C00]"
              />
              In Stock Only
            </label>
          </div>
        </div>

        {/* HORIZONTAL CATEGORY CHIPS */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const count =
              cat === "All"
                ? products.length
                : products.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length;
            const isSelected =
              selectedCategory.toLowerCase() === cat.toLowerCase();

            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#FF8C00] text-white shadow-md shadow-[#FF8C00]/20"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF8C00]" />
            <p className="mt-4 text-sm font-medium text-gray-500">
              Loading local products...
            </p>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="rounded-3xl border border-dashed border-red-300 bg-white p-12 text-center shadow-sm">
            <p className="text-base font-semibold text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-[#022B3A] px-4 py-2 text-xs font-bold text-white hover:bg-[#033B4F]"
            >
              Retry
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#FF8C00]">
              <Package size={32} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-[#022B3A]">
              No products found
            </h3>
            <p className="mt-1 text-xs text-gray-500 max-w-sm">
              We couldn't find any products matching your active filters. Try adjusting your search query or reset your filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-5 rounded-xl bg-[#FF8C00] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#e07b00] cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* DISPLAY: 1. CATEGORY-WISE VIEW */}
        {!loading && !error && viewMode === "categories" && filteredProducts.length > 0 && (
          <div className="space-y-12">
            {Object.entries(productsByCategory).map(([categoryName, catProducts]) => (
              <section key={categoryName} className="scroll-mt-6">
                {/* Category Header */}
                <div className="mb-5 flex items-center justify-between border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-[#FF8C00]">
                      <Tag size={16} />
                    </span>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-[#022B3A] capitalize">
                        {categoryName}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {catProducts.length} {catProducts.length === 1 ? "product" : "products"} available
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCategorySelect(categoryName)}
                    className="text-xs font-bold text-[#FF8C00] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    View All in {categoryName}
                    <ChevronRight size={14} />
                  </button>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {catProducts.map((product) => (
                    <ProductCard
                      key={product._id || product.id}
                      product={product}
                      shop={product.shop}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* DISPLAY: 2. SHOP-WISE VIEW */}
        {!loading && !error && viewMode === "shops" && filteredProducts.length > 0 && (
          <div className="space-y-12">
            {Object.entries(productsByShop).map(([shopId, group]) => (
              <section
                key={shopId}
                className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
              >
                {/* Shop Banner / Info */}
                <div className="mb-6 flex flex-col gap-4 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {group.image ? (
                      <img
                        src={group.image}
                        alt={group.name}
                        className="h-14 w-14 rounded-2xl object-cover border border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#FF8C00] border border-orange-100">
                        <Store size={26} />
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-[#022B3A]">
                        {group.name}
                      </h2>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
                          {group.category}
                        </span>
                        {group.location?.city && (
                          <span>• {group.location.city}</span>
                        )}
                        <span>• {group.products.length} products listed</span>
                      </div>
                    </div>
                  </div>

                  {shopId !== "unknown" && (
                    <Link
                      to={`/shops/${shopId}`}
                      className="inline-flex items-center gap-1.5 self-start rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-bold text-[#022B3A] transition-colors hover:bg-gray-100 sm:self-center"
                    >
                      <Store size={14} className="text-[#FF8C00]" />
                      Visit Shop
                      <ChevronRight size={14} />
                    </Link>
                  )}
                </div>

                {/* Shop's Products */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {group.products.map((product) => (
                    <ProductCard
                      key={product._id || product.id}
                      product={product}
                      shop={group.shop}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* DISPLAY: 3. UNIFIED ALL PRODUCTS GRID */}
        {!loading && !error && viewMode === "grid" && filteredProducts.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500">
                Showing {filteredProducts.length} products
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  shop={product.shop}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default PublicProductsPage;
