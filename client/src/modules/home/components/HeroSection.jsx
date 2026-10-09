import { MapPin, Navigation, Store } from "lucide-react";

import { useLocation } from "../../../shared/context/LocationContext";
import HeroSectionImage from "../../../assets/herosection.png";

function HeroSection() {
  const { location, openLocationModal } = useLocation();

  return (
    <section className="relative overflow-hidden bg-[#F8F4E9]">
      {/* BACKGROUND DECORATION */}

      <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-[#FF8C00]/5 blur-3xl" />

      <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#022B3A]/5 blur-3xl" />

      {/* MAIN CONTAINER */}

      <div className="relative mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-10 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          {/*  LEFT CONTENT */}

          <div className="relative z-10 max-w-2xl">
            {/* Support Badge */}

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FF8C00]/20 bg-[#FF8C00]/10 px-3 py-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#FF8C00]">
                <Store size={12} strokeWidth={2.5} className="text-white" />
              </span>

              <span className="text-xs font-semibold text-[#022B3A] sm:text-sm">
                Support Local Businesses
              </span>
            </div>

            {/* Main Heading */}

            <h1 className="max-w-xl text-4xl font-bold leading-[1.1] tracking-tight text-[#022B3A] sm:text-5xl lg:text-6xl">
              Find Local Shops
              <br />
              <span className="text-[#022B3A]">Near You</span>
            </h1>

            {/* Description */}

            <p className="mt-5 max-w-lg text-base leading-7 text-[#022B3A]/65 sm:text-lg sm:leading-8">
              Discover trusted local shops and fresh products in your area.
            </p>

            {/* LOCATION SEARCH BOX */}

            <div className="mt-7 flex w-full max-w-xl flex-col gap-3 rounded-2xl bg-white p-2 shadow-[0_10px_35px_rgba(2,43,58,0.08)] sm:flex-row sm:items-center sm:rounded-xl">
              <button
                type="button"
                onClick={openLocationModal}
                className=" flex min-w-0 flex-1 items-center gap-3 px-3 py-2 text-left"
              >
                <MapPin
                  size={21}
                  strokeWidth={1.8}
                  className="shrink-0 text-[#022B3A]/60"
                />

                <span className="truncate text-sm text-[#022B3A] sm:text-base">
                  {location.label || "Enter your location"}
                </span>
              </button>

              <button
                type="button"
                onClick={openLocationModal}
                className="cursor-pointer flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FF8C00] px-5 text-sm font-semibold text-white"
              >
                <Navigation size={17} strokeWidth={2} />

                <span>Use My Location</span>
              </button>
            </div>
          </div>

          {/*RIGHT ILLUSTRATION */}

          <div className="relative flex min-h-[280px] items-center justify-center lg:min-h-[430px]">
            {/* HERO IMAGE + BACKGROUND SHAPE */}

            <div
              className="
      relative
      h-[85%]
      w-[85%]
      overflow-hidden
      rounded-[40px]
      bg-[#E8EEDC]
      sm:rounded-[60px]
    "
            >
              <img
                src={HeroSectionImage}
                alt="Discover local shops near you"
                className="h-full w-full object-contain"
              />

              {/*  LOCATION PIN DECORATION */}

              <div
                className="
        absolute
        right-[3%]
        top-[3%]
        z-20
        flex
        h-[clamp(56px,7vw,82px)]
        w-[clamp(56px,7vw,82px)]
        items-center
        justify-center
        rounded-full
        bg-[#FF8C00]
        shadow-[0_8px_20px_rgba(255,140,0,0.25)]
      "
              >
                <MapPin
                  strokeWidth={2.2}
                  className="
          h-[clamp(28px,3.5vw,38px)]
          w-[clamp(28px,3.5vw,38px)]
          text-white
        "
                  fill="white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
