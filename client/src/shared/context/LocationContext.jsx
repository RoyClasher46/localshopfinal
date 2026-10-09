import { createContext, useContext, useEffect, useState } from "react";

import {
  reverseGeocode,
  forwardGeocode,
  formatLocationLabel,
  formatFullLocationLabel,
} from "../../services/locationService.js";

const LocationContext = createContext(null);

const STORAGE_KEY = "shoplocal_location";

const DEFAULT_LOCATION = {
  label: "",
  displayName: "",
  latitude: null,
  longitude: null,
  accuracy: null,
  source: null,
};

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(DEFAULT_LOCATION);

  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const [isLocationLoading, setIsLocationLoading] = useState(false);

  //--->>> LOAD LOCATION FROM SESSION STORAGE

  useEffect(() => {
    try {
      const storedLocation = sessionStorage.getItem(STORAGE_KEY);

      if (storedLocation) {
        const parsedLocation = JSON.parse(storedLocation);

        if (
          parsedLocation &&
          typeof parsedLocation === "object" &&
          typeof parsedLocation.label === "string"
        ) {
          setLocation({
            ...DEFAULT_LOCATION,
            ...parsedLocation,
          });
        } else {
          console.warn("⚠️ Invalid stored location found");

          sessionStorage.removeItem(STORAGE_KEY);

          setIsLocationOpen(true);
        }
      } else {
        setIsLocationOpen(true);
      }
    } catch (error) {
      sessionStorage.removeItem(STORAGE_KEY);

      setIsLocationOpen(true);
    }
  }, []);

  //--->>>> SAVE LOCATION

  const saveLocation = (newLocation) => {
    setLocation(newLocation);

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newLocation));
    } catch (error) {
      console.error("Failed to save location to sessionStorage:", error);
    }

    setIsLocationOpen(false);
  };

  //--->>> GPS / BROWSER LOCATION

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation is NOT supported by this browser.");

      alert(
        "Geolocation is not supported by your browser. Please enter your location manually.",
      );

      return;
    }

    setIsLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        try {
          const reverseData = await reverseGeocode(latitude, longitude);

          //--->>> EXTRACT ADDRESS

          const address = reverseData.address || {};

          //-->>> CREATE READABLE LABEL

          const label = formatLocationLabel(address);

          const displayName = formatFullLocationLabel(reverseData);

          //--->>> FINAL LOCATION OBJECT

          const locationData = {
            label,
            displayName,
            latitude,
            longitude,
            accuracy,
            source: "gps",
          };

          saveLocation(locationData);
        } catch (error) {
          console.error("Reverse geocoding failed:", error);

          const locationData = {
            label: "Current Location",
            displayName: "Current Location",
            latitude,
            longitude,
            accuracy,
            source: "gps",
          };

          saveLocation(locationData);
        } finally {
          setIsLocationLoading(false);
        }
      },

      (error) => {
        console.error("GPS error object:", error);
        console.error("GPS error code:", error.code);
        console.error("GPS error message:", error.message);

        setIsLocationLoading(false);

        if (error.code === 1) {
          alert(
            "Location permission was denied. Please allow location access or enter your location manually.",
          );
        } else if (error.code === 2) {
          alert(
            "Your location could not be determined. Please try again or enter your location manually.",
          );
        } else if (error.code === 3) {
          alert(
            "Location request timed out. Please try again or enter your location manually.",
          );
        } else {
          alert(
            "Unable to access your location. Please enter your location manually.",
          );
        }
      },

      {
        enableHighAccuracy: true,

        //--->>> Wait up to 15 seconds for GPS.
        timeout: 15000,

        //-->> Browser can reuse a location up to 5 minutes old.
        maximumAge: 300000,
      },
    );
  };

  //--->>> MANUAL LOCATION

  const setManualLocation = async (label) => {
    const value = label?.trim();

    if (!value) {
      console.warn("Manual location is empty.");

      return;
    }

    setIsLocationLoading(true);

    try {
      //--->>> FORWARD GEOCODING

      const results = await forwardGeocode(value);

      if (!results || results.length === 0) {
        console.warn("No location found for:", value);

        alert(
          "Location not found. Please enter a more specific location, such as area, city or pincode.",
        );

        return;
      }

      //-->> BEST RESULT

      const result = results[0];

      //--->>> CONVERT COORDINATES

      const latitude = Number(result.lat);

      const longitude = Number(result.lon);

      if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
        throw new Error("Geocoding result contains invalid coordinates.");
      }

      const displayName = formatFullLocationLabel(result);

      const finalLabel = value;

      //--->>>> FINAL LOCATION OBJECT

      const locationData = {
        label: finalLabel,
        displayName,
        latitude,
        longitude,
        accuracy: null,
        source: "manual",
      };

      saveLocation(locationData);
    } catch (error) {
      console.error("Manual location geocoding failed:", error);

      alert("Unable to find this location right now. Please try again.");
    } finally {
      setIsLocationLoading(false);
    }
  };

  //--->>> OPEN LOCATION MODAL

  const openLocationModal = () => {
    setIsLocationOpen(true);
  };

  //--->>> CLOSE LOCATION MODAL

  const closeLocationModal = () => {
    setIsLocationOpen(false);
  };

  //--->>> CONTEXT

  return (
    <LocationContext.Provider
      value={{
        location,

        isLocationOpen,

        isLocationLoading,

        openLocationModal,

        closeLocationModal,

        useCurrentLocation,

        setManualLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

//---->>> USE LOCATION HOOK

export function useLocation() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error("useLocation must be used inside LocationProvider");
  }

  return context;
}
