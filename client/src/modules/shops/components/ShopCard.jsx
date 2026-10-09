import {
  BadgeCheck,
  Bike,
  MapPin,
  ShoppingBag,
  Star,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getDistanceKm, formatDistance } from "../../../shared/utils/distance";

const formatTime12Hour = (time) => {
  if (!time) {
    return "";
  }

  const value = String(time).trim();

  const twelveHourMatch = value.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i,
  );

  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1]);

    const minutes = twelveHourMatch[2];

    const period = twelveHourMatch[4].toUpperCase();

    if (hours < 1 || hours > 12) {
      return value;
    }

    return `${hours}:${minutes} ${period}`;
  }

  const twentyFourHourMatch = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

  if (!twentyFourHourMatch) {
    return value;
  }

  let hours = Number(twentyFourHourMatch[1]);

  const minutes = twentyFourHourMatch[2];

  if (
    !Number.isInteger(hours) ||
    hours < 0 ||
    hours > 23 ||
    !Number.isInteger(Number(minutes)) ||
    Number(minutes) < 0 ||
    Number(minutes) > 59
  ) {
    return value;
  }

  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  return `${hours}:${minutes} ${period}`;
};

const getTodayOpeningHours = (openingHours) => {
  if (!openingHours || typeof openingHours !== "object") {
    return null;
  }

  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const today = days[new Date().getDay()];

  if (openingHours[today]) {
    return openingHours[today];
  }

  const matchingKey = Object.keys(openingHours).find(
    (key) => key.toLowerCase() === today,
  );

  if (!matchingKey) {
    return null;
  }

  return openingHours[matchingKey];
};

const timeToMinutes = (time) => {
  if (!time) {
    return null;
  }

  const value = String(time).trim();

  const twentyFourHourMatch = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

  if (twentyFourHourMatch) {
    const hours = Number(twentyFourHourMatch[1]);

    const minutes = Number(twentyFourHourMatch[2]);

    if (
      !Number.isInteger(hours) ||
      !Number.isInteger(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null;
    }

    return hours * 60 + minutes;
  }

  const twelveHourMatch = value.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i,
  );

  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1]);

    const minutes = Number(twelveHourMatch[2]);

    const period = twelveHourMatch[4].toUpperCase();

    if (
      !Number.isInteger(hours) ||
      !Number.isInteger(minutes) ||
      hours < 1 ||
      hours > 12 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null;
    }

    if (period === "AM") {
      if (hours === 12) {
        hours = 0;
      }
    } else if (period === "PM") {
      if (hours !== 12) {
        hours += 12;
      }
    }

    return hours * 60 + minutes;
  }

  return null;
};

const formatClosingTime = (closingTime) => {
  if (!closingTime) {
    return "";
  }

  return formatTime12Hour(closingTime);
};

const getShopStatus = (openingHours) => {
  const todayHours = getTodayOpeningHours(openingHours);

  if (!todayHours || typeof todayHours !== "object") {
    return {
      isOpen: null,
      closingTime: null,
      statusAvailable: false,
    };
  }

  if (todayHours.closed === true) {
    return {
      isOpen: false,
      closingTime: null,
      statusAvailable: true,
    };
  }

  const openingTime = todayHours.open;

  const closingTime = todayHours.close;

  if (!openingTime || !closingTime) {
    return {
      isOpen: null,
      closingTime: null,
      statusAvailable: false,
    };
  }

  const openingMinutes = timeToMinutes(openingTime);

  const closingMinutes = timeToMinutes(closingTime);

  if (openingMinutes === null || closingMinutes === null) {
    return {
      isOpen: null,
      closingTime: null,
      statusAvailable: false,
    };
  }

  const now = new Date();

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (closingMinutes < openingMinutes) {
    const isOpen =
      currentMinutes >= openingMinutes || currentMinutes < closingMinutes;

    return {
      isOpen,
      closingTime: formatClosingTime(closingTime),
      statusAvailable: true,
    };
  }

  const isOpen =
    currentMinutes >= openingMinutes && currentMinutes < closingMinutes;

  return {
    isOpen,
    closingTime: formatClosingTime(closingTime),
    statusAvailable: true,
  };
};

function ShopCard({ shop, userLocation }) {
  const shopName = shop?.name || "Unnamed Shop";

  const shopCategory = shop?.category || "Shop";

  const shopAddress =
    shop?.address ||
    shop?.location?.address ||
    shop?.city ||
    "Address unavailable";

  const shopRating = Number(
    shop?.ratingAverage ?? shop?.rating?.average ?? shop?.rating ?? 0,
  );

  const shopImage = shop?.image || "/placeholder-shop.jpg";

  const shopId = shop?.id || shop?._id;

  const isCommunityListed = shop?.isCommunityListed === true;

  const { isOpen, closingTime, statusAvailable } = getShopStatus(
    shop?.openingHours,
  );

  const deliveryAvailable = shop?.delivery ?? shop?.deliveryAvailable ?? false;

  const takeawayAvailable = shop?.takeaway ?? shop?.takeawayAvailable ?? false;

  const isVerified = shop?.verified ?? shop?.isVerified ?? false;

  const distanceKm = getDistanceKm(shop, userLocation);

  const distanceText = formatDistance(distanceKm);

  return (
    <Link
      to={`/shops/${shopId}`}
      className="group overflow-hidden rounded-2xl border border-[#022B3A]/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#FF8C00]/30 hover:shadow-xl"
    >
      {/*  IMAGE */}

      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          src={shopImage}
          alt={shopName}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = "/placeholder-shop.jpg";
          }}
        />

        {/* Verified */}

        {isVerified && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white px-3 py-1 shadow">
            <BadgeCheck size={14} className="text-[#FF9800]" />

            <span className="text-xs font-semibold">Verified</span>
          </div>
        )}

        {/* Registered / Community */}

        <div className="absolute bottom-3 left-3">
          {shop?.isCommunityListed === true ? (
            <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-medium text-white">
              Community Listed
            </span>
          ) : (
            <span className="rounded-full bg-[#022B3A] px-3 py-1 text-xs font-medium text-white">
              Registered Shop
            </span>
          )}
        </div>
      </div>

      {/*  CONTENT  */}

      <div className="p-5">
        {/* Name */}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-1 text-lg font-bold text-[#022B3A]">
              {shopName}
            </h3>

            <p className="mt-1 text-sm text-gray-500">{shopCategory}</p>
          </div>

          {/* Rating */}

          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-[#FFF4E5] px-2 py-1">
            <Star size={15} fill="#FF9800" className="text-[#FF9800]" />

            <span className="text-sm font-semibold">
              {Number.isFinite(shopRating) ? shopRating.toFixed(1) : "0.0"}
            </span>
          </div>
        </div>

        {/* Address */}

        <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
          <MapPin size={16} className="mt-0.5 shrink-0" />

          <span className="line-clamp-2">{shopAddress}</span>
        </div>

        {/* Distance */}

        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
          <Store size={16} className="shrink-0" />

          <span>{distanceText}</span>
        </div>

        {/* Status */}

        <div className="mt-5 flex items-center justify-between">
          {statusAvailable && isOpen === true ? (
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              Open
              {closingTime ? ` • Closes ${closingTime}` : ""}
            </span>
          ) : statusAvailable && isOpen === false ? (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
              Closed
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
              Hours unavailable
            </span>
          )}
        </div>

        {/* Services */}

        {!isCommunityListed && (
          <div className="mt-5 flex flex-wrap gap-2">
            {deliveryAvailable && (
              <div className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs">
                <Bike size={15} className="text-[#FF9800]" />
                Delivery
              </div>
            )}

            {takeawayAvailable && (
              <div className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs">
                <ShoppingBag size={15} className="text-[#FF9800]" />
                Take Away
              </div>
            )}
          </div>
        )}

        {/* Button */}

        <button
          type="button"
          className={`w-full cursor-pointer rounded-xl bg-[#022B3A] py-3 text-sm font-semibold text-white transition hover:bg-[#033d52] ${
            shop?.isCommunityListed === true ? "mt-[76px]" : "mt-6"
          }`}
        >
          View Shop
        </button>
      </div>
    </Link>
  );
}

export default ShopCard;
