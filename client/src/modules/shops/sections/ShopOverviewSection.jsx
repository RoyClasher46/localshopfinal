import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Info,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Store,
  Truck,
  User,
  XCircle,
} from "lucide-react";

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

const formatDate = (value) => {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatAvailability = (value) => {
  return value ? "Available" : "Not Available";
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
      <p className="mt-1 break-words text-base font-medium text-[#022B3A]">
        {displayValue(fallback)}
      </p>
    );
  }

  return (
    <div className="mt-3 w-full min-w-0 overflow-x-auto">
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

function InfoCard({ icon: Icon, title, value, children }) {
  return (
    <div className="flex h-fit min-w-0 items-start gap-3 sm:gap-4 self-start rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 transition hover:border-[#FF8C00]/50 hover:shadow-md">
      <div className="shrink-0 rounded-xl bg-orange-100 p-3">
        <Icon className="text-[#FF8C00]" size={22} />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="break-words text-sm font-semibold uppercase tracking-wide text-gray-500">
          {title}
        </h4>

        {children || (
          <p className="mt-1 break-words [overflow-wrap:anywhere] text-base font-medium text-[#022B3A]">
            {displayValue(value)}
          </p>
        )}
      </div>
    </div>
  );
}

function BooleanInfoCard({ icon: Icon, title, value }) {
  const available = Boolean(value);

  return (
    <div className="flex h-fit min-w-0 items-start gap-3 self-start rounded-2xl border border-gray-200 bg-white p-4 sm:gap-4 sm:p-5 transition hover:border-[#FF8C00]/50 hover:shadow-md">
      <div className="shrink-0 rounded-xl bg-orange-100 p-3">
        <Icon className="text-[#FF8C00]" size={22} />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="break-words text-sm font-semibold uppercase tracking-wide text-gray-500">
          {title}
        </h4>

        <div className="mt-2 flex min-w-0 items-center gap-2">
          {available ? (
            <CheckCircle2 size={18} className="shrink-0 text-green-600" />
          ) : (
            <XCircle size={18} className="shrink-0 text-red-500" />
          )}

          <span
            className={`break-words [overflow-wrap:anywhere] text-base font-medium ${
              available ? "text-green-600" : "text-gray-500"
            }`}
          >
            {available ? "Available" : "Not Available"}
          </span>
        </div>
      </div>
    </div>
  );
}

function ShopOverviewSection({ shop }) {
  if (!shop) {
    return null;
  }

  const isCommunityListed = Boolean(shop.isCommunityListed);

  const name = displayValue(shop.name, "This Shop");

  const about =
    shop.about ||
    shop.description ||
    `Learn more about ${name} and the services available at this shop.`;

  const owner = displayValue(shop.owner);

  const category = displayValue(shop.category);

  const phone = displayValue(shop.phone);

  const email = displayValue(shop.email);

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

  const rating = Number(shop.rating);

  const reviews = Number(shop.reviews);

  const ratingText = Number.isFinite(rating) ? rating.toFixed(1) : "N/A";

  const reviewText =
    Number.isFinite(reviews) && reviews >= 0
      ? `${reviews} ${reviews === 1 ? "Review" : "Reviews"}`
      : "Reviews not specified";

  const deliveryAvailable = Boolean(shop.delivery);

  const takeawayAvailable = Boolean(shop.takeaway ?? shop.takeAway);

  const deliveryRadius = shop.deliveryRadius;

  const isVerified = Boolean(shop.verified);

  const isRegistered =
    shop.registered === undefined ? true : Boolean(shop.registered);

  const memberSince = formatDate(shop.memberSince);

  let paymentValue = shop.payment;

  if (Array.isArray(shop.paymentMethods)) {
    paymentValue = shop.paymentMethods.join(", ");
  } else if (Array.isArray(shop.paymentOptions)) {
    paymentValue = shop.paymentOptions.join(", ");
  }

  paymentValue = displayValue(paymentValue);

  const facilities = Array.isArray(shop.facilities)
    ? shop.facilities.filter(Boolean)
    : [];

  const policies = Array.isArray(shop.policies)
    ? shop.policies.filter(Boolean)
    : [];

  const website = shop.website || shop.websiteUrl || "";

  const gstNumber = shop.gstNumber || shop.gst || "";

  const businessType = shop.businessType || "";

  const contactPerson =
    shop.contactPerson || shop.contactName || shop.ownerName || "";

  return (
    <section className="overflow-x-hidden bg-[#F8F9FA] py-10 sm:py-12 lg:py-14">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-5 lg:px-8">
        {/* HEADING */}

        <div className="mb-8 sm:mb-10">
          <h2 className="break-words text-2xl font-bold text-[#022B3A] sm:text-3xl">
            Shop Overview
          </h2>

          <p className="mt-2 break-words text-gray-600">
            Everything you need to know before shopping.
          </p>
        </div>

        {/* ABOUT */}

        <div className="min-w-0 rounded-3xl bg-white p-5 shadow-sm sm:p-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shrink-0 rounded-xl bg-orange-100 p-3">
              <Info className="text-[#FF8C00]" size={22} />
            </div>

            <h3 className="min-w-0 break-words text-lg font-bold text-[#022B3A] sm:text-xl">
              About This Shop
            </h3>
          </div>

          <p className="mt-5 break-words [overflow-wrap:anywhere] whitespace-pre-line leading-8 text-gray-600">
            {about}
          </p>
        </div>

        {/* BASIC INFORMATION */}

        <div className="mt-8 sm:mt-10">
          <h3 className="mb-5 break-words text-lg font-bold text-[#022B3A] sm:text-xl">
            Business Information
          </h3>

          {/* COMMUNITY-LISTED LAYOUT */}

          {isCommunityListed ? (
            <div className="grid min-w-0 grid-cols-1 items-start gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              <InfoCard icon={Store} title="Category" value={category} />

              <InfoCard icon={Phone} title="Phone" value={phone} />

              <div className="min-w-0 md:col-span-2 xl:col-span-1">
                <InfoCard icon={Mail} title="Email" value={email} />
              </div>

              <div className="min-w-0 md:col-span-2 xl:col-span-3">
                <InfoCard
                  icon={MapPin}
                  title="Address"
                  value={addressWithPincode}
                />
              </div>

              <InfoCard icon={Clock3} title="Working Hours">
                <WorkingHoursTable shop={shop} />
              </InfoCard>

              <InfoCard
                icon={ShieldCheck}
                title="Verification"
                value={
                  isVerified ? "Verified Business" : "Verification Pending"
                }
              />

              <InfoCard icon={MapPin} title="Community Listed" value="Yes" />
            </div>
          ) : (
            <div className="grid min-w-0 grid-cols-1 items-start gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {/* OWNER */}

              <InfoCard icon={User} title="Owner" value={owner} />

              {/* CATEGORY */}

              <InfoCard icon={Store} title="Category" value={category} />

              {/* BUSINESS TYPE */}

              {businessType && (
                <InfoCard
                  icon={Store}
                  title="Business Type"
                  value={businessType}
                />
              )}

              {/* PHONE */}

              <InfoCard icon={Phone} title="Phone" value={phone} />

              {/* EMAIL */}

              <InfoCard icon={Mail} title="Email" value={email} />

              {/* CONTACT PERSON */}

              {contactPerson && (
                <InfoCard
                  icon={User}
                  title="Contact Person"
                  value={contactPerson}
                />
              )}

              {/* ADDRESS */}

              <InfoCard
                icon={MapPin}
                title="Address"
                value={addressWithPincode}
              />

              {/* MEMBER SINCE */}

              <InfoCard
                icon={CalendarDays}
                title="Member Since"
                value={memberSince}
              />

              {/* WORKING HOURS */}

              <InfoCard icon={Clock3} title="Working Hours">
                <WorkingHoursTable shop={shop} />
              </InfoCard>

              {/* VERIFICATION */}

              <InfoCard
                icon={ShieldCheck}
                title="Verification"
                value={
                  isVerified ? "Verified Business" : "Verification Pending"
                }
              />

              {/* REGISTRATION */}

              <InfoCard
                icon={Store}
                title="Registration"
                value={isRegistered ? "Registered Business" : "Not Registered"}
              />
            </div>
          )}
        </div>

        {!isCommunityListed && (
          <div className="mt-8 sm:mt-10">
            <h3 className="mb-5 break-words text-lg font-bold text-[#022B3A] sm:text-xl">
              Services & Availability
            </h3>

            <div className="grid min-w-0 grid-cols-1 items-start gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              <BooleanInfoCard
                icon={Truck}
                title="Delivery"
                value={deliveryAvailable}
              />

              <BooleanInfoCard
                icon={Package}
                title="Take Away"
                value={takeawayAvailable}
              />

              {deliveryAvailable && (
                <InfoCard
                  icon={Truck}
                  title="Delivery Radius"
                  value={
                    deliveryRadius !== null &&
                    deliveryRadius !== undefined &&
                    deliveryRadius !== ""
                      ? `${deliveryRadius} km`
                      : "Not specified"
                  }
                />
              )}

              <InfoCard
                icon={CreditCard}
                title="Payment"
                value={paymentValue}
              />

              <InfoCard
                icon={ShieldCheck}
                title="Verification"
                value={
                  isVerified ? "Verified Business" : "Verification Pending"
                }
              />

              <InfoCard
                icon={Store}
                title="Registration"
                value={isRegistered ? "Registered Business" : "Not Registered"}
              />
            </div>
          </div>
        )}

        {!isCommunityListed && (website || gstNumber) && (
          <div className="mt-8 sm:mt-10">
            <h3 className="mb-5 break-words text-lg font-bold text-[#022B3A] sm:text-xl">
              Additional Information
            </h3>

            <div className="grid min-w-0 grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2">
              {website && (
                <InfoCard icon={Store} title="Website" value={website} />
              )}

              {gstNumber && (
                <InfoCard
                  icon={CreditCard}
                  title="GST Number"
                  value={gstNumber}
                />
              )}
            </div>
          </div>
        )}

        {!isCommunityListed && (
          <div className="mt-10 min-w-0 rounded-3xl bg-white p-5 shadow-sm sm:mt-12 sm:p-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="shrink-0 rounded-xl bg-orange-100 p-3">
                <Store className="text-[#FF8C00]" size={22} />
              </div>

              <div className="min-w-0">
                <h3 className="break-words text-lg font-bold text-[#022B3A] sm:text-xl">
                  Facilities
                </h3>

                <p className="mt-1 break-words text-sm text-gray-500">
                  Facilities and amenities provided by this shop.
                </p>
              </div>
            </div>

            {facilities.length > 0 ? (
              <div className="mt-6 flex min-w-0 flex-wrap gap-3">
                {facilities.map((facility, index) => (
                  <span
                    key={`${String(facility)}-${index}`}
                    className="max-w-full break-words rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-[#FF8C00] sm:px-5"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-6 break-words text-gray-500">
                No facilities have been specified for this shop.
              </p>
            )}
          </div>
        )}

        {!isCommunityListed && (
          <div className="mt-8 min-w-0 rounded-3xl bg-white p-5 shadow-sm sm:mt-10 sm:p-8">
            <div className="flex min-w-0 items-center gap-3">
              <div className="shrink-0 rounded-xl bg-orange-100 p-3">
                <ShieldCheck className="text-[#FF8C00]" size={22} />
              </div>

              <div className="min-w-0">
                <h3 className="break-words text-lg font-bold text-[#022B3A] sm:text-xl">
                  Shop Policies
                </h3>

                <p className="mt-1 break-words text-sm text-gray-500">
                  Important policies and conditions from this shop.
                </p>
              </div>
            </div>

            {policies.length > 0 ? (
              <ul className="mt-6 space-y-4">
                {policies.map((policy, index) => (
                  <li
                    key={`${String(policy)}-${index}`}
                    className="flex min-w-0 items-start gap-3 text-gray-600"
                  >
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#FF8C00]" />

                    <span className="min-w-0 break-words [overflow-wrap:anywhere] leading-7">
                      {policy}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 break-words text-gray-500">
                No shop policies have been specified.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default ShopOverviewSection;
