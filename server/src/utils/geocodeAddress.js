const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

/**
 * Geocode shop address using OpenStreetMap Nominatim.
 * Only the `address` field is sent to Nominatim.
 *
 * Example:
 *
 * address = "Nagpur"
 *
 * Request:
 *
 * https://nominatim.openstreetmap.org/search?q=Nagpur&format=geojson
 *
 * GeoJSON response:
 *
 * {
 *   "features": [
 *     {
 *       "geometry": {
 *         "type": "Point",
 *         "coordinates": [
 *           79.0820556,
 *           21.1498134
 *         ]
 *       }
 *     }
 *   ]
 * }
 *
 * GeoJSON coordinates are:
 *
 * [longitude, latitude]
 *
 * Returns:
 *
 * {
 *   latitude,
 *   longitude
 * }
 *
 * Returns null when location cannot be found.
 */

//--->>> GEOCODE ADDRESS

const geocodeAddress = async ({ address }) => {
  //-->> CLEAN ADDRESS

  const cleanAddress = String(address ?? "").trim();

  //-->>> VALIDATE ADDRESS

  if (!cleanAddress) {
    console.error("Geocoding failed: address is empty.");
    return null;
  }

  //-->>> CREATE NOMINATIM URL

  const url = new URL(NOMINATIM_URL);

  url.searchParams.set("q", cleanAddress);

  url.searchParams.set("format", "geojson");

  url.searchParams.set("limit", "1");

  //-->>> Search only in India
  url.searchParams.set("countrycodes", "in");

  //--->>> REQUEST NOMINATIM

  try {
    const response = await fetch(url.toString(), {
      method: "GET",

      headers: {
        Accept: "application/geo+json, application/json",

        "User-Agent": "ListingApp/1.0 (alpha@apnacollege.in)",
      },
    });

    //--->>> HTTP ERROR

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Nominatim HTTP error:",
        response.status,
        response.statusText,
      );

      console.error("Nominatim response:", errorText);

      return null;
    }

    //--->>> PARSE RESPONSE

    const data = await response.json();

    //-->> CHECK GEOJSON

    if (!data || !Array.isArray(data.features) || data.features.length === 0) {
      console.error("No geocoding results found for:", cleanAddress);

      return null;
    }

    //--->>> GET FIRST RESULT
    // ========================================================

    const feature = data.features[0];

    //-->>> CHECK GEOMETRY

    if (
      !feature.geometry ||
      feature.geometry.type !== "Point" ||
      !Array.isArray(feature.geometry.coordinates) ||
      feature.geometry.coordinates.length < 2
    ) {
      console.error("Invalid Nominatim geometry:", feature.geometry);

      return null;
    }

    //--->>> GEOJSON COORDINATES
    // GeoJSON:
    // [longitude, latitude]

    const longitude = Number(feature.geometry.coordinates[0]);

    const latitude = Number(feature.geometry.coordinates[1]);

    //--->>> VALIDATE COORDINATES

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      console.error("Invalid coordinates returned by Nominatim:", {
        latitude,
        longitude,
      });

      return null;
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      console.error("Coordinates are outside valid range:", {
        latitude,
        longitude,
      });

      return null;
    }

    return {
      latitude,
      longitude,
    };
  } catch (error) {
    console.error("Nominatim request failed:", error);

    return null;
  }
};

export default geocodeAddress;
