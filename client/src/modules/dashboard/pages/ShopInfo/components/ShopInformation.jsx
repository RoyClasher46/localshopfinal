import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Edit3,
  Image as ImageIcon,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Store,
  Truck,
  X,
} from "lucide-react";

import { useAuth } from "../../../../../shared/context/AuthContext";

const safeString = (value, fallback = "Not available") => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "string") {
    const text = value.trim();
    return text || fallback;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
};

const safeArray = (value) => {
  return Array.isArray(value) ? value : [];
};

const safeObjectValue = (value) => {
  if (value === null || value === undefined) {
    return "Not available";
  }

  if (typeof value === "string") {
    return value.trim() || "Not available";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => safeObjectValue(item))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, val]) => {
        if (val === null || val === undefined || val === "") {
          return null;
        }

        return `${key}: ${String(val)}`;
      })
      .filter(Boolean)
      .join(", ");
  }

  return "Not available";
};

/* ADDRESS */

const formatAddress = (shop) => {
  if (!shop) {
    return "Address not available";
  }

  if (typeof shop.address === "string" && shop.address.trim()) {
    return shop.address.trim();
  }

  const location = shop.location;

  if (typeof location === "string" && location.trim()) {
    return location.trim();
  }

  if (location && typeof location === "object") {
    const parts = [
      location.address,
      location.street,
      location.area,
      location.locality,
      location.city,
      location.state,
      location.pincode,
      location.zipCode,
      location.country,
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(", ");
    }
  }

  return "Address not available";
};

/* CONTACT HELPERS */

const getPhone = (shop) => {
  if (!shop) {
    return "";
  }

  const phone =
    shop.phone ||
    shop.phoneNumber ||
    shop.mobile ||
    shop.mobileNumber ||
    shop.contact?.phone ||
    shop.contact?.phoneNumber ||
    "";

  return typeof phone === "string" || typeof phone === "number"
    ? String(phone).trim()
    : "";
};

const getEmail = (shop) => {
  if (!shop) {
    return "";
  }

  const email =
    shop.email ||
    shop.emailAddress ||
    shop.contact?.email ||
    shop.contact?.emailAddress ||
    "";

  return typeof email === "string" ? email.trim() : "";
};

/* DATE */

const formatDate = (value) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/* TIME */

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  const text = String(value).trim();

  if (!text) {
    return "";
  }

  if (/am|pm/i.test(text)) {
    return text;
  }

  const match = text.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) {
    return text;
  }

  let hour = Number(match[1]);
  const minute = match[2];

  const period = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${hour}:${minute} ${period}`;
};

/*  OPENING HOURS */

const formatOpeningHours = (hours) => {
  if (!hours) {
    return [];
  }

  if (typeof hours === "string") {
    return [
      {
        day: "Business Hours",
        value: hours,
      },
    ];
  }

  if (Array.isArray(hours)) {
    return hours.map((item, index) => {
      if (typeof item === "string") {
        return {
          day: `Schedule ${index + 1}`,
          value: item,
        };
      }

      if (!item || typeof item !== "object") {
        return {
          day: `Schedule ${index + 1}`,
          value: safeString(item),
        };
      }

      const day =
        item.day || item.name || item.label || `Schedule ${index + 1}`;

      if (item.closed === true || item.isClosed === true) {
        return {
          day,
          value: "Closed",
        };
      }

      const open =
        item.open || item.opening || item.from || item.start || item.openTime;

      const close =
        item.close || item.closing || item.to || item.end || item.closeTime;

      if (open || close) {
        return {
          day,
          value: `${formatTime(open)}${
            open && close ? " - " : ""
          }${formatTime(close)}`,
        };
      }

      return {
        day,
        value: safeObjectValue(item),
      };
    });
  }

  if (typeof hours === "object") {
    return Object.entries(hours).map(([day, value]) => {
      const formattedDay = day.charAt(0).toUpperCase() + day.slice(1);

      if (typeof value === "string") {
        return {
          day: formattedDay,
          value,
        };
      }

      if (value && typeof value === "object") {
        if (value.closed === true || value.isClosed === true) {
          return {
            day: formattedDay,
            value: "Closed",
          };
        }

        const open =
          value.open ||
          value.opening ||
          value.from ||
          value.start ||
          value.openTime;

        const close =
          value.close ||
          value.closing ||
          value.to ||
          value.end ||
          value.closeTime;

        if (open || close) {
          return {
            day: formattedDay,
            value: `${formatTime(open)}${
              open && close ? " - " : ""
            }${formatTime(close)}`,
          };
        }

        return {
          day: formattedDay,
          value: safeObjectValue(value),
        };
      }

      return {
        day: formattedDay,
        value: safeString(value),
      };
    });
  }

  return [];
};

/* IMAGE HELPERS */

const extractImageUrl = (image) => {
  if (typeof image === "string") {
    return image.trim();
  }

  if (image && typeof image === "object") {
    return (
      image.url ||
      image.src ||
      image.image ||
      image.path ||
      image.secure_url ||
      image.secureUrl ||
      ""
    );
  }

  return "";
};

const getShopImages = (shop) => {
  if (!shop) {
    return [];
  }

  const images = [];

  const addImage = (image) => {
    const url = extractImageUrl(image);

    if (url && !images.includes(url)) {
      images.push(url);
    }
  };

  addImage(shop.image);
  addImage(shop.logo);

  safeArray(shop.gallery).forEach(addImage);
  safeArray(shop.images).forEach(addImage);

  return images;
};

const getGalleryImages = (shop) => {
  if (!shop) {
    return [];
  }

  const images = [];

  const addImage = (image) => {
    const url = extractImageUrl(image);

    if (url && !images.includes(url)) {
      images.push(url);
    }
  };

  addImage(shop.image);

  safeArray(shop.gallery).forEach(addImage);
  safeArray(shop.images).forEach(addImage);

  return images;
};

/* DELIVERY HELPERS */

const getDeliveryAvailability = (shop) => {
  if (!shop) {
    return false;
  }

  return Boolean(
    shop.deliveryAvailable ??
    shop.delivery?.available ??
    shop.delivery?.enabled ??
    shop.delivery ??
    false,
  );
};

const getDeliveryRadius = (shop) => {
  if (!shop) {
    return 0;
  }

  const value =
    shop.deliveryRadius ??
    shop.delivery?.radius ??
    shop.delivery?.deliveryRadius ??
    0;

  const radius = Number(value);

  return Number.isFinite(radius) && radius > 0 ? radius : 0;
};

/* MAIN COMPONENT */

function ShopInformation({ shop, onEdit }) {
  const { seller } = useAuth();

  const sellerName = seller?.ownerName || "Shop Owner";

  const [lightboxIndex, setLightboxIndex] = useState(null);

  const images = useMemo(() => getShopImages(shop), [shop]);

  const galleryImages = useMemo(() => getGalleryImages(shop), [shop]);

  /*  LIGHTBOX KEYBOARD CONTROLS */

  useEffect(() => {
    if (lightboxIndex === null) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setLightboxIndex(null);
      }

      if (event.key === "ArrowLeft") {
        setLightboxIndex((current) => {
          if (current === null || images.length === 0) {
            return current;
          }

          return (current - 1 + images.length) % images.length;
        });
      }

      if (event.key === "ArrowRight") {
        setLightboxIndex((current) => {
          if (current === null || images.length === 0) {
            return current;
          }

          return (current + 1) % images.length;
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, images.length]);

  /* IMAGE ACTIONS */

  const openImage = (url) => {
    const index = images.indexOf(url);

    if (index !== -1) {
      setLightboxIndex(index);
    }
  };

  const previousImage = () => {
    setLightboxIndex((current) => {
      if (current === null || images.length === 0) {
        return current;
      }

      return (current - 1 + images.length) % images.length;
    });
  };

  const nextImage = () => {
    setLightboxIndex((current) => {
      if (current === null || images.length === 0) {
        return current;
      }

      return (current + 1) % images.length;
    });
  };

  /* NO SHOP */

  if (!shop) {
    return (
      <div className="rounded-3xl border border-[#DDE4E2] bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#FF8C00]">
          <Store size={30} />
        </div>

        <h2 className="mt-5 text-2xl font-bold text-[#022B3A]">
          No shop information found
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#64748B]">
          Your shop information has not been created yet.
        </p>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="cursor-pointer mt-6 inline-flex items-center gap-2 rounded-xl bg-[#022B3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#033B4F]"
          >
            <Edit3 size={17} />
            Create Shop
          </button>
        )}
      </div>
    );
  }

  /*  DERIVED DATA */

  const shopName = safeString(shop.name, "Shop Name");

  const category = safeString(shop.category, "Local Shop");

  const description = safeString(
    shop.description,
    `Discover ${shopName}, a local ${category.toLowerCase()} serving customers in ${formatAddress(
      shop,
    )}.`,
  );

  const about = safeString(shop.about, "");

  const address = formatAddress(shop);

  const phone = getPhone(shop);

  const email = getEmail(shop);

  const openingHours = formatOpeningHours(
    shop.openingHours || shop.hours || shop.businessHours,
  );

  const facilities = safeArray(shop.facilities);

  const policies = safeArray(shop.policies);

  const paymentMethods = safeArray(
    shop.paymentMethods || shop.payment || shop.acceptedPayments,
  );

  const logo = extractImageUrl(shop.logo) || extractImageUrl(shop.image);

  const coverImage =
    extractImageUrl(shop.image) || extractImageUrl(shop.gallery?.[0]) || logo;

  const deliveryAvailable = getDeliveryAvailability(shop);

  const deliveryRadius = deliveryAvailable ? getDeliveryRadius(shop) : 0;

  const takeawayAvailable = Boolean(
    shop.takeawayAvailable ?? shop.takeAway ?? shop.takeaway ?? false,
  );

  const acceptsOrders = Boolean(
    shop.acceptOrders ?? shop.ordersEnabled ?? false,
  );

  const isVerified = Boolean(shop.isVerified ?? shop.verified);

  const isActive = Boolean(shop.isActive ?? true);

  const isSuspended = Boolean(shop.isSuspended);

  const registeredDate = formatDate(shop.registeredAt || shop.createdAt);

  return (
    <>
      <div className="space-y-7 pb-12">
        {/* PAGE HEADER */}

        <div className="flex flex-col gap-4 border-b border-[#E5E7EB] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#FF8C00]">
              Shop Management
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#022B3A] sm:text-4xl">
              Shop Information
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
              View and manage the important information, services, contact
              details and public details of your shop.
            </p>
          </div>

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="cursor-pointer inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#022B3A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#033B4F]"
            >
              <Edit3 size={17} />
              Edit Shop
            </button>
          )}
        </div>

        {/* SHOP PROFILE */}

        <section className="overflow-visible rounded-3xl bg-[#F8F9FA]">
          {/* COVER IMAGE */}

          <div className="relative h-[260px] overflow-hidden rounded-t-3xl sm:h-[330px] lg:h-[380px]">
            {coverImage ? (
              <button
                type="button"
                onClick={() => openImage(coverImage)}
                className="cursor-pointer group block h-full w-full cursor-pointer"
              >
                <img
                  src={coverImage}
                  alt={`${shopName} cover`}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/10" />
              </button>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#022B3A]">
                <span className="text-lg font-semibold text-white">
                  {shopName}
                </span>
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute bottom-28 left-5 sm:left-7">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-[#022B3A] shadow-lg backdrop-blur">
                <Store size={14} />
                {sellerName}'s Shop
              </span>
            </div>
          </div>

          {/* PROFILE CARD */}

          <div className="relative mx-auto -mt-20 max-w-7xl px-5 pb-8 lg:px-8">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl sm:p-6 lg:p-7">
              <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                {/* LEFT */}

                <div className="flex min-w-0 flex-col gap-6 sm:flex-row">
                  {/* LOGO */}

                  <button
                    type="button"
                    disabled={!logo}
                    onClick={() => {
                      if (logo) {
                        openImage(logo);
                      }
                    }}
                    className="cursor-pointer relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-[#FFF0D9] shadow-lg disabled:cursor-default sm:h-28 sm:w-28"
                  >
                    {logo ? (
                      <img
                        src={logo}
                        alt={`${shopName} logo`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#022B3A] text-3xl font-bold text-white">
                        {shopName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>

                  {/* PROFILE CONTENT */}

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold tracking-tight text-[#022B3A] sm:text-3xl">
                        {shopName}
                      </h2>

                      {isVerified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                          <ShieldCheck size={15} />
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm font-semibold text-[#FF8C00]">
                      {category}
                    </p>

                    <p className="mt-3 max-w-3xl text-sm leading-6 text-[#64748B] sm:text-base">
                      {description}
                    </p>

                    {/* STATUS */}

                    <div className="mt-5 flex flex-wrap gap-2">
                      <StatusBadge
                        active={isActive}
                        label={isActive ? "Active" : "Inactive"}
                      />

                      {isSuspended && (
                        <StatusBadge active={false} label="Suspended" />
                      )}

                      {acceptsOrders && (
                        <StatusBadge active label="Orders Enabled" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT THE SHOP */}

        {about && (
          <DashboardSection
            icon={<Store size={20} />}
            title="About the Shop"
            description="More information provided by the shop owner."
          >
            <div className="rounded-2xl border border-[#DDE4E2] bg-[#FAFAFA] p-5 sm:p-6">
              <p className="whitespace-pre-line text-sm leading-7 text-[#64748B] sm:text-base">
                {about}
              </p>
            </div>
          </DashboardSection>
        )}

        {/* CONTACT & LOCATION */}

        <DashboardSection
          icon={<MapPin size={20} />}
          title="Contact & Location"
          description="Important contact information and the registered location of your shop."
        >
          <div className="grid gap-4 md:grid-cols-3">
            {/* ADDRESS */}

            <ContactCard
              icon={MapPin}
              title="Shop Address"
              value={address}
              href={
                address !== "Address not available"
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      address,
                    )}`
                  : undefined
              }
            />

            {/* PHONE */}

            <ContactCard
              icon={Phone}
              title="Phone Number"
              value={phone || "Phone number not available"}
              href={phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : undefined}
            />

            {/* EMAIL */}

            <ContactCard
              icon={Mail}
              title="Email Address"
              value={email || "Email address not available"}
              href={email ? `mailto:${email}` : undefined}
            />
          </div>
        </DashboardSection>

        {/* BUSINESS DETAILS */}

        <DashboardSection
          icon={<Store size={20} />}
          title="Business Details"
          description="Essential information registered for your shop."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard icon={Store} title="Business Category" value={category} />

            <InfoCard
              icon={CalendarDays}
              title="Registered On"
              value={registeredDate}
            />

            <InfoCard
              icon={ShieldCheck}
              title="Verification"
              value={isVerified ? "Verified Shop" : "Verification Pending"}
              success={isVerified}
            />
          </div>
        </DashboardSection>

        {/*  BUSINESS HOURS */}

        <DashboardSection
          icon={<Clock3 size={20} />}
          title="Business Hours"
          description="Your current opening and closing schedule."
        >
          {openingHours.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {openingHours.map((item, index) => (
                <div
                  key={`${item.day}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-[#E2E7E5] bg-[#FAFAFA] p-4 transition hover:border-[#FF8C00]/40 hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100">
                      <Clock3 size={17} className="text-[#FF8C00]" />
                    </div>

                    <p className="text-sm font-semibold text-[#022B3A]">
                      {item.day}
                    </p>
                  </div>

                  <span
                    className={`text-right text-sm ${
                      item.value === "Closed"
                        ? "font-semibold text-red-500"
                        : "font-medium text-[#64748B]"
                    }`}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyValue text="Opening hours have not been specified yet." />
          )}
        </DashboardSection>

        {/*  SERVICES & ORDERING */}

        <DashboardSection
          icon={<Truck size={20} />}
          title="Services & Ordering"
          description="Services and ordering options currently offered by your shop."
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* ONLINE ORDERS */}

            <ServiceCard
              icon={Package}
              title="Online Orders"
              active={acceptsOrders}
              activeText="Customers can place orders"
              inactiveText="Online orders are disabled"
            />

            {/* HOME DELIVERY */}

            <ServiceCard
              icon={Truck}
              title="Home Delivery"
              active={deliveryAvailable}
              activeText={
                deliveryRadius > 0
                  ? `Available within ${deliveryRadius} km`
                  : "Delivery is available"
              }
              inactiveText="Delivery is unavailable"
            />

            {/* TAKEAWAY */}

            <ServiceCard
              icon={Store}
              title="Takeaway"
              active={takeawayAvailable}
              activeText="Customer pickup is available"
              inactiveText="Takeaway is unavailable"
            />
          </div>

          {/*  DELIVERY DETAILS*/}

          {deliveryAvailable && deliveryRadius > 0 && (
            <div className="mt-5">
              <InfoCard
                icon={MapPin}
                title="Delivery Radius"
                value={`${deliveryRadius} km`}
              />
            </div>
          )}

          {/* MINIMUM ORDER / PAYMENTS*/}

          {(shop.minimumOrder !== undefined || paymentMethods.length > 0) && (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {shop.minimumOrder !== undefined &&
                shop.minimumOrder !== null &&
                shop.minimumOrder !== "" && (
                  <InfoCard
                    icon={CreditCard}
                    title="Minimum Order"
                    value={`₹${Number(shop.minimumOrder).toFixed(2)}`}
                  />
                )}

              {paymentMethods.length > 0 && (
                <InfoCard
                  icon={CreditCard}
                  title="Accepted Payments"
                  value={paymentMethods
                    .map((method) => {
                      if (typeof method === "string") {
                        return method;
                      }

                      return (
                        method?.name || method?.label || safeObjectValue(method)
                      );
                    })
                    .join(", ")}
                />
              )}
            </div>
          )}
        </DashboardSection>

        {/* FACILITIES */}

        {facilities.length > 0 && (
          <DashboardSection
            icon={<Check size={20} />}
            title="Facilities & Amenities"
            description="Facilities available at your shop."
          >
            <div className="flex flex-wrap gap-3">
              {facilities.map((facility, index) => {
                const value =
                  typeof facility === "string"
                    ? facility
                    : facility?.name ||
                      facility?.label ||
                      safeObjectValue(facility);

                return (
                  <span
                    key={`${value}-${index}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-sm font-semibold text-[#FF8C00]"
                  >
                    <Check size={15} />
                    {value}
                  </span>
                );
              })}
            </div>
          </DashboardSection>
        )}

        {/* SHOP POLICIES */}

        {policies.length > 0 && (
          <DashboardSection
            icon={<ShieldCheck size={20} />}
            title="Shop Policies"
            description="Policies currently associated with your shop."
          >
            <div className="space-y-3">
              {policies.map((policy, index) => {
                const value =
                  typeof policy === "string"
                    ? policy
                    : policy?.text ||
                      policy?.description ||
                      policy?.name ||
                      safeObjectValue(policy);

                return (
                  <div
                    key={`${value}-${index}`}
                    className="flex items-start gap-4 rounded-2xl border border-[#E2E7E5] bg-[#FAFAFA] p-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[#FF8C00]">
                      <Check size={16} />
                    </div>

                    <p className="pt-1 text-sm leading-6 text-[#64748B]">
                      {value}
                    </p>
                  </div>
                );
              })}
            </div>
          </DashboardSection>
        )}

        {/* SHOP GALLERY */}

        <DashboardSection
          icon={<ImageIcon size={20} />}
          title="Shop Gallery"
          description="Photos associated with your shop."
        >
          {galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {galleryImages.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => openImage(image)}
                  className="cursor-pointer group relative h-40 overflow-hidden rounded-2xl bg-gray-100 sm:h-48"
                >
                  <img
                    src={image}
                    alt={`${shopName} gallery ${index + 1}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading={index < 4 ? "eager" : "lazy"}
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/25">
                    <div className="rounded-full bg-white/95 p-3 opacity-0 shadow-lg transition group-hover:opacity-100">
                      <ImageIcon size={20} className="text-[#022B3A]" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-[#FAFAFA] p-10 text-center">
              <ImageIcon size={38} className="mx-auto text-gray-300" />

              <p className="mt-3 text-sm font-medium text-[#64748B]">
                No shop images have been uploaded yet.
              </p>

              {onEdit && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="cursor-pointer mt-4 inline-flex items-center gap-2 rounded-xl border border-[#DDE4E2] bg-white px-4 py-2.5 text-sm font-semibold text-[#022B3A] transition hover:border-[#FF8C00] hover:text-[#FF8C00]"
                >
                  <Edit3 size={16} />
                  Add Images
                </button>
              )}
            </div>
          )}
        </DashboardSection>
      </div>

      {/* LIGHTBOX */}

      {lightboxIndex !== null && images.length > 0 && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Shop image viewer"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setLightboxIndex(null);
            }
          }}
        >
          {/* CLOSE */}

          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="cursor-pointer absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-7 sm:top-7"
            aria-label="Close image viewer"
          >
            <X size={24} />
          </button>

          {/* COUNTER */}

          <div className="absolute left-4 top-4 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur sm:left-7 sm:top-7">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* PREVIOUS */}

          {images.length > 1 && (
            <button
              type="button"
              onClick={previousImage}
              className="cursor-pointer absolute left-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:left-7 sm:h-14 sm:w-14"
              aria-label="Previous image"
            >
              <ChevronLeft size={30} />
            </button>
          )}

          {/* IMAGE */}

          <div className="flex max-h-[90vh] max-w-[92vw] items-center justify-center">
            <img
              src={images[lightboxIndex]}
              alt={`${shopName} enlarged`}
              className="max-h-[82vh] max-w-[88vw] rounded-xl object-contain shadow-2xl"
            />
          </div>

          {/* NEXT */}

          {images.length > 1 && (
            <button
              type="button"
              onClick={nextImage}
              className="cursor-pointer absolute right-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-7 sm:h-14 sm:w-14"
              aria-label="Next image"
            >
              <ChevronRight size={30} />
            </button>
          )}

          {/* THUMBNAILS */}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-2xl bg-black/40 p-2 backdrop-blur sm:bottom-6">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className={`cursor-pointer h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    index === lightboxIndex
                      ? "border-[#FF8C00]"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

/*  DASHBOARD SECTION */

function DashboardSection({ icon, title, description, children }) {
  return (
    <section className="rounded-3xl border border-[#DDE4E2] bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#FF8C00]">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[#022B3A]">{title}</h2>

          {description && (
            <p className="mt-1 text-sm leading-6 text-[#64748B]">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

/* CONTACT CARD */

function ContactCard({ icon: Icon, title, value, href }) {
  const content = (
    <>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#FF8C00]">
        <Icon size={20} />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
          {title}
        </p>

        <p className="mt-1 break-words text-sm font-semibold leading-6 text-[#022B3A]">
          {value}
        </p>

        {href && (
          <p className="mt-2 text-xs font-semibold text-[#FF8C00]">
            {title === "Shop Address"
              ? "View on map"
              : title === "Phone Number"
                ? "Call shop"
                : "Send email"}
          </p>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={title === "Shop Address" ? "_blank" : undefined}
        rel={title === "Shop Address" ? "noreferrer" : undefined}
        className="flex min-w-0 items-start gap-4 rounded-2xl border border-[#DDE4E2] bg-[#FAFAFA] p-5 transition hover:border-[#FF8C00]/40 hover:bg-white hover:shadow-sm"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex min-w-0 items-start gap-4 rounded-2xl border border-[#DDE4E2] bg-[#FAFAFA] p-5">
      {content}
    </div>
  );
}

/* INFO CARD */

function InfoCard({ icon: Icon, title, value, success = false }) {
  return (
    <div className="flex min-w-0 items-start gap-4 rounded-2xl border border-[#DDE4E2] bg-[#FAFAFA] p-5 transition hover:border-[#FF8C00]/40 hover:bg-white">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100">
        <Icon
          size={19}
          className={success ? "text-green-600" : "text-[#FF8C00]"}
        />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
          {title}
        </p>

        <p className="mt-1 break-words text-sm font-semibold leading-6 text-[#022B3A]">
          {safeString(value)}
        </p>
      </div>
    </div>
  );
}

/* SERVICE CARD */

function ServiceCard({ icon: Icon, title, active, activeText, inactiveText }) {
  return (
    <div className="rounded-2xl border border-[#DDE4E2] bg-[#FAFAFA] p-5 transition hover:border-[#FF8C00]/40 hover:bg-white">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
          <Icon size={19} className="text-[#FF8C00]" />
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
            active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {active ? "Available" : "Unavailable"}
        </span>
      </div>

      <h3 className="mt-4 text-sm font-bold text-[#022B3A]">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-[#64748B]">
        {active ? activeText : inactiveText}
      </p>
    </div>
  );
}

/* STATUS BADGE */

function StatusBadge({ active, label }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
        active ? "bg-green-100 text-green-700" : "bg-red-50 text-red-600"
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          active ? "bg-green-500" : "bg-red-400"
        }`}
      />

      {label}
    </span>
  );
}

/* EMPTY VALUE  */

function EmptyValue({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-[#FAFAFA] p-7 text-center">
      <p className="text-sm text-[#64748B]">{text}</p>
    </div>
  );
}

export default ShopInformation;
