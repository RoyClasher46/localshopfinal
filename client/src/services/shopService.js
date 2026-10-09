import api from "./api";

/**
 * NUMBER HELPERS
 */

const toNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

/**
 * IMAGE URL
 */

const getImageUrl = (image) => {
  if (!image) {
    return "";
  }

  if (typeof image === "string") {
    return image;
  }

  if (typeof image === "object") {
    return (
      image.url ||
      image.src ||
      image.image ||
      image.path ||
      image.secure_url ||
      ""
    );
  }

  return "";
};

/**
 * GALLERY
 */

const normalizeGallery = (gallery) => {
  if (!Array.isArray(gallery)) {
    return [];
  }

  return gallery.map(getImageUrl).filter(Boolean);
};

/**
 * OPENING HOURS TEXT
 */

const formatOpeningHours = (openingHours) => {
  if (!openingHours || typeof openingHours !== "object") {
    return "Opening hours not specified";
  }

  const entries = Object.entries(openingHours);

  if (!entries.length) {
    return "Opening hours not specified";
  }

  const formatted = entries
    .map(([day, value]) => {
      if (!value) {
        return null;
      }

      if (value.closed === true) {
        return `${day.slice(0, 3)} Closed`;
      }

      if (value.open && value.close) {
        return `${day.slice(0, 3)} ${value.open} - ${value.close}`;
      }

      if (typeof value === "string") {
        return `${day.slice(0, 3)} ${value}`;
      }

      return null;
    })
    .filter(Boolean);

  return formatted.length
    ? formatted.join(", ")
    : "Opening hours not specified";
};

/**
 * CALCULATE OPEN STATUS
 */

const calculateIsOpen = (openingHours) => {
  if (!openingHours || typeof openingHours !== "object") {
    return null;
  }

  const now = new Date();

  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const currentDay = dayNames[now.getDay()];

  const dayData =
    openingHours[currentDay] ||
    openingHours[currentDay.charAt(0).toUpperCase() + currentDay.slice(1)] ||
    openingHours[currentDay.slice(0, 3)] ||
    openingHours[currentDay.charAt(0).toUpperCase() + currentDay.slice(1, 3)];

  if (!dayData) {
    return null;
  }

  if (dayData.closed === true) {
    return false;
  }

  if (!dayData.open || !dayData.close) {
    return null;
  }

  const parseTime = (time) => {
    if (typeof time !== "string") {
      return null;
    }

    const normalized = time.trim().toUpperCase();

    /**
     * 24-hour
     *
     * 09:00
     * 18:30
     */
    const twentyFourHourMatch = normalized.match(/^(\d{1,2}):(\d{2})$/);

    if (twentyFourHourMatch) {
      const hours = Number(twentyFourHourMatch[1]);
      const minutes = Number(twentyFourHourMatch[2]);

      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return null;
      }

      return hours * 60 + minutes;
    }

    /**
     * 12-hour
     *
     * 9 AM
     * 9:30 PM
     */
    const twelveHourMatch = normalized.match(
      /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/,
    );

    if (!twelveHourMatch) {
      return null;
    }

    let hours = Number(twelveHourMatch[1]);
    const minutes = Number(twelveHourMatch[2] || 0);
    const period = twelveHourMatch[3];

    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
      return null;
    }

    if (period === "AM" && hours === 12) {
      hours = 0;
    }

    if (period === "PM" && hours !== 12) {
      hours += 12;
    }

    return hours * 60 + minutes;
  };

  const openMinutes = parseTime(dayData.open);
  const closeMinutes = parseTime(dayData.close);

  if (openMinutes === null || closeMinutes === null) {
    return null;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (closeMinutes > openMinutes) {
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  }

  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }

  return null;
};

/**
 * SHOP TRANSFORMER
 */

export const transformShop = (shop) => {
  if (!shop) {
    return null;
  }

  const location =
    shop.location && typeof shop.location === "object" ? shop.location : {};

  let coordinates = [];

  if (Array.isArray(location?.coordinates?.coordinates)) {
    coordinates = location.coordinates.coordinates;
  } else if (Array.isArray(location?.coordinates)) {
    coordinates = location.coordinates;
  } else if (Array.isArray(shop?.coordinates)) {
    coordinates = shop.coordinates;
  }

  const latitude =
    toNumber(shop.latitude) ??
    toNumber(shop.lat) ??
    toNumber(location.latitude) ??
    toNumber(location.lat) ??
    toNumber(coordinates[1]);

  const longitude =
    toNumber(shop.longitude) ??
    toNumber(shop.lng) ??
    toNumber(shop.lon) ??
    toNumber(location.longitude) ??
    toNumber(location.lng) ??
    toNumber(coordinates[0]);

  const openingHours =
    shop.openingHours && typeof shop.openingHours === "object"
      ? shop.openingHours
      : {};

  const gallery = normalizeGallery(shop.gallery);

  const primaryImage =
    getImageUrl(shop.image) || getImageUrl(shop.coverImage) || gallery[0] || "";

  const logo =
    getImageUrl(shop.logo) || getImageUrl(shop.logoUrl) || primaryImage;

  const rating =
    toNumber(shop.ratingAverage ?? shop.averageRating ?? shop.rating) ?? 0;

  const reviews =
    toNumber(
      shop.totalReviews ??
        shop.reviewCount ??
        shop.reviewsCount ??
        shop.reviews,
    ) ?? 0;

  const distanceKm = toNumber(
    shop.distanceKm ?? shop.distanceInKm ?? shop.distance_km ?? shop.distance,
  );

  const verified = shop.isVerified ?? shop.verified ?? false;

  const registered = shop.isRegistered ?? shop.registered ?? true;

  const delivery = shop.deliveryAvailable ?? shop.delivery ?? false;

  const takeAway =
    shop.takeawayAvailable ?? shop.takeAway ?? shop.takeaway ?? false;

  const category =
    shop.category?.name || shop.categoryName || shop.category || "";

  const address = location.address || shop.address || "";

  const city = location.city || shop.city || "";

  const state = location.state || shop.state || "";

  const pincode =
    location.pincode ||
    location.postalCode ||
    shop.pincode ||
    shop.postalCode ||
    "";

  const owner =
    typeof shop.owner === "object"
      ? shop.owner?.name || shop.owner?.fullName || shop.owner?.username || ""
      : shop.owner || "";

  const email = shop.email || shop.contactEmail || "";

  const phone = shop.phone || shop.contactPhone || shop.mobile || "";

  const about = shop.about || shop.description || "";

  const description = shop.description || shop.about || "";

  const deliveryRadius = toNumber(
    shop.deliveryRadius ?? shop.deliveryRadiusKm ?? shop.deliveryRange,
  );

  const openingHoursText =
    shop.hours || shop.openingHoursText || formatOpeningHours(openingHours);

  const isOpen =
    typeof shop.isOpen === "boolean"
      ? shop.isOpen
      : calculateIsOpen(openingHours);

  const facilities = Array.isArray(shop.facilities)
    ? shop.facilities
        .map((item) =>
          typeof item === "string" ? item : item?.name || item?.title || "",
        )
        .filter(Boolean)
    : [];

  const policies = Array.isArray(shop.policies)
    ? shop.policies
        .map((item) =>
          typeof item === "string"
            ? item
            : item?.name || item?.title || item?.description || "",
        )
        .filter(Boolean)
    : [];

  return {
    ...shop,

    id: shop.id || shop._id,

    /**
     * Basic
     */
    name: shop.name || "",
    owner,
    category,

    description,
    about,

    phone,
    email,

    /**
     * Location
     */
    location,
    address,
    city,
    state,
    pincode,

    latitude,
    longitude,

    /**
     * Images
     */
    image: primaryImage,
    logo,
    gallery,

    /**
     * Ratings
     */
    rating,
    ratingAverage: rating,
    reviews,
    totalReviews: reviews,

    /**
     * Status
     */
    verified,
    isVerified: verified,

    registered,
    isRegistered: registered,

    isOpen,

    /**
     * Distance
     */
    distanceKm,
    distance: distanceKm,

    /**
     * Services
     */
    delivery,
    deliveryAvailable: delivery,

    takeaway: takeAway,
    takeAway,

    takeawayAvailable: takeAway,

    deliveryRadius,

    /**
     * Hours
     */
    openingHours,
    openingHoursText,
    hours: openingHoursText,

    /**
     * Extra
     */
    facilities,
    policies,

    memberSince: shop.memberSince || shop.createdAt || "",
  };
};

/**
 * GET ALL SHOPS
 */

export const getAllShops = async (params = {}) => {
  const response = await api.get("/shops", {
    params,
  });

  return {
    ...response.data,

    shops: (response.data?.shops || []).map(transformShop).filter(Boolean),
  };
};

/**
 * GET SHOP BY ID
 */

export const getShopById = async (shopId) => {
  const response = await api.get(`/shops/${shopId}`);

  return {
    ...response.data,

    shop: transformShop(response.data?.shop),
  };
};

export default {
  getAllShops,
  getShopById,
};
