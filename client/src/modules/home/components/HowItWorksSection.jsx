import {
  MapPin,
  Search,
  ShoppingBag,
  PackageCheck,
  ArrowRight,
} from "lucide-react";

function HowItWorksSection() {
  const steps = [
    {
      id: 1,
      icon: MapPin,
      title: "Choose Your Location",
      description:
        "Enter your location or use GPS to find local businesses near you.",
    },
    {
      id: 2,
      icon: Search,
      title: "Discover Local Shops",
      description:
        "Explore nearby shops and products based on your location.",
    },
    {
      id: 3,
      icon: ShoppingBag,
      title: "Explore & Order",
      description:
        "Browse products from registered shops and place an order or choose take-away.",
    },
    {
      id: 4,
      icon: PackageCheck,
      title: "Get Your Products",
      description:
        "Track your order and collect your products through the available fulfilment option.",
    },
  ];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-12 lg:px-10">
        {/* ECTION HEADER */}

        <div className="mx-auto mb-8 max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#FF8C00]">
            Simple & Convenient
          </span>

          <h2 className="mt-2 text-xl font-bold text-[#022B3A] sm:text-2xl">
            How ShopLocal Works
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#022B3A]/55">
            Discover and connect with local businesses in just a few simple
            steps.
          </p>
        </div>

        {/*  STEPS */}

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.id} className="relative text-center">
                {/*  ICON */}

                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#FF8C00]/20 bg-[#FFF3E5]">
                  <Icon
                    size={27}
                    strokeWidth={1.7}
                    className="text-[#FF8C00]"
                  />

                  {/* Step Number */}

                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#022B3A] text-[10px] font-bold text-white">
                    {step.id}
                  </span>
                </div>

                {/* CONTENT */}

                <h3 className="mt-4 text-sm font-bold text-[#022B3A] sm:text-base">
                  {step.title}
                </h3>

                <p className="mx-auto mt-2 max-w-xs text-xs leading-5 text-[#022B3A]/55 sm:text-sm sm:leading-6">
                  {step.description}
                </p>

                {/* CONNECTOR ARROW */}

                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-7 hidden translate-x-1/2 lg:block">
                    <ArrowRight
                      size={18}
                      strokeWidth={1.5}
                      className="text-[#022B3A]/20"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
