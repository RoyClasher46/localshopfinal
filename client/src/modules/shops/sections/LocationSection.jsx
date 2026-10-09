import {
  MapPin,
  Navigation,
  Phone,
  Clock3,
  Truck,
  LocateFixed,
} from "lucide-react";

import MapLibreMap from "../../maps/components/MapLibreMap";
import { useLocation } from "../../../shared/context/LocationContext";

const displayValue = (value, fallback = "Not specified") => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return fallback;
  }

  return String(value);
};

const capitalizeDay = (value) => {
  if (!value) {
    return "";
  }

  const day = String(value).trim().toLowerCase();

  return day.charAt(0).toUpperCase() + day.slice(1);
};

const formatTime12Hour = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const time = String(value).trim();

  if (/[ap]\.?m\.?/i.test(time)) {
    const match = time.match(
      /^(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?\s*([ap])\.?m\.?$/i,
    );

    if (match) {
      const hour = Number(match[1]);
      const minute = match[2] || "00";
      const period = match[4].toUpperCase();

      if (hour >= 1 && hour <= 12) {
        return `${hour}:${minute} ${period}M`;
      }
    }

    return time;
  }

  const match = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

  if (!match) {
    return time;
  }

  let hour = Number(match[1]);
  const minute = match[2];

  if (hour < 0 || hour > 23) {
    return time;
  }

  const period = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;

  if (hour === 0) {
    hour = 12;
  }

  return `${hour}:${minute} ${period}`;
};

const formatWorkingHoursEntry = (entry) => {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const day =
    entry.day ||
    entry.dayName ||
    entry.weekday ||
    entry.name ||
    entry.label ||
    "";

  const open =
    entry.open ||
    entry.opening ||
    entry.openingTime ||
    entry.from ||
    entry.start ||
    entry.startTime ||
    "";

  const close =
    entry.close ||
    entry.closing ||
    entry.closingTime ||
    entry.to ||
    entry.end ||
    entry.endTime ||
    "";

  const isClosed =
    entry.closed === true ||
    entry.isClosed === true ||
    String(entry.status || "").toLowerCase() === "closed";

  return {
    day: capitalizeDay(day),
    open: isClosed ? "" : formatTime12Hour(open),
    close: isClosed ? "" : formatTime12Hour(close),
    closed: isClosed,
  };
};

const getWorkingHoursRows = (workingHours) => {
  if (!workingHours) {
    return [];
  }

  if (Array.isArray(workingHours)) {
    return workingHours.map(formatWorkingHoursEntry).filter(Boolean);
  }

  if (typeof workingHours === "object") {
    return Object.entries(workingHours)
      .map(([day, value]) => {
        if (typeof value === "string") {
          const parts = value.split(/\s*[-–—]\s*/);

          if (parts.length >= 2) {
            return {
              day: capitalizeDay(day),
              open: formatTime12Hour(parts[0]),
              close: formatTime12Hour(parts[1]),
              closed: false,
            };
          }

          return {
            day: capitalizeDay(day),
            open: formatTime12Hour(value),
            close: "",
            closed: false,
          };
        }

        if (value && typeof value === "object") {
          return formatWorkingHoursEntry({
            ...value,
            day,
          });
        }

        if (value === false || value === null) {
          return {
            day: capitalizeDay(day),
            open: "",
            close: "",
            closed: true,
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  return [];
};

function WorkingHoursTable({ shop }) {
  const workingHours =
    shop?.workingHours ||
    shop?.hoursData ||
    shop?.businessHours ||
    shop?.openingHours;

  const rows = getWorkingHoursRows(workingHours);

  if (rows.length === 0) {
    const fallback =
      shop?.openingHoursText ||
      shop?.hours ||
      shop?.openingHours ||
      "Opening hours not specified";

    return (
      <p className="mt-5 break-words leading-7 text-gray-600">
        {displayValue(fallback)}
      </p>
    );
  }

  return (
    <div className="mt-4 w-full overflow-x-auto">
      <table className="w-full min-w-[280px] border-collapse text-sm">
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.day || "day"}-${index}`}
              className="border-b border-gray-100 last:border-b-0"
            >
              <td className="py-2 pr-4 font-medium text-[#022B3A]">
                {displayValue(row.day, "Day")}
              </td>

              <td className="py-2 text-right text-gray-600">
                {row.closed
                  ? "Closed"
                  : row.open && row.close
                    ? `${row.open} - ${row.close}`
                    : row.open || row.close || "Not specified"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const openGoogleMapsToShop = (shop) => {
  const latitude = Number(shop?.latitude);
  const longitude = Number(shop?.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    alert("Shop location coordinates are not available.");
    return;
  }

  const destination = `${latitude},${longitude}`;

  const googleMapsUrl =
    "https://www.google.com/maps/dir/?api=1" +
    `&destination=${encodeURIComponent(destination)}`;

  window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
};

function LocationSection({ shop }) {
  const { location } = useLocation();

  if (!shop) {
    return null;
  }

  const address = displayValue(shop.address);

  const city = shop.city || "";

  const state = shop.state || "";

  const pincode = shop.pincode || "";

  const fullAddress = [address, city, state].filter(Boolean).join(", ");

  const addressWithPincode = pincode
    ? `${fullAddress || "Address not specified"}${
        fullAddress ? ` - ${pincode}` : pincode
      }`
    : fullAddress || "Address not specified";

  const deliveryAvailable = Boolean(shop.delivery);

  const deliveryRadius = shop.deliveryRadius;

  const navigateFromStoredLocation = () => {
    const shopLatitude = Number(shop?.latitude);
    const shopLongitude = Number(shop?.longitude);

    if (!Number.isFinite(shopLatitude) || !Number.isFinite(shopLongitude)) {
      alert("Shop location coordinates are not available.");
      return;
    }

    const userLatitude = Number(location?.latitude);
    const userLongitude = Number(location?.longitude);

    if (!Number.isFinite(userLatitude) || !Number.isFinite(userLongitude)) {
      alert(
        "Your current location is not available. Please select or enable your location first.",
      );
      return;
    }

    const origin = `${userLatitude},${userLongitude}`;

    const destination = `${shopLatitude},${shopLongitude}`;

    const googleMapsUrl =
      "https://www.google.com/maps/dir/?api=1" +
      `&origin=${encodeURIComponent(origin)}` +
      `&destination=${encodeURIComponent(destination)}` +
      "&travelmode=driving";

    window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/*  HEADING */}

        <div className="mb-10">
          <h2 className="text-3xl font-bold text-[#022B3A]">
            Location & Directions
          </h2>

          <p className="mt-2 text-gray-600">
            Visit the shop or get directions from your current location.
          </p>
        </div>

        {/* MAIN GRID */}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          {/* MAP  */}

          <div className="h-[350px] overflow-hidden rounded-3xl border border-gray-200 bg-gray-100 shadow-sm sm:h-[400px] md:h-[450px] lg:h-[800px]">
            <MapLibreMap
              latitude={shop.latitude}
              longitude={shop.longitude}
              zoom={15}
              popupText={shop.name}
              markerColor="#FF8C00"
              scrollZoom={false}
              showNavigation={true}
            />
          </div>

          {/*  DETAILS  */}

          <div className="flex min-w-0 flex-col gap-6">
            {/*  ADDRESS  */}

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <MapPin className="shrink-0 text-[#FF8C00]" size={22} />

                <h3 className="text-xl font-bold text-[#022B3A]">Address</h3>
              </div>

              <p className="mt-5 leading-7 text-gray-600">
                {addressWithPincode}
              </p>
            </div>

            {/*  WORKING HOURS  */}

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Clock3 className="shrink-0 text-[#FF8C00]" size={22} />

                <h3 className="text-xl font-bold text-[#022B3A]">
                  Working Hours
                </h3>
              </div>

              <WorkingHoursTable shop={shop} />
            </div>

            {/*  CONTACT */}

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Phone className="shrink-0 text-[#FF8C00]" size={22} />

                <h3 className="text-xl font-bold text-[#022B3A]">Contact</h3>
              </div>

              <p className="mt-5 text-gray-600">{displayValue(shop.phone)}</p>
            </div>

            {/*  DELIVERY */}

            {deliveryAvailable && (
              <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Truck className="shrink-0 text-[#FF8C00]" size={22} />

                  <h3 className="text-xl font-bold text-[#022B3A]">
                    Delivery Coverage
                  </h3>
                </div>

                <p className="mt-5 text-gray-600">
                  Available within{" "}
                  <span className="font-semibold">
                    {deliveryRadius !== null &&
                    deliveryRadius !== undefined &&
                    deliveryRadius !== ""
                      ? `${deliveryRadius} km`
                      : "the available delivery area"}
                  </span>
                </p>
              </div>
            )}

            {/* BUTTONS  */}

            <div className="space-y-4">
              {/* Get Directions */}

              <button
                type="button"
                onClick={() => openGoogleMapsToShop(shop)}
                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-[#022B3A] py-4 font-semibold text-white transition hover:bg-[#03384A] active:scale-[0.99]"
              >
                <Navigation size={20} />

                <span>Get Directions</span>
              </button>

              {/* Navigate From My Location */}

              <button
                type="button"
                onClick={navigateFromStoredLocation}
                className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-[#FF8C00] py-4 font-semibold text-[#FF8C00] transition hover:bg-[#FF8C00] hover:text-white active:scale-[0.99]"
              >
                <LocateFixed size={20} />

                <span>Navigate From My Location</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LocationSection;
