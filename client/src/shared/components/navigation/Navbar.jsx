import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Menu,
  X,
  ChevronDown,
  User,
  Store,
  Navigation,
  ArrowLeft,
  ShoppingCart,
  UserCircle,
  ClipboardList,
  LogOut,
  Package,
  SlidersHorizontal,
} from "lucide-react";

import { useLocation } from "../../context/LocationContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { shopAPI, productAPI } from "../../../services/api";
import logo from "../../../assets/logo.png";

function Navbar() {
  const navigate = useNavigate();

  const { location, openLocationModal } = useLocation();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  //--->>> GLOBAL SEARCH STATE

  const [searchFilter, setSearchFilter] = useState("all");

  const [searchResults, setSearchResults] = useState({
    products: [],
    shops: [],
  });

  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const accountRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (window.innerWidth >= 1024) {
        if (accountRef.current && !accountRef.current.contains(event.target)) {
          setIsAccountOpen(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //--->>> PREVENT BACKGROUND SCROLLING

  useEffect(() => {
    const isOverlayOpen = isMobileMenuOpen || isSearchOpen || isAccountOpen;

    document.body.style.overflow = isOverlayOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, isSearchOpen, isAccountOpen]);

  //--->>> AUTO FOCUS SEARCH INPUT

  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  //--->>> NAVIGATION LINKS

  const navigationLinks = [
    {
      label: "Shops",
      path: "/shops",
    },
    {
      label: "Products",
      path: "/products",
    },
    {
      label: "About",
      path: "/about",
    },
  ];

  //---->>> POPULAR SEARCHES

  const popularSearches = [
    "Grocery",
    "Bakery",
    "Pharmacy",
    "Fashion",
    "Electronics",
    "Fresh Vegetables",
  ];

  //--->>> SEARCH FILTERS

  const searchFilters = [
    {
      id: "all",
      label: "All",
      icon: <SlidersHorizontal size={15} />,
    },
    {
      id: "products",
      label: "Products",
      icon: <Package size={15} />,
    },
    {
      id: "shops",
      label: "Shops",
      icon: <Store size={15} />,
    },
  ];

  //--->>> TEXT NORMALIZATION

  const normalizeText = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "string") {
      return value.toLowerCase().trim();
    }

    if (typeof value === "number" || typeof value === "boolean") {
      return String(value).toLowerCase();
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => normalizeText(item))
        .filter(Boolean)
        .join(" ");
    }

    if (typeof value === "object") {
      return Object.entries(value)
        .map(([key, item]) => {
          if (
            key === "__v" ||
            key === "_id" ||
            key === "password" ||
            key === "token"
          ) {
            return "";
          }

          return normalizeText(item);
        })
        .filter(Boolean)
        .join(" ");
    }

    return "";
  };

  //--->>> GET ID

  const getId = (item) => {
    if (!item) return null;

    return (
      item._id ||
      item.id ||
      item.shopId ||
      item.productId ||
      null
    );
  };

  //--->>> PRODUCT -> SHOP ID

  const getShopIdFromProduct = (product) => {
    if (!product) return null;

    if (product?.shop?._id) {
      return product.shop._id;
    }

    if (product?.shop?.id) {
      return product.shop.id;
    }

    if (product?.shopId) {
      return product.shopId;
    }

    if (typeof product?.shop === "string") {
      return product.shop;
    }

    if (product?.shop?._id?.toString) {
      return product.shop._id.toString();
    }

    return null;
  };

  //--->>> EXTRACT ARRAY FROM API RESPONSE

  const extractArray = (response, possibleKeys = []) => {
    if (!response) {
      return [];
    }

    const data = response?.data;

    if (Array.isArray(data)) {
      return data;
    }

    //--->>> response.data.products / shops
    for (const key of possibleKeys) {
      if (Array.isArray(data?.[key])) {
        return data[key];
      }
    }

    //--->> response.data.data
    if (Array.isArray(data?.data)) {
      return data.data;
    }

    //--->>> response.data.results
    if (Array.isArray(data?.results)) {
      return data.results;
    }

    //--->>> response.data.data.results
    if (Array.isArray(data?.data?.results)) {
      return data.data.results;
    }

    //-->>> response.data.data.products / shops
    for (const key of possibleKeys) {
      if (Array.isArray(data?.data?.[key])) {
        return data.data[key];
      }
    }

    return [];
  };

  const getShopSearchText = (shop) => {
    if (!shop) return "";

    const values = [
      shop.name,
      shop.shopName,
      shop.title,
      shop.description,
      shop.about,
      shop.category,
      shop.categoryName,

      shop.address,
      shop.area,
      shop.locality,
      shop.city,
      shop.state,
      shop.country,
      shop.pincode,
      shop.pinCode,
      shop.zipCode,
      shop.postalCode,

      shop.phone,
      shop.mobile,
      shop.email,
      shop.website,

      shop.registrationType,
      shop.verificationStatus,
      shop.status,

      shop.facilities,
      shop.policies,
      shop.services,
      shop.delivery,
      shop.takeaway,
      shop.paymentMethods,

      shop.owner,
      shop.ownerName,
      shop.ownerEmail,
      shop.seller,
      shop.sellerName,

      shop.location,
      shop.location?.address,
      shop.location?.formattedAddress,
      shop.location?.city,
      shop.location?.state,
      shop.location?.pincode,
      shop.location?.postalCode,

      shop.openingHours,
      shop.hours,
      shop.schedule,
    ];

    return normalizeText(values);
  };

  const getProductSearchText = (product) => {
    if (!product) return "";

    const shop = product.shop || {};

    const values = [
      product.name,
      product.title,
      product.productName,
      product.description,
      product.category,
      product.categoryName,
      product.subcategory,
      product.unit,
      product.price,
      product.stock,
      product.availability,
      product.available,
      product.active,

      product.shopName,
      product.shopTitle,
      product.shopCategory,
      product.shopAddress,

      shop.name,
      shop.shopName,
      shop.title,
      shop.category,
      shop.address,
      shop.city,
      shop.state,
      shop.pincode,
      shop.pinCode,
      shop.location,

      product.shop,
      product.location,
    ];

    return normalizeText(values);
  };

  const matchesSearch = (item, query, type) => {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
      return false;
    }

    let searchableText = "";

    if (type === "product") {
      searchableText = getProductSearchText(item);
    }

    if (type === "shop") {
      searchableText = getShopSearchText(item);
    }



    if (!searchableText) {
      return false;
    }

    if (searchableText.includes(normalizedQuery)) {
      return true;
    }

    const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);

    if (queryWords.length === 0) {
      return false;
    }

    return queryWords.every((word) => searchableText.includes(word));
  };

  //--->>>> SEARCH RESULT LABEL

  const getProductName = (product) => {
    return product?.name || product?.title || product?.productName || "Product";
  };

  const getShopName = (shop) => {
    return shop?.name || shop?.shopName || shop?.title || "Local Shop";
  };



  //--->>>> IMAGE HELPERS

  const getImage = (item, type) => {
    if (!item) return null;

    if (type === "product") {
      return (
        item.image ||
        item.imageUrl ||
        item.thumbnail ||
        item.images?.[0] ||
        null
      );
    }

    if (type === "shop") {
      return (
        item.image ||
        item.logo ||
        item.logoUrl ||
        item.imageUrl ||
        item.images?.[0] ||
        item.gallery?.[0] ||
        null
      );
    }



    return null;
  };

  //---->>> LOCATION TEXT

  const getLocationText = (item) => {
    if (!item) return "";

    const parts = [
      item.address,
      item.area,
      item.locality,
      item.city,
      item.state,
      item.pincode,
      item.pinCode,
      item.postalCode,
      item.zipCode,
    ];

    const direct = parts.filter(Boolean).join(", ");

    if (direct) {
      return direct;
    }

    if (item.location) {
      if (typeof item.location === "string") {
        return item.location;
      }

      const nested = [
        item.location?.address,
        item.location?.formattedAddress,
        item.location?.area,
        item.location?.locality,
        item.location?.city,
        item.location?.state,
        item.location?.pincode,
        item.location?.pinCode,
        item.location?.postalCode,
      ]
        .filter(Boolean)
        .join(", ");

      if (nested) {
        return nested;
      }
    }

    return "";
  };

  //--->>> GLOBAL SEARCH

  const performGlobalSearch = async (
    query = searchQuery,
    filter = searchFilter,
  ) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setSearchResults({
        products: [],
        shops: [],
      });

      setHasSearched(false);
      setSearchError("");

      return;
    }

    setIsSearching(true);
    setSearchError("");
    setHasSearched(true);

    try {
      const shouldSearchProducts = filter === "all" || filter === "products";

      const shouldSearchShops = filter === "all" || filter === "shops";

      const requests = [];

      if (shouldSearchProducts) {
        requests.push({
          type: "products",
          promise: productAPI.list(),
        });
      }

      if (shouldSearchShops) {
        requests.push({
          type: "shops",
          promise: shopAPI.list(),
        });
      }

      const settledResults = await Promise.allSettled(
        requests.map((request) => request.promise),
      );

      const nextResults = {
        products: [],
        shops: [],
      };

      let failedRequests = 0;

      settledResults.forEach((result, index) => {
        const request = requests[index];

        if (result.status === "rejected") {
          failedRequests += 1;

          console.error(
            `Global search ${request.type} request failed:`,
            result.reason,
          );

          return;
        }

        const response = result.value;

        if (request.type === "products") {
          const products = extractArray(response, ["products"]);

          nextResults.products = products
            .filter((product) =>
              matchesSearch(product, trimmedQuery, "product"),
            )
            .slice(0, 8);
        }

        if (request.type === "shops") {
          const shops = extractArray(response, ["shops"]);

          nextResults.shops = shops
            .filter((shop) => matchesSearch(shop, trimmedQuery, "shop"))
            .slice(0, 8);
        }
      });

      setSearchResults(nextResults);

      if (failedRequests > 0 && failedRequests === requests.length) {
        setSearchError("Unable to load search results. Please try again.");
      } else if (failedRequests > 0) {
        setSearchError(
          "Some search results could not be loaded. Please try again.",
        );
      }
    } catch (error) {
      console.error("Global search failed:", error);

      setSearchError("Unable to search right now. Please try again.");

      setSearchResults({
        products: [],
        shops: [],
      });
    } finally {
      setIsSearching(false);
    }
  };

  //--->>> SEARCH HANDLER

  const handleSearch = async (e) => {
    e?.preventDefault();

    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    await performGlobalSearch(query, searchFilter);
  };

  //--->>> POPULAR SEARCH HANDLER

  const handlePopularSearch = async (query) => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    setSearchQuery(trimmedQuery);

    setIsSearchOpen(true);
    setIsMobileMenuOpen(false);
    setIsAccountOpen(false);

    await performGlobalSearch(trimmedQuery, searchFilter);
  };

  //--->>> FILTER HANDLER

  const handleSearchFilterChange = async (filter) => {
    setSearchFilter(filter);

    const query = searchQuery.trim();

    if (!query) {
      return;
    }

    await performGlobalSearch(query, filter);
  };

  //---->>> CLEAR SEARCH

  const clearSearch = () => {
    setSearchQuery("");

    setSearchResults({
      products: [],
      shops: [],
    });

    setHasSearched(false);
    setSearchError("");

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  //--->>> SEARCH RESULT NAVIGATION

  const handleProductResultClick = (product) => {
    const productId = getId(product);
    const shopId = getShopIdFromProduct(product);

    if (!productId) {
      return;
    }

    if (shopId) {
      setIsSearchOpen(false);

      navigate(`/shops/${shopId}/products/${productId}`);

      return;
    }

    console.warn("Product search result does not contain shopId:", product);
  };

  const handleShopResultClick = (shop) => {
    const shopId = getId(shop);

    if (!shopId) {
      return;
    }

    setIsSearchOpen(false);

    navigate(`/shops/${shopId}`);
  };



  //--->>>> LOGOUT

  const handleLogout = async () => {
    try {
      setIsAccountOpen(false);
      setIsMobileMenuOpen(false);

      if (logout) {
        await logout();
      }

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  //-->>> CART NAVIGATION

  const handleCartNavigation = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setIsMobileMenuOpen(false);
    setIsAccountOpen(false);

    navigate("/cart");
  };

  //--->>> MOBILE NAVIGATION

  const handleMobileNavigation = (path) => {
    setIsMobileMenuOpen(false);
    setIsAccountOpen(false);

    navigate(path);
  };

  //--->>> OPEN SEARCH

  const openSearch = () => {
    setIsSearchOpen(true);
    setIsMobileMenuOpen(false);
    setIsAccountOpen(false);
  };

  //--->> CLOSE SEARCH

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  //--->>> CART BUTTON

  const CartButton = ({ mobile = false }) => {
    if (!user) return null;

    return (
      <button
        type="button"
        onClick={handleCartNavigation}
        className={
          mobile
            ? "relative flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-white/10"
            : "cursor-pointer relative flex h-11 w-11 items-center justify-center rounded-lg border border-white/20 transition hover:border-[#FF8C00] hover:bg-white/10"
        }
        aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
        title="Cart"
      >
        <ShoppingCart size={mobile ? 21 : 20} />

        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-[#FF8C00] px-1 text-[10px] font-bold leading-none text-white shadow">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {/* DESKTOP */}

      <header className="sticky top-0 z-50 hidden w-full border-b border-[#164854] bg-[#022B3A] text-white shadow-sm lg:block">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-5 px-6 xl:px-8">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2"
            aria-label="ShopLocal Home"
          >
            <div className="flex h-10 w-auto shrink-0 items-center">
              <img
                src={logo}
                alt="ShopLocal"
                className="h-10 w-auto object-contain"
              />
            </div>

            <span className="text-lg font-bold">
              <span className="text-[#FF8C00]">Shop</span>
              <span className="text-white">Local</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <form
            onSubmit={handleSearch}
            className="ml-auto flex min-w-0 max-w-[430px] flex-1"
          >
            <div className="relative w-full">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={openSearch}
                placeholder="Search products, shops..."
                className="h-11 w-full rounded-lg border border-[#E5E7EB] bg-[#F8F4E9] pl-11 pr-4 text-sm text-[#022B3A] outline-none transition placeholder:text-[#64748B] focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
              />
            </div>
          </form>

          <button
            type="button"
            onClick={openLocationModal}
            className="flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white/20 px-3 text-sm font-medium transition hover:border-[#FF8C00] hover:bg-white/10"
            title="Change location"
          >
            <MapPin size={19} className="text-[#FF8C00]" />

            <span className="hidden max-w-[120px] truncate xl:block">
              {location.label || "Select location"}
            </span>
          </button>

          <CartButton />

          <div className="relative shrink-0" ref={accountRef}>
            <button
              type="button"
              onClick={() => setIsAccountOpen((prev) => !prev)}
              className={
                user
                  ? "flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 transition hover:border-[#FF8C00] hover:bg-white/10"
                  : "flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-white/20 px-4 text-sm font-medium transition hover:border-[#FF8C00] hover:bg-white/10"
              }
              aria-label={user ? "Open user menu" : "Open account menu"}
              title="Account"
            >
              {user ? (
                <UserCircle size={23} />
              ) : (
                <>
                  <User size={18} />

                  <span className="hidden xl:block">Account</span>

                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      isAccountOpen ? "rotate-180" : ""
                    }`}
                  />
                </>
              )}
            </button>

            {isAccountOpen && (
              <AccountDropdown
                user={user}
                onNavigate={(path) => {
                  setIsAccountOpen(false);
                  navigate(path);
                }}
                onLogout={handleLogout}
              />
            )}
          </div>
        </div>
      </header>

      {/*  TABLET */}

      <header className="sticky top-0 z-50 hidden w-full border-b border-[#164854] bg-[#022B3A] text-white shadow-sm md:block lg:hidden">
        <div className="flex h-[68px] items-center gap-2 px-4">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <div className="flex h-10 w-auto shrink-0 items-center">
              <img
                src={logo}
                alt="ShopLocal"
                className="h-10 w-auto object-contain"
              />
            </div>

            <span className="text-lg font-bold">
              <span className="text-[#FF8C00]">Shop</span>
              <span className="text-white">Local</span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={openSearch}
              className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-white/10"
              aria-label="Search"
            >
              <Search size={21} />
            </button>

            <button
              type="button"
              onClick={openLocationModal}
              className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-white/10"
              aria-label="Change location"
            >
              <MapPin size={20} className="text-[#FF8C00]" />
            </button>

            <CartButton mobile />

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsAccountOpen(true);
              }}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition hover:bg-white/10"
              aria-label="Account"
            >
              {user ? <UserCircle size={22} /> : <User size={20} />}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsAccountOpen(false);
                setIsMobileMenuOpen(true);
              }}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition hover:bg-white/10"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/*  MOBILE */}

      <header className="sticky top-0 z-50 block w-full border-b border-[#164854] bg-[#022B3A] text-white shadow-sm md:hidden">
        <div className="flex h-[60px] items-center gap-1 px-2">
          <button
            type="button"
            onClick={() => {
              setIsAccountOpen(false);
              setIsMobileMenuOpen(true);
            }}
            className="cursor-pointer flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition hover:bg-white/10"
            aria-label="Open menu"
          >
            <Menu size={23} />
          </button>

          <Link to="/" className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-auto max-w-[120px] shrink-0 items-center">
              <img
                src={logo}
                alt="ShopLocal"
                className="h-9 w-auto max-w-full object-contain"
              />
            </div>

            <span className="text-lg font-bold">
              <span className="text-[#FF8C00]">Shop</span>
              <span className="text-white">Local</span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-0">
            <button
              type="button"
              onClick={openSearch}
              className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-white/10"
              aria-label="Search"
            >
              <Search size={21} />
            </button>

            <button
              type="button"
              onClick={openLocationModal}
              className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-white/10"
              aria-label="Change location"
            >
              <MapPin size={20} className="text-[#FF8C00]" />
            </button>

            <CartButton mobile />

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsAccountOpen(true);
              }}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg transition hover:bg-white/10"
              aria-label="Account"
            >
              {user ? <UserCircle size={22} /> : <User size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE / TABLET DRAWER */}

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <aside className="absolute right-0 top-0 flex h-[100dvh] w-[min(360px,88vw)] flex-col overflow-hidden bg-[#F8F4E9] text-[#022B3A] shadow-2xl">
            <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-[#164854] bg-[#022B3A] px-5 text-white">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <div className="flex h-9 w-auto shrink-0 items-center">
                  <img
                    src={logo}
                    alt="ShopLocal"
                    className="h-9 w-auto object-contain"
                  />
                </div>

                <span className="text-lg font-bold">
                  <span className="text-[#FF8C00]">Shop</span>
                  <span className="text-white">Local</span>
                </span>
              </Link>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-white/10"
                aria-label="Close menu"
              >
                <X size={23} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Explore
              </p>

              <nav className="space-y-1">
                {navigationLinks.map((link) => (
                  <button
                    type="button"
                    key={link.path}
                    onClick={() => handleMobileNavigation(link.path)}
                    className="cursor-pointer flex w-full items-center rounded-lg px-4 py-3 text-left text-base font-medium transition hover:bg-[#FFF0D9] hover:text-[#FF8C00]"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>

              {user && (
                <>
                  <div className="my-6 h-px bg-[#DDE4E2]" />

                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Shopping
                  </p>

                  <button
                    type="button"
                    onClick={handleCartNavigation}
                    className="cursor-pointer flex w-full items-center justify-between rounded-lg px-4 py-3 text-left font-medium transition hover:bg-[#FFF0D9] hover:text-[#FF8C00]"
                  >
                    <span className="flex items-center gap-3">
                      <ShoppingCart size={19} />
                      Cart
                    </span>

                    {itemCount > 0 && (
                      <span className="flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full bg-[#FF8C00] px-1.5 text-xs font-bold text-white">
                        {itemCount > 99 ? "99+" : itemCount}
                      </span>
                    )}
                  </button>
                </>
              )}

              <div className="my-6 h-px bg-[#DDE4E2]" />

              {!user && (
                <>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Customer
                  </p>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => handleMobileNavigation("/login")}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left font-medium transition hover:bg-[#FFF0D9]"
                    >
                      <User size={19} />
                      Sign In
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMobileNavigation("/signup")}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left font-medium transition hover:bg-[#FFF0D9]"
                    >
                      <User size={19} />
                      Create Account
                    </button>
                  </div>

                  <div className="my-6 h-px bg-[#DDE4E2]" />
                </>
              )}

              {user && (
                <>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    My Account
                  </p>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => handleMobileNavigation("/profile")}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left font-medium transition hover:bg-[#FFF0D9] hover:text-[#FF8C00]"
                    >
                      <UserCircle size={19} />
                      My Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMobileNavigation("/orders")}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left font-medium transition hover:bg-[#FFF0D9] hover:text-[#FF8C00]"
                    >
                      <ClipboardList size={19} />
                      Orders
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={19} />
                      Logout
                    </button>
                  </div>

                  <div className="my-6 h-px bg-[#DDE4E2]" />
                </>
              )}

              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#64748B]">
                For Shop Owners
              </p>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleMobileNavigation("/seller/login")}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left font-medium transition hover:bg-[#FFF0D9]"
                >
                  <Store size={19} />
                  Seller Login
                </button>

                <button
                  type="button"
                  onClick={() => handleMobileNavigation("/seller/register")}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left font-medium transition hover:bg-[#FFF0D9]"
                >
                  <Store size={19} />
                  Register Your Shop
                </button>
              </div>
            </div>

            <div className="shrink-0 border-t border-[#DDE4E2] bg-[#F8F4E9] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openLocationModal();
                }}
                className="cursor-pointer flex w-full items-center justify-center gap-2 rounded-lg border border-[#022B3A] bg-[#F8F4E9] px-4 py-3 font-medium transition hover:bg-[#FFF0D9]"
              >
                <MapPin size={18} />

                <span className="max-w-[200px] truncate">
                  {location.label || "Select location"}
                </span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* GLOBAL SEARCH OVERLAY */}

      {isSearchOpen && (
        <div className="fixed inset-0 z-[110] flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[#F8F4E9]">
          {/* SEARCH HEADER */}

          <div className="shrink-0 border-b border-[#164854] bg-[#022B3A] p-3">
            <form
              onSubmit={handleSearch}
              className="mx-auto flex w-full max-w-[1400px] items-center gap-2 px-0 sm:px-2 lg:px-4"
            >
              <button
                type="button"
                onClick={closeSearch}
                className="cursor-pointer flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white transition hover:bg-white/10"
                aria-label="Close search"
              >
                <ArrowLeft size={22} />
              </button>

              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
                />

                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, shops..."
                  className="h-11 w-full rounded-lg bg-[#F8F4E9] pl-11 pr-10 text-sm text-[#022B3A] outline-none"
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#64748B] transition hover:bg-[#E5E7EB] hover:text-[#022B3A]"
                    aria-label="Clear search"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isSearching}
                className="cursor-pointer hidden h-11 rounded-lg bg-[#FF8C00] px-5 font-semibold text-white transition hover:bg-[#E67E00] disabled:cursor-not-allowed disabled:opacity-60 sm:block"
              >
                {isSearching ? "Searching..." : "Search"}
              </button>
            </form>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
              <div className="mx-auto w-full max-w-[1400px]">
                {/* EMPTY SEARCH */}

                {!searchQuery && (
                  <>
                    <h3 className="mb-2 text-xl font-bold text-[#022B3A]">
                      What are you looking for?
                    </h3>

                    <p className="mb-5 max-w-3xl text-sm leading-6 text-[#64748B]">
                      Search by product title, shop name, category,
                      location, city, state, pincode, address and more.
                    </p>

                    {/* SEARCHABLE FIELDS */}

                    <div className="mb-7">
                      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#64748B]">
                        You can search by
                      </h4>

                      <div className="flex flex-wrap gap-2">
                        {[
                          "Product title",
                          "Shop name",
                          "Category",
                          "Location",
                          "City",
                          "State",
                          "Pincode",
                          "Address",
                        ].map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-[#DDE4E2] bg-white px-3 py-1.5 text-xs font-medium text-[#022B3A]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-[#64748B]">
                      Popular Searches
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((item) => (
                        <button
                          type="button"
                          key={item}
                          onClick={() => handlePopularSearch(item)}
                          className="cursor-pointer rounded-full border border-[#DDE4E2] bg-white px-4 py-2.5 text-sm font-medium text-[#022B3A] transition hover:border-[#FF8C00] hover:text-[#FF8C00]"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/*  SEARCH WITH QUERY */}

                {searchQuery && (
                  <>
                    {/* SEARCH TITLE */}

                    <div className="mb-5">
                      <h3 className="text-xl font-bold text-[#022B3A]">
                        Search for "{searchQuery}"
                      </h3>

                      <p className="mt-1 max-w-4xl text-sm leading-6 text-[#64748B]">
                        Search products and shops by name,
                        category, location, city, state, pincode, address and
                        more.
                      </p>
                    </div>

                    {/* FILTERS */}

                    <div className="mb-6 w-full overflow-x-auto overscroll-x-contain pb-1">
                      <div className="flex w-max gap-2">
                        {searchFilters.map((filter) => {
                          const active = searchFilter === filter.id;

                          return (
                            <button
                              key={filter.id}
                              type="button"
                              onClick={() =>
                                handleSearchFilterChange(filter.id)
                              }
                              className={`cursor-pointer flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                                active
                                  ? "border-[#FF8C00] bg-[#FF8C00] text-white"
                                  : "border-[#DDE4E2] bg-white text-[#022B3A] hover:border-[#FF8C00] hover:text-[#FF8C00]"
                              }`}
                            >
                              {filter.icon}
                              {filter.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* SEARCH BUTTON FOR SMALL SCREENS */}

                    <button
                      type="button"
                      onClick={() => handleSearch()}
                      disabled={isSearching}
                      className="mb-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#FF8C00] px-5 font-semibold text-white transition hover:bg-[#E67E00] disabled:cursor-not-allowed disabled:opacity-60 sm:hidden"
                    >
                      <Search size={18} />

                      {isSearching ? "Searching..." : "Search"}
                    </button>

                    {/* ERROR */}

                    {searchError && (
                      <div className="mb-5 w-full rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                        {searchError}
                      </div>
                    )}

                    {/* LOADING */}

                    {isSearching && (
                      <div className="w-full rounded-xl border border-[#DDE4E2] bg-white p-6 text-center">
                        <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-[#DDE4E2] border-t-[#FF8C00]" />

                        <p className="text-sm font-medium text-[#022B3A]">
                          Searching ShopLocal...
                        </p>

                        <p className="mt-1 text-xs text-[#64748B]">
                          Checking products and shops.
                        </p>
                      </div>
                    )}

                    {/*  RESULTS */}

                    {!isSearching && hasSearched && (
                      <>
                        {/* PRODUCTS */}

                        {(searchFilter === "all" ||
                          searchFilter === "products") &&
                          searchResults.products.length > 0 && (
                            <SearchResultSection
                              title="Products"
                              icon={<Package size={18} />}
                              count={searchResults.products.length}
                            >
                              {searchResults.products.map((product) => (
                                <SearchProductCard
                                  key={getId(product)}
                                  product={product}
                                  onClick={() =>
                                    handleProductResultClick(product)
                                  }
                                  getImage={getImage}
                                  getProductName={getProductName}
                                  getLocationText={getLocationText}
                                  getShopIdFromProduct={getShopIdFromProduct}
                                />
                              ))}
                            </SearchResultSection>
                          )}

                        {/* SHOPS */}

                        {(searchFilter === "all" || searchFilter === "shops") &&
                          searchResults.shops.length > 0 && (
                            <SearchResultSection
                              title="Shops"
                              icon={<Store size={18} />}
                              count={searchResults.shops.length}
                            >
                              {searchResults.shops.map((shop) => (
                                <SearchShopCard
                                  key={getId(shop)}
                                  shop={shop}
                                  onClick={() => handleShopResultClick(shop)}
                                  getImage={getImage}
                                  getShopName={getShopName}
                                  getLocationText={getLocationText}
                                />
                              ))}
                            </SearchResultSection>
                          )}

                        {/* NO RESULTS */}

                        {searchResults.products.length === 0 &&
                          searchResults.shops.length === 0 && (
                            <div className="w-full rounded-xl border border-[#DDE4E2] bg-white p-8 text-center">
                              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF0D9] text-[#FF8C00]">
                                <Search size={22} />
                              </div>

                              <h4 className="font-semibold text-[#022B3A]">
                                No results found
                              </h4>

                              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">
                                We couldn't find anything matching "
                                {searchQuery}". Try a product name, shop name,
                                category, city, location or
                                pincode.
                              </p>
                            </div>
                          )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE / TABLET ACCOUNT */}

      {isAccountOpen && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm lg:hidden">
          <div
            className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-[#F8F4E9] p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#022B3A]">Account</h2>

              <button
                type="button"
                onClick={() => setIsAccountOpen(false)}
                className="cursor-pointer flex h-9 w-9 items-center justify-center rounded-lg"
                aria-label="Close account"
              >
                <X size={21} />
              </button>
            </div>

            {user ? (
              <>
                <div className="mb-5 flex items-center gap-3 rounded-xl bg-white p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF0D9] text-[#FF8C00]">
                    <UserCircle size={27} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#022B3A]">
                      {user?.name || user?.fullName || user?.email || "User"}
                    </p>

                    {user?.email && (
                      <p className="truncate text-sm text-[#64748B]">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  My Account
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setIsAccountOpen(false);
                    navigate("/profile");
                  }}
                  className="cursor-pointer mb-2 flex w-full items-center gap-3 rounded-lg bg-white p-4 text-left font-medium transition hover:bg-[#FFF0D9]"
                >
                  <UserCircle size={20} />
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAccountOpen(false);
                    navigate("/orders");
                  }}
                  className="mb-2 flex w-full cursor-pointer items-center gap-3 rounded-lg bg-white p-4 text-left font-medium transition hover:bg-[#FFF0D9]"
                >
                  <ClipboardList size={20} />
                  <span>Orders</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAccountOpen(false);
                    navigate("/seller/register");
                  }}
                  className="mb-2 flex w-full cursor-pointer items-center gap-3 rounded-lg bg-white p-4 text-left font-medium transition hover:bg-[#FFF0D9]"
                >
                  <Store size={20} />
                  <span>Seller Signup</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg bg-white p-4 text-left font-medium text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Customer
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setIsAccountOpen(false);
                    navigate("/login");
                  }}
                  className="mb-2 flex w-full cursor-pointer items-center gap-3 rounded-lg bg-white p-4 text-left transition hover:bg-[#FFF0D9]"
                >
                  <User size={20} />
                  <span className="font-medium">Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAccountOpen(false);
                    navigate("/signup");
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg bg-white p-4 text-left transition hover:bg-[#FFF0D9]"
                >
                  <User size={20} />
                  <span className="font-medium">Create Account</span>
                </button>

                <div className="my-5 h-px bg-[#DDE4E2]" />

                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Shop Owner
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setIsAccountOpen(false);
                    navigate("/seller/login");
                  }}
                  className="mb-2 flex w-full cursor-pointer items-center gap-3 rounded-lg bg-white p-4 text-left transition hover:bg-[#FFF0D9]"
                >
                  <Store size={20} />
                  <span className="font-medium">Seller Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAccountOpen(false);
                    navigate("/seller/register");
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg bg-white p-4 text-left transition hover:bg-[#FFF0D9]"
                >
                  <Store size={20} />
                  <span className="font-medium">Register Your Shop</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

//---->>>> SEARCH RESULT SECTION

function SearchResultSection({ title, icon, count, children }) {
  return (
    <section className="mb-7 w-full">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#022B3A]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFF0D9] text-[#FF8C00]">
            {icon}
          </div>

          <h4 className="font-bold">{title}</h4>

          <span className="rounded-full bg-[#E8EFED] px-2 py-0.5 text-xs font-semibold text-[#64748B]">
            {count}
          </span>
        </div>
      </div>

      <div className="w-full space-y-2">{children}</div>
    </section>
  );
}

//--->>> PRODUCT RESULT CARD

function SearchProductCard({
  product,
  onClick,
  getImage,
  getProductName,
  getLocationText,
  getShopIdFromProduct,
}) {
  const image = getImage(product, "product");

  const productName = getProductName(product);

  const shopName =
    product?.shop?.name || product?.shop?.shopName || product?.shopName || "";

  const category = product?.category || product?.categoryName || "";

  const locationText =
    getLocationText(product) || getLocationText(product?.shop);

  const shopId = getShopIdFromProduct(product);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!shopId}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[#DDE4E2] bg-white p-3 text-left transition hover:border-[#FF8C00] hover:bg-[#FFF0D9] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F1F5F4]">
        {image ? (
          <img
            src={image}
            alt={productName}
            className="h-full w-full object-cover"
          />
        ) : (
          <Package size={23} className="text-[#64748B]" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-semibold text-[#022B3A]">{productName}</p>

          {product?.price !== undefined && product?.price !== null && (
            <span className="shrink-0 text-sm font-bold text-[#FF8C00]">
              ₹{product.price}
            </span>
          )}
        </div>

        {shopName && (
          <p className="mt-0.5 truncate text-sm text-[#64748B]">{shopName}</p>
        )}

        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-[#64748B]">
          {category && <span>{category}</span>}

          {category && locationText && <span>•</span>}

          {locationText && <span className="truncate">{locationText}</span>}
        </div>
      </div>

      <Search
        size={17}
        className="shrink-0 text-[#64748B] transition group-hover:text-[#FF8C00]"
      />
    </button>
  );
}

//--->>> SHOP RESULT CARD

function SearchShopCard({
  shop,
  onClick,
  getImage,
  getShopName,
  getLocationText,
}) {
  const image = getImage(shop, "shop");

  const shopName = getShopName(shop);

  const category = shop?.category || shop?.categoryName || "";

  const locationText = getLocationText(shop);

  const rating = shop?.rating ?? shop?.ratings?.average ?? null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[#DDE4E2] bg-white p-3 text-left transition hover:border-[#FF8C00] hover:bg-[#FFF0D9]"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F1F5F4]">
        {image ? (
          <img
            src={image}
            alt={shopName}
            className="h-full w-full object-cover"
          />
        ) : (
          <Store size={23} className="text-[#64748B]" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-[#022B3A]">{shopName}</p>

          {(shop?.verified ||
            shop?.isVerified ||
            shop?.verificationStatus === "verified") && (
            <span className="shrink-0 rounded-full bg-[#E8EFED] px-2 py-0.5 text-[10px] font-semibold text-[#022B3A]">
              Verified
            </span>
          )}
        </div>

        {category && (
          <p className="mt-0.5 truncate text-sm text-[#64748B]">{category}</p>
        )}

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#64748B]">
          {rating !== null && <span>★ {rating}</span>}

          {rating !== null && locationText && <span>•</span>}

          {locationText && (
            <span className="flex min-w-0 items-center gap-1 truncate">
              <MapPin size={12} />
              {locationText}
            </span>
          )}
        </div>
      </div>

      <Search
        size={17}
        className="shrink-0 text-[#64748B] transition group-hover:text-[#FF8C00]"
      />
    </button>
  );
}



//---->>>> ACCOUNT DROPDOWN

function AccountDropdown({ user, onNavigate, onLogout }) {
  return (
    <div className="absolute right-0 top-[52px] w-64 overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8F4E9] text-[#022B3A] shadow-xl">
      {user ? (
        <>
          <div className="border-b border-[#DDE4E2] px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0D9] text-[#FF8C00]">
                <UserCircle size={24} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {user?.name || user?.fullName || user?.email || "User"}
                </p>

                {user?.email && (
                  <p className="truncate text-xs text-[#64748B]">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("/profile")}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium transition hover:bg-[#FFF0D9]"
          >
            <UserCircle size={18} />
            My Profile
          </button>

          <button
            type="button"
            onClick={() => onNavigate("/orders")}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium transition hover:bg-[#FFF0D9]"
          >
            <ClipboardList size={18} />
            Orders
          </button>

          <button
            type="button"
            onClick={() => onNavigate("/seller/register")}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium transition hover:bg-[#FFF0D9]"
          >
            <Store size={18} />
            Seller Signup
          </button>

          <div className="border-t border-[#DDE4E2]" />

          <button
            type="button"
            onClick={onLogout}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={18} />
            Logout
          </button>
        </>
      ) : (
        <>
          <div className="border-b border-[#DDE4E2] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Customer
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("/login")}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium transition hover:bg-[#FFF0D9]"
          >
            <User size={18} />
            Sign In
          </button>

          <button
            type="button"
            onClick={() => onNavigate("/signup")}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium transition hover:bg-[#FFF0D9]"
          >
            <User size={18} />
            Create Account
          </button>

          <div className="border-t border-[#DDE4E2] px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Shop Owner
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("/seller/login")}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium transition hover:bg-[#FFF0D9]"
          >
            <Store size={18} />
            Seller Login
          </button>

          <button
            type="button"
            onClick={() => onNavigate("/seller/register")}
            className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-medium transition hover:bg-[#FFF0D9]"
          >
            <Store size={18} />
            Register Your Shop
          </button>
        </>
      )}
    </div>
  );
}

export default Navbar;
