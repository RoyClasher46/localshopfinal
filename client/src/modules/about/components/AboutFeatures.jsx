import {
  Compass,
  MapPin,
  Search,
  ShoppingBag,
  Store,
  Star,
} from "lucide-react";

function AboutFeatures() {
  const features = [
    {
      icon: Search,
      title: "Discover Nearby",
      description:
        "Search for shops, products, and local businesses based on what you need.",
    },
    {
      icon: MapPin,
      title: "Location-Based",
      description:
        "Find relevant places around your current location or selected area.",
    },
    {
      icon: Store,
      title: "Digital Storefronts",
      description:
        "Explore local shops through their digital storefronts and product listings.",
    },
    {
      icon: ShoppingBag,
      title: "Shop Locally",
      description:
        "Discover products from nearby businesses and support your local economy.",
    },
    {
      icon: Star,
      title: "Trusted Reviews",
      description:
        "Read honest ratings and reviews from community shoppers before you visit.",
    },
    {
      icon: Compass,
      title: "Explore Your Area",
      description:
        "Turn your neighborhood into something easier and more interesting to explore.",
    },
  ];

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#FF8C00]">
            What ShopLocal Offers
          </p>

          <h2 className="mt-3 text-3xl font-bold text-[#022B3A] sm:text-4xl">
            Everything you need to explore local commerce.
          </h2>

          <p className="mt-5 leading-8 text-gray-600">
            From finding a nearby store to ordering everyday essentials,
            ShopLocal brings local experiences together in one place.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-3xl border border-gray-100 bg-[#F8F4E9]/50 p-7 transition hover:border-[#FF8C00]/30 hover:bg-[#FFF0D9]/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#022B3A] text-white transition group-hover:bg-[#FF8C00]">
                  <Icon size={22} />
                </div>

                <h3 className="mt-6 text-lg font-bold text-[#022B3A]">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default AboutFeatures;
