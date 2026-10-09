import { ArrowRight, BarChart3, Package, Store, Users } from "lucide-react";
import { Link } from "react-router-dom";

function AboutShopOwners() {
  const benefits = [
    {
      icon: Store,
      title: "Digital storefront",
      text: "Give customers an online place to discover your local business.",
    },
    {
      icon: Package,
      title: "Manage products",
      text: "Showcase your products and make your offerings easier to find.",
    },
    {
      icon: Users,
      title: "Reach nearby customers",
      text: "Connect your business with people searching in your area.",
    },
    {
      icon: BarChart3,
      title: "Grow your presence",
      text: "Build visibility and create stronger relationships with local customers.",
    },
  ];

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="overflow-hidden rounded-[2rem] bg-[#022B3A]">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            {/* LEFT */}
            <div className="p-8 text-white sm:p-10 lg:p-14">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FF8C00]">
                <Store size={27} />
              </div>

              <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em] text-[#FF8C00]">
                For Shop Owners
              </p>

              <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
                Give your local business a digital presence.
              </h2>

              <p className="mt-5 leading-8 text-white/60">
                ShopLocal gives local businesses the tools to become easier to
                discover and connect with customers nearby.
              </p>

              <Link
                to="/seller/register"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#FF8C00] px-6 py-3.5 font-semibold text-white transition hover:bg-[#E67E00]"
              >
                Register Your Shop
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* RIGHT */}
            <div className="bg-[#F8F4E9] p-6 sm:p-10 lg:p-12">
              <div className="grid gap-5 sm:grid-cols-2">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;

                  return (
                    <div
                      key={benefit.title}
                      className="rounded-2xl bg-white p-5 shadow-sm"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#FF8C00]">
                        <Icon size={21} />
                      </div>

                      <h3 className="mt-5 font-bold text-[#022B3A]">
                        {benefit.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {benefit.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutShopOwners;
