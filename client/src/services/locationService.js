const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

/**
 * REVERSE GEOCODING
 *
 * Converts:
 *
 * latitude + longitude
 *        ↓
 * readable address
 *
 * Example:
 *
 * 21.1059858, 79.0954031
 *        ↓
 * Nagpur, Maharashtra, India
 */
export async function reverseGeocode(latitude, longitude) {
  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    throw new Error("Invalid latitude or longitude.");
  }

  const url =
    `${NOMINATIM_BASE_URL}/reverse` +
    `?lat=${encodeURIComponent(latitude)}` +
    `&lon=${encodeURIComponent(longitude)}` +
    `&format=jsonv2` +
    `&addressdetails=1` +
    `&zoom=18`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Reverse geocoding failed with status ${response.status}`);
  }

  const data = await response.json();

  if (!data) {
    throw new Error("Reverse geocoding returned an empty response.");
  }

  return data;
}

/**
 * FORWARD GEOCODING
 *
 * Converts:
 *
 * "Nagpur Maharashtra"
 *        ↓
 * latitude + longitude
 *
 * Nominatim can return multiple results, therefore this
 * function returns an array.
 */
export async function forwardGeocode(query) {
  const value = query?.trim();

  if (!value) {
    throw new Error("Location search query cannot be empty.");
  }

  const url =
    `${NOMINATIM_BASE_URL}/search` +
    `?q=${encodeURIComponent(value)}` +
    `&format=jsonv2` +
    `&addressdetails=1` +
    `&limit=5` +
    `&countrycodes=in`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Forward geocoding failed with status ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Invalid response received from forward geocoding.");
  }

  return data;
}

/**
 * FORMAT REVERSE GEOCODED LOCATION
 * Creates a short readable label from Nominatim's address.
 *
 * Example:
 *
 * {
 *   city: "Nagpur",
 *   state: "Maharashtra",
 *   postcode: "440022"
 * }
 *
 * becomes:
 *
 * "Nagpur, Maharashtra, 440022"
 */
export function formatLocationLabel(address = {}) {
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.city_district ||
    address.county;

  const state = address.state;

  const postcode = address.postcode;

  const parts = [city, state, postcode].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(", ");
  }

  return "Current Location";
}

/**
 * FORMAT FULL LOCATION
 * Used when we want a more complete readable address.
 */
export function formatFullLocationLabel(data = {}) {
  if (data.display_name) {
    return data.display_name;
  }

  return formatLocationLabel(data.address);
}
