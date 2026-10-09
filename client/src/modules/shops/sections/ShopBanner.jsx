import {
  BadgeCheck,
  Clock3,
  Heart,
  MapPin,
  Phone,
  Share2,
  Star,
  Navigation,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import {
  getDistanceKm,
  getShopCoordinates,
  isValidCoordinate,
  formatDistance,
} from "../../../shared/utils/distance";

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

  if (matchingKey) {
    return openingHours[matchingKey];
  }

  const shortDay = today.slice(0, 3);

  const shortKey = Object.keys(openingHours).find(
    (key) => key.toLowerCase() === shortDay,
  );

  if (shortKey) {
    return openingHours[shortKey];
  }

  return null;
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

  const twelveHourMatch = value.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);

  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1]);

    const minutes = Number(twelveHourMatch[2] || 0);

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

    if (period === "AM" && hours === 12) {
      hours = 0;
    }

    if (period === "PM" && hours !== 12) {
      hours += 12;
    }

    return hours * 60 + minutes;
  }

  return null;
};

const formatTime = (time) => {
  if (!time) {
    return "";
  }

  const value = String(time).trim();

  const minutes = timeToMinutes(value);

  if (minutes === null) {
    return value;
  }

  const hours24 = Math.floor(minutes / 60);

  const mins = minutes % 60;

  const period = hours24 >= 12 ? "PM" : "AM";

  const hours12 = hours24 % 12 || 12;

  return `${hours12}:${String(mins).padStart(2, "0")} ${period}`;
};

const getShopStatus = (openingHours) => {
  const todayHours = getTodayOpeningHours(openingHours);

  if (!todayHours || typeof todayHours !== "object") {
    return {
      isOpen: null,
      closingTime: null,
      openingTime: null,
      statusAvailable: false,
    };
  }

  if (todayHours.closed === true) {
    return {
      isOpen: false,
      closingTime: null,
      openingTime: null,
      statusAvailable: true,
    };
  }

  const openingTime = todayHours.open;

  const closingTime = todayHours.close;

  if (!openingTime || !closingTime) {
    return {
      isOpen: null,
      closingTime: null,
      openingTime: null,
      statusAvailable: false,
    };
  }

  const openingMinutes = timeToMinutes(openingTime);

  const closingMinutes = timeToMinutes(closingTime);

  if (openingMinutes === null || closingMinutes === null) {
    return {
      isOpen: null,
      closingTime: null,
      openingTime: null,
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
      closingTime: formatTime(closingTime),
      openingTime: formatTime(openingTime),
      statusAvailable: true,
    };
  }

  const isOpen =
    currentMinutes >= openingMinutes && currentMinutes < closingMinutes;

  return {
    isOpen,
    closingTime: formatTime(closingTime),
    openingTime: formatTime(openingTime),
    statusAvailable: true,
  };
};

function ShopBanner({ shop, userLocation }) {
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!shop) {
    return null;
  }

  const gallery = useMemo(() => {
    if (Array.isArray(shop.gallery) && shop.gallery.length > 0) {
      return shop.gallery.filter(Boolean);
    }

    if (shop.image) {
      return [shop.image];
    }

    return [];
  }, [shop.gallery, shop.image]);

  const logo = shop.logo || shop.image;

  const shopAddress =
    shop.address || shop.location?.address || "Address unavailable";

  const shopCity = shop.city || shop.location?.city || "";

  const shopState = shop.state || shop.location?.state || "";

  const shopPincode =
    shop.pincode || shop.location?.pincode || shop.location?.postalCode || "";

  const description =
    shop.description ||
    `Discover ${shop.name}, a local ${
      shop.category?.toLowerCase() || "shop"
    } serving customers in ${shopCity || shopAddress || "your area"}.`;

  const ratingValue = Number(shop.ratingAverage ?? shop.rating);

  const totalReviews = Number(shop.totalReviews ?? shop.reviews ?? 0);

  const isVerified = shop.isVerified ?? shop.verified ?? false;

  const { isOpen, closingTime, statusAvailable } = getShopStatus(
    shop.openingHours,
  );

  const distanceKm = getDistanceKm(shop, userLocation);

  const distanceText = formatDistance(distanceKm);

  const phone = shop.phone || shop.seller?.phone || shop.owner?.phone;

  const handleCall = () => {
    if (!phone) {
      return;
    }

    window.location.href = `tel:${phone}`;
  };

  const handleDirections = () => {
    const { latitude, longitude } = getShopCoordinates(shop);

    if (isValidCoordinate(latitude, longitude)) {
      const destination = `${latitude},${longitude}`;

      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          destination,
        )}`,
        "_blank",
        "noopener,noreferrer",
      );

      return;
    }

    const destination = encodeURIComponent(
      [shopAddress, shopCity, shopState, shopPincode]
        .filter(Boolean)
        .join(", "),
    );

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${destination}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleShare = async () => {
    const shareData = {
      title: shop.name,
      text: `Check out ${shop.name} on ShopLocal.`,
      url: window.location.href,
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);

        alert("Shop link copied to clipboard.");
      } else {
        alert("Unable to share this shop.");
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Share failed:", error);
      }
    }
  };

  const openImageViewer = (index) => {
    if (!gallery.length) {
      return;
    }

    const safeIndex = Math.max(0, Math.min(index, gallery.length - 1));

    setSelectedImageIndex(safeIndex);

    setIsImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setIsImageViewerOpen(false);
  };

  const showPreviousImage = (event) => {
    event?.stopPropagation();

    if (!gallery.length) {
      return;
    }

    setSelectedImageIndex((currentIndex) =>
      currentIndex === 0 ? gallery.length - 1 : currentIndex - 1,
    );
  };

  const showNextImage = (event) => {
    event?.stopPropagation();

    if (!gallery.length) {
      return;
    }

    setSelectedImageIndex((currentIndex) =>
      currentIndex === gallery.length - 1 ? 0 : currentIndex + 1,
    );
  };

  useEffect(() => {
    if (!isImageViewerOpen || !gallery.length) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeImageViewer();

        return;
      }

      if (event.key === "ArrowLeft") {
        setSelectedImageIndex((currentIndex) =>
          currentIndex === 0 ? gallery.length - 1 : currentIndex - 1,
        );
      }

      if (event.key === "ArrowRight") {
        setSelectedImageIndex((currentIndex) =>
          currentIndex === gallery.length - 1 ? 0 : currentIndex + 1,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImageViewerOpen, gallery.length]);

  useEffect(() => {
    if (!isImageViewerOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isImageViewerOpen]);

  const selectedImage = gallery[selectedImageIndex] || gallery[0];

  return (
    <>
      <section className="bg-[#F8F9FA]">
        {/*  COVER IMAGE */}

        <div className="relative h-[280px] overflow-hidden sm:h-[340px] lg:h-[400px]">
          {gallery.length > 0 ? (
            <button
              type="button"
              onClick={() => openImageViewer(0)}
              className="group block h-full w-full cursor-pointer"
              aria-label={`Open ${shop.name} cover image`}
            >
              <img
                src={gallery[0]}
                alt={`${shop.name} cover`}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </button>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#022B3A]">
              <span className="text-lg font-semibold text-white">
                {shop.name}
              </span>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        {/* SHOP INFO CARD */}

        <div className="relative mx-auto -mt-20 max-w-7xl px-5 pb-10 lg:px-8">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              {/*LEFT */}

              <div className="flex flex-col gap-6 sm:flex-row">
                {/* LOGO */}

                {logo ? (
                  <button
                    type="button"
                    onClick={() => {
                      const logoIndex = gallery.indexOf(logo);

                      openImageViewer(logoIndex >= 0 ? logoIndex : 0);
                    }}
                    className="h-24 w-24 shrink-0 cursor-pointer rounded-3xl sm:h-28 sm:w-28"
                    aria-label={`Open ${shop.name} logo`}
                  >
                    <img
                      src={logo}
                      alt={`${shop.name} logo`}
                      className="h-full w-full rounded-3xl border-4 border-white object-cover shadow-lg transition duration-300 hover:scale-105"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </button>
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-[#022B3A] text-2xl font-bold text-white shadow-lg sm:h-28 sm:w-28">
                    {shop.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}

                <div className="min-w-0">
                  {/* NAME + VERIFIED */}

                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold text-[#022B3A] sm:text-3xl">
                      {shop.name}
                    </h1>

                    {isVerified && (
                      <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                        <BadgeCheck size={16} />
                        Verified
                      </span>
                    )}
                  </div>

                  {/* CATEGORY */}

                  {shop.category && (
                    <p className="mt-2 text-sm font-medium text-[#FF8C00]">
                      {shop.category}
                    </p>
                  )}

                  {/* DESCRIPTION */}

                  {!shop.isCommunityListed && (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                      {description}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
                    {/* RATING */}

                    <div className="flex items-center gap-2">
                      <Star
                        size={18}
                        fill="#FF9800"
                        className="text-[#FF9800]"
                      />

                      <span className="font-semibold text-[#022B3A]">
                        {Number.isFinite(ratingValue)
                          ? ratingValue.toFixed(1)
                          : "N/A"}
                      </span>

                      <span className="text-gray-500">
                        ({totalReviews}{" "}
                        {totalReviews === 1 ? "Review" : "Reviews"})
                      </span>
                    </div>

                    {/* STATUS */}

                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock3 size={18} />

                      {statusAvailable && isOpen === true ? (
                        <span className="font-medium text-green-600">
                          Open Now
                          {closingTime ? ` • Closes ${closingTime}` : ""}
                        </span>
                      ) : statusAvailable && isOpen === false ? (
                        <span className="font-medium text-red-500">Closed</span>
                      ) : (
                        <span className="font-medium text-gray-500">
                          Hours unavailable
                        </span>
                      )}
                    </div>

                    {/* DISTANCE */}

                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={18} />

                      <span>{distanceText}</span>
                    </div>
                  </div>

                  {/* ADDRESS */}

                  <div className="mt-5 flex items-start gap-2">
                    <MapPin
                      size={18}
                      className="mt-1 shrink-0 text-[#FF8C00]"
                    />

                    <p className="text-sm leading-6 text-gray-600 sm:text-base">
                      {shopAddress}

                      {shopCity ? `, ${shopCity}` : ""}

                      {shopState ? `, ${shopState}` : ""}

                      {shopPincode ? ` - ${shopPincode}` : ""}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                {/* CALL */}

                <button
                  type="button"
                  onClick={handleCall}
                  disabled={!phone}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-gray-200 p-4 transition hover:border-[#FF8C00] hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Phone size={24} className="text-[#FF8C00]" />

                  <span className="mt-2 text-sm font-semibold text-[#022B3A]">
                    Call
                  </span>
                </button>

                {/* DIRECTIONS */}

                <button
                  type="button"
                  onClick={handleDirections}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-gray-200 p-4 transition hover:border-[#FF8C00] hover:bg-orange-50"
                >
                  <Navigation size={24} className="text-[#FF8C00]" />

                  <span className="mt-2 text-sm font-semibold text-[#022B3A]">
                    Directions
                  </span>
                </button>

                {/* SAVE */}

                <button
                  type="button"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-gray-200 p-4 transition hover:border-[#FF8C00] hover:bg-orange-50"
                >
                  <Heart size={24} className="text-[#FF8C00]" />

                  <span className="mt-2 text-sm font-semibold text-[#022B3A]">
                    Save
                  </span>
                </button>

                {/* SHARE */}

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-gray-200 p-4 transition hover:border-[#FF8C00] hover:bg-orange-50"
                >
                  <Share2 size={24} className="text-[#FF8C00]" />

                  <span className="mt-2 text-sm font-semibold text-[#022B3A]">
                    Share
                  </span>
                </button>
              </div>
            </div>

            {/*  GALLERY */}

            {gallery.length > 0 && (
              <div className="mt-10">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#022B3A]">
                      Shop Gallery
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Explore {shop.name}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {gallery.map((image, index) => (
                    <button
                      type="button"
                      key={`${shop.id || shop.name}-gallery-${index}`}
                      onClick={() => openImageViewer(index)}
                      className="group overflow-hidden rounded-2xl text-left"
                      aria-label={`Open ${shop.name} gallery image ${
                        index + 1
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${shop.name} gallery ${index + 1}`}
                        className="h-36 w-full cursor-pointer object-cover transition duration-500 group-hover:scale-110 sm:h-40"
                        loading={index === 0 ? "eager" : "lazy"}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* IMAGE LIGHTBOX */}

      {isImageViewerOpen && selectedImage && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label={`${shop.name} image gallery`}
          onClick={closeImageViewer}
        >
          {/*  TOP BAR */}

          <div className="flex shrink-0 items-center justify-between px-4 py-4 sm:px-6">
            <div className="text-sm font-medium text-white">
              {selectedImageIndex + 1} / {gallery.length}
            </div>

            <button
              type="button"
              onClick={closeImageViewer}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close image viewer"
            >
              <X size={24} />
            </button>
          </div>

          {/* MAIN IMAGE AREA */}

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center px-14 sm:px-20"
            onClick={(event) => event.stopPropagation()}
          >
            {/* PREVIOUS */}

            {gallery.length > 1 && (
              <button
                type="button"
                onClick={showPreviousImage}
                className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 sm:left-6"
                aria-label="Previous image"
              >
                <ChevronLeft size={30} />
              </button>
            )}

            {/* IMAGE */}

            <img
              src={selectedImage}
              alt={`${shop.name} gallery ${selectedImageIndex + 1}`}
              className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
            />

            {/* NEXT */}

            {gallery.length > 1 && (
              <button
                type="button"
                onClick={showNextImage}
                className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 sm:right-6"
                aria-label="Next image"
              >
                <ChevronRight size={30} />
              </button>
            )}
          </div>

          {/*  THUMBNAILS */}

          {gallery.length > 1 && (
            <div
              className="shrink-0 overflow-x-auto px-4 py-4"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto flex w-max gap-3">
                {gallery.map((image, index) => (
                  <button
                    key={`viewer-thumb-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`h-16 w-20 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition ${
                      selectedImageIndex === index
                        ? "border-[#FF8C00] opacity-100"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default ShopBanner;
