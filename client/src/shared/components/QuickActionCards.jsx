import { ArrowRight, MapPin, Sparkles, Store, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function HomeActionCards() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <section className="bg-white">
      <div
        className="mx-auto max-w-7xl px-5
          pt-16
          pb-10
          sm:px-6
          sm:pt-20
          sm:pb-15
          lg:px-10
          lg:pt-24
          lg:pb-20"
      >
        {/* CARDS CONTAINER */}

        <div
          className={`
            grid
            gap-5
            ${!loading && !isAuthenticated ? "lg:grid-cols-2" : "lg:grid-cols-1"}
          `}
        >
          {/*---->>>>>
              LOGIN / SIGN UP CARD
              ONLY VISIBLE WHEN USER IS NOT LOGGED IN

              MOBILE:
              Appears BELOW contribution card

              DESKTOP:
              Appears on LEFT
           */}

          {!loading && !isAuthenticated && (
            <div
              className="
                order-2
                group
                relative
                overflow-hidden
                rounded-2xl
                bg-[#022B3A]
                p-6
                shadow-[0_12px_35px_rgba(2,43,58,0.12)]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-[0_18px_45px_rgba(2,43,58,0.18)]
                sm:p-8
                lg:order-1
              "
            >
              {/*----->>> DECORATIVE BACKGROUND */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-20
                  -top-20
                  h-52
                  w-52
                  rounded-full
                  border-[28px]
                  border-white/5
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-24
                  -right-10
                  h-52
                  w-52
                  rounded-full
                  bg-[#FF8C00]/5
                  blur-3xl
                "
              />

              {/*---->>> ICON */}

              <div
                className="
                  relative
                  z-10
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-white/10
                "
              >
                <UserRound
                  size={21}
                  strokeWidth={1.8}
                  className="text-[#FF8C00]"
                />
              </div>

              {/* CONTENT */}

              <div className="relative z-10 mt-5 max-w-xl">
                {/* Label */}

                <p className="text-xs font-semibold uppercase tracking-wider text-[#FF8C00]">
                  Discover More
                </p>

                {/* Heading */}

                <h2
                  className="
                    mt-2
                    max-w-lg
                    text-2xl
                    font-bold
                    leading-tight
                    text-white
                    sm:text-3xl
                  "
                >
                  Find local shops and products near you.
                </h2>

                {/* Description */}

                <p
                  className="
                    mt-3
                    max-w-lg
                    text-sm
                    leading-6
                    text-white/60
                    sm:text-base
                  "
                >
                  Create your ShopLocal account and discover businesses
                  and products around your location.
                </p>

                {/* ACTIONS */}

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {/* Login */}

                  <Link
                    to="/login"
                    className="
                      group/login
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-[#FF8C00]
                      px-5
                      py-3
                      text-sm
                      font-semibold
                      text-white
                      shadow-sm
                      transition-all
                      duration-200
                      hover:bg-[#e67d00]
                      hover:shadow-lg
                      active:scale-[0.98]
                    "
                  >
                    Login
                    <ArrowRight
                      size={16}
                      strokeWidth={2}
                      className="
                        transition-transform
                        duration-200
                        group-hover/login:translate-x-1
                      "
                    />
                  </Link>

                  {/* Sign Up */}

                  <Link
                    to="/signup"
                    className="
                      inline-flex
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-white/15
                      bg-white/5
                      px-5
                      py-3
                      text-sm
                      font-semibold
                      text-white/90
                      transition-all
                      duration-200
                      hover:border-white/25
                      hover:bg-white/10
                      hover:text-white
                    "
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/*---->>>
              CONTRIBUTION CARD
              ALWAYS VISIBLE

              MOBILE:
              Appears ABOVE login card

              DESKTOP:
              Appears on RIGHT
          */}

          <div
            className={`
              order-1
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-[#022B3A]/10
              bg-[#F8F4E9]
              shadow-[0_10px_30px_rgba(2,43,58,0.06)]
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-[#FF8C00]/20
              hover:shadow-[0_16px_40px_rgba(2,43,58,0.10)]
              ${!loading && isAuthenticated ? "lg:px-12 lg:py-10" : ""}
              p-6
              sm:p-8
              lg:order-2
            `}
          >
            {/* DECORATIVE BACKGROUND */}

            <div
              className="
                pointer-events-none
                absolute
                -right-16
                -top-16
                h-48
                w-48
                rounded-full
                bg-[#FF8C00]/10
                blur-3xl
              "
            />

            <div
              className="
                pointer-events-none
                absolute
                -bottom-24
                -left-16
                h-52
                w-52
                rounded-full
                bg-[#022B3A]/5
                blur-3xl
              "
            />

            {/* Large Decorative Map Icon */}

            <div
              className="
                pointer-events-none
                absolute
                right-6
                top-6
                hidden
                opacity-[0.055]
                sm:block
              "
            >
              <MapPin size={100} strokeWidth={1.2} className="text-[#022B3A]" />
            </div>

            {/* MAIN CONTENT */}

            <div
              className={`
                relative
                z-10
                ${
                  !loading && isAuthenticated
                    ? "lg:flex lg:items-center lg:justify-between lg:gap-10"
                    : ""
                }
              `}
            >
              {/* Left Content */}

              <div
                className={`
                  max-w-xl
                  ${!loading && isAuthenticated ? "lg:max-w-2xl" : ""}
                `}
              >
                {/* Icon */}

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#FF8C00]/10
                  "
                >
                  <Sparkles
                    size={21}
                    strokeWidth={1.8}
                    className="text-[#FF8C00]"
                  />
                </div>

                {/* Label */}

                <p
                  className="
                    mt-5
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wider
                    text-[#FF8C00]
                  "
                >
                  Help Us Build ShopLocal
                </p>

                {/* Heading */}

                <h2
                  className="
                    mt-2
                    text-2xl
                    font-bold
                    leading-tight
                    text-[#022B3A]
                    sm:text-3xl
                  "
                >
                  Know a local shop we're missing?
                </h2>

                {/* Description */}

                <p
                  className="
                    mt-3
                    max-w-xl
                    text-sm
                    leading-6
                    text-[#022B3A]/60
                    sm:text-base
                  "
                >
                  Help people in your community discover more local businesses
                  by sharing information about places you know.
                </p>

                {/* CONTRIBUTION TYPES */}

                <div className="mt-5 flex flex-wrap gap-2">
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      border-[#022B3A]/10
                      bg-white
                      px-3
                      py-1.5
                      text-xs
                      font-medium
                      text-[#022B3A]/70
                    "
                  >
                    <Store
                      size={13}
                      strokeWidth={1.8}
                      className="text-[#FF8C00]"
                    />
                    Local Shops
                  </span>
                </div>
              </div>

              {/* CONTRIBUTION ACTION */}

              <div
                className={`
                  mt-6
                  ${!loading && isAuthenticated ? "lg:mt-0 lg:shrink-0" : ""}
                `}
              >
                <Link
                  to="/contribute"
                  className="
                    group/contribute
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#022B3A]
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition-all
                    duration-200
                    hover:bg-[#03465d]
                    hover:shadow-lg
                    active:scale-[0.98]
                    sm:w-auto
                    sm:px-6
                    sm:py-3.5
                  "
                >
                  Contribute Information
                  <ArrowRight
                    size={16}
                    strokeWidth={2}
                    className="
                      transition-transform
                      duration-200
                      group-hover/contribute:translate-x-1
                    "
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeActionCards;
