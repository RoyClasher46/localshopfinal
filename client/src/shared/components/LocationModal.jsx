import { useState } from "react";
import { MapPin, Navigation, X } from "lucide-react";
import { useLocation } from "../context/LocationContext";

function LocationModal() {
  const {
    isLocationOpen,
    closeLocationModal,
    useCurrentLocation,
    setManualLocation,
    isLocationLoading,
  } = useLocation();

  const [manualValue, setManualValue] = useState("");
  const [isManualLocationLoading, setIsManualLocationLoading] = useState(false);

  if (!isLocationOpen) {
    return null;
  }

  const handleManualLocation = async () => {
    const value = manualValue.trim();

    if (!value || isManualLocationLoading) return;

    try {
      setIsManualLocationLoading(true);

      await setManualLocation(value);

      setManualValue("");
    } finally {
      setIsManualLocationLoading(false);
    }
  };

  const isLoading = isLocationLoading || isManualLocationLoading;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[#F8F4E9] p-6 shadow-2xl">
        {/* HEADER */}

        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#022B3A]">
              Select Your Location
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Find shops near you
            </p>
          </div>

          <button
            type="button"
            onClick={closeLocationModal}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition hover:bg-[#FFF0D9]"
            aria-label="Close location"
          >
            <X size={20} />
          </button>
        </div>

        {/* GPS */}

        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={isLoading}
          className="flex w-full cursor-pointer items-center gap-4 rounded-xl border border-[#FF8C00]/30 bg-[#FFF0D9] p-4 text-left transition hover:border-[#FF8C00] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FF8C00] text-white">
            <Navigation size={20} />
          </div>

          <div>
            <p className="font-semibold text-[#022B3A]">
              {isLocationLoading
                ? "Detecting your location..."
                : isManualLocationLoading
                  ? "Confirming location..."
                  : "Use my current location"}
            </p>

            <p className="text-sm text-[#64748B]">Allow location access</p>
          </div>
        </button>

        {/* DIVIDER */}

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#DDE4E2]" />

          <span className="text-sm text-[#64748B]">OR</span>

          <div className="h-px flex-1 bg-[#DDE4E2]" />
        </div>

        {/* MANUAL LOCATION */}

        <label className="mb-2 block text-sm font-semibold text-[#022B3A]">
          Enter your location
        </label>

        <div className="relative">
          <MapPin
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
          />

          <input
            type="text"
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleManualLocation();
              }
            }}
            placeholder="Enter city, area or pincode"
            disabled={isManualLocationLoading}
            className="h-12 w-full rounded-lg border border-[#DDE4E2] bg-white pl-11 pr-4 text-sm text-[#022B3A] outline-none transition focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20 disabled:cursor-not-allowed disabled:opacity-70"
          />
        </div>

        <button
          type="button"
          onClick={handleManualLocation}
          disabled={isManualLocationLoading}
          className="mt-4 h-12 w-full cursor-pointer rounded-lg bg-[#FF8C00] font-semibold text-white transition hover:bg-[#E67E00] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isManualLocationLoading
            ? "Confirming Location..."
            : "Confirm Location"}
        </button>
      </div>
    </div>
  );
}

export default LocationModal;
