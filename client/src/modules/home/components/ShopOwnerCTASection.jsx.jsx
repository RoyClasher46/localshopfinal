import { Store, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

function ShopOwnerCTASection() {
  const benefits = [
    "Create your digital storefront",
    "Reach nearby customers",
    "Manage products and orders",
  ];

  return (
    <section className="bg-[#F8F4E9]">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:px-10">
        <div className="relative overflow-hidden rounded-2xl bg-[#022B3A] px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          {/* Decorative Circle */}

          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border-[30px] border-[#FF8C00]/10" />

          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-[#FF8C00]/5" />

          {/* Content */}

          <div className="relative z-10 flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
            {/* Left Content */}

            <div className="max-w-2xl">
              {/* Small Label */}

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <Store size={14} className="text-[#FF8C00]" />

                <span className="text-xs font-semibold text-white/80">
                  For Local Shop Owners
                </span>
              </div>

              {/* Heading */}

              <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                Bring Your Local Shop
                <span className="text-[#FF8C00]"> Online</span>
              </h2>

              {/* Description */}

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
                Join ShopLocal and connect your business with customers looking
                for local products and services in your area.
              </p>

              {/* Benefits */}

              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="shrink-0 text-[#FF8C00]"
                    />

                    <span className="text-xs text-white/65 sm:text-sm">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}

            <Link
              to="/seller/register"
              className="
                group
                flex
                shrink-0
                items-center
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
                sm:px-6
                sm:py-3.5
              "
            >
              Register Your Shop
              <ArrowRight
                size={17}
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-1
                "
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ShopOwnerCTASection;
