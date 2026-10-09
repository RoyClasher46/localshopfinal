import ShopCard from "../components/ShopCard";
import { getDistanceKm } from "../../../shared/utils/distance";

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
    (key) => String(key).toLowerCase() === today,
  );

  return matchingKey ? openingHours[matchingKey] : null;
};

const timeToMinutes = (time) => {
  if (!time) {
    return null;
  }

  const value = String(time).trim();

  const twentyFourHourMatch = value.match(/^(\d{1,2}):(\d{2})$/);

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

  const twelveHourMatch = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1]);
    const minutes = Number(twelveHourMatch[2]);
    const period = twelveHourMatch[3].toUpperCase();

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
    } else {
      if (hours !== 12) {
        hours += 12;
      }
    }

    return hours * 60 + minutes;
  }

  return null;
};

const getShopStatus = (openingHours) => {
  const todayHours = getTodayOpeningHours(openingHours);

  // Opening hours unavailable
  if (!todayHours || typeof todayHours !== "object") {
    return {
      isOpen: null,
      statusAvailable: false,
    };
  }

  // Explicitly closed
  if (todayHours.closed === true) {
    return {
      isOpen: false,
      statusAvailable: true,
    };
  }

  const openingTime = todayHours.open;
  const closingTime = todayHours.close;

  // Missing values
  if (!openingTime || !closingTime) {
    return {
      isOpen: null,
      statusAvailable: false,
    };
  }

  const openingMinutes = timeToMinutes(openingTime);
  const closingMinutes = timeToMinutes(closingTime);

  // Invalid times
  if (openingMinutes === null || closingMinutes === null) {
    return {
      isOpen: null,
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
      statusAvailable: true,
    };
  }

  const isOpen =
    currentMinutes >= openingMinutes && currentMinutes < closingMinutes;

  return {
    isOpen,
    statusAvailable: true,
  };
};

function ShopsGrid({
  shops,
  search,
  category,
  sortBy,
  openOnly,
  verifiedOnly,
  maxDistance,
  minRating,
  userLocation,
}) {
  const filteredShops = [...(Array.isArray(shops) ? shops : [])]
    .filter((shop) => {
      const shopName = String(shop?.name || "").toLowerCase();

      const shopCategory = String(shop?.category || "").toLowerCase();

      const shopAddress = String(
        shop?.address ||
          shop?.location?.address ||
          shop?.location?.city ||
          shop?.city ||
          "",
      ).toLowerCase();

      const searchValue = String(search || "")
        .trim()
        .toLowerCase();

      const matchesSearch =
        !searchValue ||
        shopName.includes(searchValue) ||
        shopCategory.includes(searchValue) ||
        shopAddress.includes(searchValue);

      const selectedCategory = String(category || "All")
        .trim()
        .toLowerCase();

      const matchesCategory =
        selectedCategory === "all" || shopCategory === selectedCategory;

      const { isOpen, statusAvailable } = getShopStatus(shop?.openingHours);

      const matchesOpen = !openOnly || (statusAvailable && isOpen === true);

      const isVerified = shop?.isVerified ?? shop?.verified ?? false;

      const matchesVerified = !verifiedOnly || isVerified === true;

      const distanceKm = getDistanceKm(shop, userLocation);

      const hasDistance = Number.isFinite(distanceKm) && distanceKm >= 0;

      const selectedMaxDistance = Number(maxDistance);

      const matchesDistance =
        !hasDistance ||
        !Number.isFinite(selectedMaxDistance) ||
        distanceKm <= selectedMaxDistance;

      const shopRating = Number(
        shop?.ratingAverage ?? shop?.rating?.average ?? shop?.rating ?? 0,
      );

      const safeRating = Number.isFinite(shopRating) ? shopRating : 0;

      const selectedMinRating = Number(minRating);

      const matchesRating =
        !Number.isFinite(selectedMinRating) || safeRating >= selectedMinRating;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesOpen &&
        matchesVerified &&
        matchesDistance &&
        matchesRating
      );
    })
    .sort((a, b) => {
      const distanceA = getDistanceKm(a, userLocation);

      const distanceB = getDistanceKm(b, userLocation);

      const ratingA = Number(
        a?.ratingAverage ?? a?.rating?.average ?? a?.rating ?? 0,
      );

      const ratingB = Number(
        b?.ratingAverage ?? b?.rating?.average ?? b?.rating ?? 0,
      );

      const safeRatingA = Number.isFinite(ratingA) ? ratingA : 0;

      const safeRatingB = Number.isFinite(ratingB) ? ratingB : 0;

      const reviewsA = Number(
        a?.totalReviews ?? a?.rating?.totalReviews ?? a?.reviews ?? 0,
      );

      const reviewsB = Number(
        b?.totalReviews ?? b?.rating?.totalReviews ?? b?.reviews ?? 0,
      );

      const safeReviewsA = Number.isFinite(reviewsA) ? reviewsA : 0;

      const safeReviewsB = Number.isFinite(reviewsB) ? reviewsB : 0;

      const nameA = String(a?.name || "");

      const nameB = String(b?.name || "");

      switch (sortBy) {
        case "rating":
          return safeRatingB - safeRatingA;

        case "reviews":
          return safeReviewsB - safeReviewsA;

        case "name":
          return nameA.localeCompare(nameB);

        case "distance":
        default: {
          if (!Number.isFinite(distanceA) && !Number.isFinite(distanceB)) {
            return 0;
          }

          if (!Number.isFinite(distanceA)) {
            return 1;
          }

          if (!Number.isFinite(distanceB)) {
            return -1;
          }

          return distanceA - distanceB;
        }
      }
    });

  //--->>> EMPTY STATE

  if (filteredShops.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-5 py-20 text-center shadow-sm sm:px-8">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-100">
            <span className="text-5xl">🏪</span>
          </div>

          <h2 className="mt-6 text-2xl font-bold text-[#022B3A]">
            No Shops Found
          </h2>

          <p className="mx-auto mt-3 max-w-md text-gray-500">
            We couldn't find any shops matching your current filters. Try
            changing the search, category, distance or rating.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      {/* Heading */}

      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#022B3A]">Nearby Shops</h2>

          <p className="mt-1 text-gray-500">
            {filteredShops.length} shop
            {filteredShops.length > 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      {/* Shop Grid */}

      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredShops.map((shop) => (
          <ShopCard
            key={shop?.id || shop?._id}
            shop={shop}
            userLocation={userLocation}
          />
        ))}
      </div>
    </section>
  );
}

export default ShopsGrid;
