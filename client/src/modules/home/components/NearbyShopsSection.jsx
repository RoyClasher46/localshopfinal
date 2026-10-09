import { useEffect, useState } from "react";
import { MapPin, Star, Clock3, BadgeCheck, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

import { getAllShops } from "../../../services/shopService";
import { getDistanceKm, formatDistance } from "../../../shared/utils/distance";
import { useLocation } from "../../../shared/context/LocationContext";

function NearbyShopsSection() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //-->> USER LOCATION

  const { location } = useLocation();

  const userLocation = {
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
  };

  //--->>> FETCH SHOPS FROM BACKEND

  useEffect(() => {
    let isMounted = true;

    const fetchNearbyShops = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAllShops();

        if (!isMounted) {
          return;
        }

        const backendShops = Array.isArray(response?.shops)
          ? response.shops
          : [];

        setShops(backendShops.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch nearby shops:", err);

        if (!isMounted) {
          return;
        }

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load nearby shops.",
        );

        setShops([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNearbyShops();

    return () => {
      isMounted = false;
    };
  }, []);

  const getShopImage = (shop) => {
    return shop?.image || shop?.logo || "";
  };

  //--->> TIME FORMATTER

  const formatTime = (time) => {
    if (!time || typeof time !== "string") {
      return "";
    }

    const normalized = time.trim().toUpperCase();

    if (/(AM|PM)$/i.test(normalized)) {
      return normalized;
    }

    const match = normalized.match(/^(\d{1,2}):(\d{2})$/);

    if (!match) {
      return time;
    }

    let hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (
      !Number.isFinite(hours) ||
      !Number.isFinite(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return time;
    }

    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;

    if (hours === 0) {
      hours = 12;
    }

    return `${hours}:${String(minutes).padStart(2, "0")} ${period}`;
  };

  //-->> GET TODAY'S OPENING HOURS

  const getTodayHours = (openingHours) => {
    if (!openingHours || typeof openingHours !== "object") {
      return null;
    }

    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    const now = new Date();
    const currentDay = dayNames[now.getDay()];

    const possibleKeys = [
      currentDay,
      currentDay.charAt(0).toUpperCase() + currentDay.slice(1),
      currentDay.slice(0, 3),
      currentDay.charAt(0).toUpperCase() + currentDay.slice(0, 3),
    ];

    for (const key of possibleKeys) {
      if (openingHours[key]) {
        return openingHours[key];
      }
    }

    return null;
  };

  //-->>> SHOP STATUS

  const getStatusInfo = (shop) => {
    const isOpen = shop?.isOpen;

    const todayHours = getTodayHours(shop?.openingHours);

    if (isOpen === true) {
      return {
        status: "Open",
        statusColor: "text-green-600",
        dotColor: "bg-green-500",
        secondaryText: todayHours?.close
          ? `Closes at ${formatTime(todayHours.close)}`
          : "Open",
      };
    }

    if (isOpen === false) {
      return {
        status: "Closed",
        statusColor: "text-red-500",
        dotColor: "bg-red-500",
        secondaryText: todayHours?.open
          ? `Opens at ${formatTime(todayHours.open)}`
          : "Closed",
      };
    }

    return {
      status: "Closed",
      statusColor: "text-red-500",
      dotColor: "bg-red-500",
      secondaryText: todayHours?.open
        ? `Opens at ${formatTime(todayHours.open)}`
        : "Opening hours unavailable",
    };
  };

  if (loading) {
    return (
      <section className="bg-[#F8F4E9]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-10">
          {/* SECTION HEADER */}

          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#022B3A] sm:text-xl">
                Nearby Shops
              </h2>

              <p className="mt-1 text-xs text-[#022B3A]/55 sm:text-sm">
                Discover trusted local shops near your location
              </p>
            </div>

            <Link
              to="/shops"
              className="
                group
                flex
                items-center
                gap-1
                text-xs
                font-semibold
                text-[#FF8C00]
                transition-colors
                hover:text-[#e67d00]
                sm:text-sm
              "
            >
              View All
              <ChevronRight
                size={16}
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>

          {/* SKELETON */}

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="
                  overflow-hidden
                  rounded-xl
                  border
                  border-[#022B3A]/8
                  bg-white
                  shadow-sm
                "
              >
                <div className="h-40 animate-pulse bg-gray-200 sm:h-44" />

                <div className="space-y-3 p-3.5">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />

                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />

                  <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />

                  <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  //--->> ERROR STATE

  if (error) {
    return (
      <section className="bg-[#F8F4E9]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#022B3A] sm:text-xl">
                Nearby Shops
              </h2>

              <p className="mt-1 text-xs text-[#022B3A]/55 sm:text-sm">
                Discover trusted local shops near your location
              </p>
            </div>

            <Link
              to="/shops"
              className="
                group
                flex
                items-center
                gap-1
                text-xs
                font-semibold
                text-[#FF8C00]
                transition-colors
                hover:text-[#e67d00]
                sm:text-sm
              "
            >
              View All
              <ChevronRight
                size={16}
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>

          <div className="rounded-xl border border-red-200 bg-white p-6 text-center">
            <p className="text-sm font-medium text-red-500">
              Unable to load nearby shops.
            </p>

            <p className="mt-1 text-xs text-[#022B3A]/50">
              Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  //-->> MAIN UI

  return (
    <section className="bg-[#F8F4E9]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-10">
        {/*  SECTION HEADER */}

        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#022B3A] sm:text-xl">
              Nearby Shops
            </h2>

            <p className="mt-1 text-xs text-[#022B3A]/55 sm:text-sm">
              Discover trusted local shops near your location
            </p>
          </div>

          <Link
            to="/shops"
            className="
              group
              flex
              items-center
              gap-1
              text-xs
              font-semibold
              text-[#FF8C00]
              transition-colors
              hover:text-[#e67d00]
              sm:text-sm
            "
          >
            View All
            <ChevronRight
              size={16}
              className="
                transition-transform
                duration-200
                group-hover:translate-x-1
              "
            />
          </Link>
        </div>

        {/*  EMPTY STATE*/}

        {shops.length === 0 ? (
          <div className="rounded-xl border border-[#022B3A]/8 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold text-[#022B3A]">
              No shops available nearby
            </p>

            <p className="mt-1 text-xs text-[#022B3A]/50">
              Check back later for local shops.
            </p>
          </div>
        ) : (
          /* SHOP GRID */

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {shops.map((shop) => {
              //--->>> STATUS

              const statusInfo = getStatusInfo(shop);

              //--->>> IMAGE

              const image = getShopImage(shop);

              //-->>> DISTANCE

              const distanceKm = getDistanceKm(shop, userLocation);

              const distanceText = formatDistance(distanceKm);

              return (
                <Link
                  key={shop.id}
                  to={`/shops/${shop.id}`}
                  className="
                    group
                    overflow-hidden
                    rounded-xl
                    border
                    border-[#022B3A]/8
                    bg-white
                    shadow-sm
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-lg
                  "
                >
                  {/* SHOP IMAGE */}

                  <div className="relative h-40 overflow-hidden bg-[#EDE8D9] sm:h-44">
                    {image ? (
                      <img
                        src={image}
                        alt={shop.name || "Shop"}
                        loading="lazy"
                        className="
                          h-full
                          w-full
                          object-cover
                          transition-transform
                          duration-500
                          group-hover:scale-105
                        "
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <MapPin size={32} className="text-[#022B3A]/20" />
                      </div>
                    )}

                    {/* VERIFIED BADGE */}

                    {shop.verified && (
                      <div
                        className="
                          absolute
                          left-3
                          top-3
                          flex
                          items-center
                          gap-1
                          rounded-full
                          bg-white/95
                          px-2
                          py-1
                          text-[10px]
                          font-semibold
                          text-[#022B3A]
                          shadow-sm
                          backdrop-blur-sm
                        "
                      >
                        <BadgeCheck size={13} className="text-[#FF8C00]" />
                        Verified
                      </div>
                    )}
                  </div>

                  {/* SHOP INFORMATION */}

                  <div className="p-3.5">
                    {/* Shop Name */}

                    <h3
                      className="
                        truncate
                        text-sm
                        font-bold
                        text-[#022B3A]
                        sm:text-base
                      "
                    >
                      {shop.name || "Unnamed Shop"}
                    </h3>

                    {/* Category */}

                    <p className="mt-0.5 truncate text-xs text-[#022B3A]/55">
                      {shop.category || "Local Shop"}
                    </p>

                    {/* Rating */}

                    <div className="mt-2.5 flex items-center gap-1.5">
                      <div className="flex items-center gap-1">
                        <Star
                          size={14}
                          fill="#FF8C00"
                          className="text-[#FF8C00]"
                        />

                        <span className="text-xs font-semibold text-[#022B3A]">
                          {Number(shop.rating || 0).toFixed(1)}
                        </span>
                      </div>

                      <span className="text-[11px] text-[#022B3A]/45">
                        ({Number(shop.reviews || 0)})
                      </span>
                    </div>

                    {/*  DISTANCE + STATUS */}

                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      {/* Distance */}

                      <div className="flex items-center gap-1 text-[11px] text-[#022B3A]/60">
                        <MapPin size={13} />

                        <span>{distanceText}</span>
                      </div>

                      {/* Open / Closed */}

                      <div className="flex items-center gap-1">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${statusInfo.dotColor}`}
                        />

                        <span
                          className={`text-[11px] font-medium ${statusInfo.statusColor}`}
                        >
                          {statusInfo.status}
                        </span>
                      </div>
                    </div>

                    {/* CLOSING / OPENING TIME */}

                    <div className="mt-2 flex items-center gap-1 border-t border-[#022B3A]/8 pt-2">
                      <Clock3 size={12} className="text-[#022B3A]/45" />

                      <span className="text-[10px] text-[#022B3A]/50">
                        {statusInfo.secondaryText}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default NearbyShopsSection;
