import { MapPin, Search, Store, ShoppingBag } from "lucide-react";

function AboutHowItWorks() {
  const steps = [
    {
      number: "01",
      icon: MapPin,
      title: "Choose your location",
      description:
        "Set your current location or search for an area you want to explore.",
    },
    {
      number: "02",
      icon: Search,
      title: "Discover what you need",
      description:
        "Search for shops, products, and categories around you.",
    },
    {
      number: "03",
      icon: Store,
      title: "Explore local businesses",
      description:
        "View shop details, products, ratings, reviews, and available services.",
    },
    {
      number: "04",
      icon: ShoppingBag,
      title: "Shop local",
      description:
        "Choose nearby businesses and support the people who make your community unique.",
    },
  ];

  return (
    <section className="bg-[#022B3A] py-20 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#FF8C00]">
            How It Works
          </p>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            From discovery to local shopping.
          </h2>

          <p className="mt-5 leading-8 text-white/60">
            ShopLocal keeps the experience simple so you can spend less time
            searching and more time discovering your community.
          </p>
        </div>

        <div className="relative mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Connecting line */}
          <div className="absolute left-[12%] right-[12%] top-10 hidden h-px bg-white/10 lg:block" />

          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div key={step.number} className="relative text-center">
                <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#FF8C00]/30 bg-[#0A3A4A] text-[#FF8C00]">
                  <Icon size={27} />

                  <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#FF8C00] text-xs font-bold text-white">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-bold">{step.title}</h3>

                <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-white/60">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default AboutHowItWorks;
