import { useEffect, useRef } from "react";
import {
  Map,
  Marker,
  Popup,
  NavigationControl,
  setWorkerUrl,
} from "maplibre-gl";

import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

import "maplibre-gl/dist/maplibre-gl.css";

setWorkerUrl(workerUrl);

function MapLibreMap({
  latitude,
  longitude,
  zoom = 15,
  popupText = "",
  markerColor = "#FF8C00",
  scrollZoom = false,
  showNavigation = true,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  //-->> CREATE MAP
  useEffect(() => {
    if (!mapContainerRef.current) {
      console.error("Map container not found.");
      return;
    }

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      console.error("Invalid coordinates:", {
        latitude,
        longitude,
      });
      return;
    }

    const apiKey = import.meta.env.VITE_MAPTILER_API_KEY;

    if (!apiKey) {
      console.error("VITE_MAPTILER_API_KEY is missing.");
      return;
    }

    const map = new Map({
      container: mapContainerRef.current,

      style: `https://api.maptiler.com/maps/streets-v4/style.json?key=${apiKey}`,

      center: [longitude, latitude],

      zoom,

      scrollZoom,
    });

    mapRef.current = map;

    //-->> MAP LOAD

    map.on("load", () => {
      map.resize();

      const marker = new Marker({
        color: markerColor,
      })
        .setLngLat([longitude, latitude])
        .addTo(map);

      markerRef.current = marker;

      if (popupText) {
        const popup = new Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          maxWidth: "300px",
          className: "shop-map-popup",
        }).setText(popupText);

        marker.setPopup(popup);

        popup.addTo(map);
      }
    });

    //--->>> MAP ERROR

    map.on("error", (event) => {
      console.error("MapLibre error:", event);
    });

    //-->>> NAVIGATION CONTROL

    if (showNavigation) {
      map.addControl(
        new NavigationControl({
          showZoom: true,
          showCompass: true,
        }),
        "top-right",
      );
    }

    //--->>> RESIZE OBSERVER

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    // ---->>> CLEANUP

    return () => {
      resizeObserver.disconnect();

      if (markerRef.current) {
        markerRef.current.remove();
      }

      if (mapRef.current) {
        mapRef.current.remove();
      }

      markerRef.current = null;
      mapRef.current = null;
    };
  }, []);

  //-->>> UPDATE LOCATION

  useEffect(() => {
    const map = mapRef.current;

    if (!map || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    const coordinates = [longitude, latitude];

    //--->>> Move map to new location
    map.flyTo({
      center: coordinates,
      zoom,
      duration: 800,
    });

    //--->>> Update marker
    if (markerRef.current) {
      markerRef.current.setLngLat(coordinates);

      if (popupText) {
        const popup = new Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          maxWidth: "300px",
          className: "shop-map-popup",
        }).setText(popupText);

        markerRef.current.setPopup(popup);
      }
    }
  }, [latitude, longitude, zoom, popupText]);

  return <div ref={mapContainerRef} className="h-full w-full" />;
}

export default MapLibreMap;
