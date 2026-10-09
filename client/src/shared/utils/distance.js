/**
 * DISTANCE UTILITIES
 *
 * Single source of truth for all distance calculations.
 *
 * Priority:
 *
 * 1. Frontend Haversine calculation when both user + shop
 *    coordinates are available.
 * 2. Backend-provided distanceKm as fallback.
 * 3. null when distance cannot be determined.
 *
 * All distances are returned in kilometers.
 */

/**
 * VALIDATE COORDINATES
 */
export const isValidCoordinate = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);

  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * CALCULATE HAVERSINE DISTANCE
 *
 * Calculates straight-line distance between two coordinates.
 *
 * Returns:
 * - distance in kilometers
 * - null when coordinates are invalid
 */
export const calculateDistanceKm = (
  userLatitude,
  userLongitude,
  shopLatitude,
  shopLongitude,
) => {
  if (
    !isValidCoordinate(userLatitude, userLongitude) ||
    !isValidCoordinate(shopLatitude, shopLongitude)
  ) {
    return null;
  }

  const toRadians = (degrees) => (degrees * Math.PI) / 180;

  const earthRadiusKm = 6371;

  const userLat = toRadians(Number(userLatitude));
  const userLng = toRadians(Number(userLongitude));

  const shopLat = toRadians(Number(shopLatitude));
  const shopLng = toRadians(Number(shopLongitude));

  const deltaLat = shopLat - userLat;
  const deltaLng = shopLng - userLng;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(userLat) * Math.cos(shopLat) * Math.sin(deltaLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = earthRadiusKm * c;

  return Number.isFinite(distance) ? distance : null;
};

/**
 * GET SHOP COORDINATES
 *
 * Supports:
 *
 * 1. shop.latitude / shop.longitude
 *
 * 2. GeoJSON:
 *    shop.location.coordinates.coordinates
 *
 * GeoJSON format:
 *
 * [longitude, latitude]
 */
export const getShopCoordinates = (shop) => {
  if (!shop) {
    return {
      latitude: null,
      longitude: null,
    };
  }

  if (isValidCoordinate(shop.latitude, shop.longitude)) {
    return {
      latitude: Number(shop.latitude),
      longitude: Number(shop.longitude),
    };
  }

  const coordinates = shop?.location?.coordinates?.coordinates;

  if (Array.isArray(coordinates) && coordinates.length >= 2) {
    // GeoJSON order:
    // [longitude, latitude]

    const longitude = Number(coordinates[0]);
    const latitude = Number(coordinates[1]);

    if (isValidCoordinate(latitude, longitude)) {
      return {
        latitude,
        longitude,
      };
    }
  }

  return {
    latitude: null,
    longitude: null,
  };
};

/**
 * GET DISTANCE FOR A SHOP
 * This is the main function that components should use.
 *
 * Priority:
 *
 * 1. Calculate from actual coordinates.
 * 2. Use backend distanceKm.
 * 3. Return null.
 *
 * This ensures the same distance is used throughout the app
 * whenever coordinates are available.
 */
export const getDistanceKm = (shop, userLocation) => {
  if (!shop) {
    return null;
  }

  const userLatitude = userLocation?.latitude;
  const userLongitude = userLocation?.longitude;

  const { latitude: shopLatitude, longitude: shopLongitude } =
    getShopCoordinates(shop);

  const calculatedDistance = calculateDistanceKm(
    userLatitude,
    userLongitude,
    shopLatitude,
    shopLongitude,
  );

  if (Number.isFinite(calculatedDistance)) {
    return calculatedDistance;
  }

  const backendDistance = Number(shop?.distanceKm);

  if (Number.isFinite(backendDistance) && backendDistance >= 0) {
    return backendDistance;
  }

  return null;
};

/*
 * FORMAT DISTANCE
 *
 * Examples:
 *
 * 0       -> "0.0 km away"
 * 0.456   -> "0.5 km away"
 * 2.34    -> "2.3 km away"
 * 12.78   -> "12.8 km away"
 *
 * Returns:
 *
 * "Distance unavailable"
 *
 * when distance cannot be calculated.
 */
export const formatDistance = (distanceKm) => {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) {
    return "Distance unavailable";
  }

  return `${distanceKm.toFixed(1)} km away`;
};
