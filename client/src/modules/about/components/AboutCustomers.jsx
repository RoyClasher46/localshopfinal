import { ArrowRight, Heart, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

function AboutCustomers() {
  return (
    <section className="bg-[#F8F4E9] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Visual */}
          <div className="order-2 lg:order-1">
            <div className="rounded-[2rem] bg-[#022B3A] p-5 shadow-xl">
              <div className="rounded-[1.5rem] bg-white p-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#FF8C00]">
                    <Search size={21} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#022B3A]">
                      Search nearby
                    </p>

                    <p className="text-xs text-gray-500">
                      Find what you need locally
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {["Fresh Market", "Local Bakery", "Grocery Store"].map(
                    (item, index) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-xl bg-[#F8F4E9] p-4"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#022B3A]">
                            {item}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {index + 1}.2 km away
                          </p>
                        </div>

                        <ArrowRight size={17} className="text-[#FF8C00]" />
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#FF8C00]">
              For Customers
            </p>

            <h2 className="mt-3 text-3xl font-bold leading-tight text-[#022B3A] sm:text-4xl">
              Your neighborhood is full of things worth discovering.
            </h2>

            <p className="mt-5 leading-8 text-gray-600">
              ShopLocal helps you find nearby businesses without having to
              search across multiple platforms. Discover places around you,
              explore their offerings, and make more informed local choices.
            </p>

            <div className="mt-8 space-y-5">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#FF8C00]">
                  <Search size={19} />
                </div>

                <div>
                  <h3 className="font-bold text-[#022B3A]">
                    Discover with ease
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Search for nearby shops and products in one place.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#FF8C00]">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <h3 className="font-bold text-[#022B3A]">
                    Make informed choices
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    View shop information, products, ratings, and customer
                    reviews.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#FF8C00]">
                  <Heart size={19} />
                </div>

                <div>
                  <h3 className="font-bold text-[#022B3A]">
                    Support your community
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    Every local purchase helps strengthen the businesses and
                    people around you.
                  </p>
                </div>
              </div>
            </div>

            <Link
              to="/shops"
              className="mt-8 inline-flex items-center gap-2 font-semibold text-[#FF8C00] hover:underline"
            >
              Explore shops
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutCustomers;
