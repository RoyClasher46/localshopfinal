import { ArrowRight, MapPin, Store } from "lucide-react";
import { Link } from "react-router-dom";

function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-[#022B3A] text-white">
      {/* Decorative shapes */}
      <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#FF8C00]/10" />
      <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#FF8C00]/5" />

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* LEFT */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#FF8C00]/30 bg-[#FF8C00]/10 px-4 py-2 text-sm font-medium text-[#FFB347]">
              <MapPin size={16} />
              Built for local communities
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Bringing your
              <span className="text-[#FF8C00]"> local world </span>
              closer.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/70 sm:text-lg">
              ShopLocal helps people discover nearby shops and products while
              giving local businesses a simple way to connect with their
              community.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/shops"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF8C00] px-6 py-3.5 font-semibold text-white transition hover:bg-[#E67E00]"
              >
                Explore Local Shops
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/seller/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 font-semibold text-white transition hover:border-[#FF8C00] hover:bg-white/10"
              >
                <Store size={18} />
                List Your Shop
              </Link>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative">
            <div className="mx-auto max-w-lg rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-sm">
              <div className="rounded-[1.5rem] bg-[#F8F4E9] p-6">
                {/* Fake map */}
                <div className="relative h-[330px] overflow-hidden rounded-2xl bg-[#E6E1D5]">
                  {/* Map lines */}
                  <div className="absolute left-[18%] top-0 h-full w-3 rotate-[18deg] bg-white/70" />
                  <div className="absolute left-[48%] top-0 h-full w-5 -rotate-[32deg] bg-white/70" />
                  <div className="absolute left-0 top-[35%] h-5 w-full rotate-[7deg] bg-white/70" />
                  <div className="absolute left-0 top-[68%] h-4 w-full -rotate-[10deg] bg-white/70" />

                  {/* Location cards */}
                  <div className="absolute left-[15%] top-[18%] rounded-xl bg-white p-3 shadow-lg">
                    <Store size={22} className="text-[#FF8C00]" />
                  </div>

                  <div className="absolute right-[17%] top-[35%] rounded-xl bg-white p-3 shadow-lg">
                    <Store size={22} className="text-[#FF8C00]" />
                  </div>

                  <div className="absolute bottom-[20%] left-[42%] flex h-12 w-12 items-center justify-center rounded-full bg-[#FF8C00] text-white shadow-lg">
                    <MapPin size={25} />
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-white p-4 shadow-xl">
                    <p className="text-sm font-bold text-[#022B3A]">
                      Local shops near you
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Discover businesses around your location.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-5 -left-3 rounded-2xl bg-white px-5 py-4 text-[#022B3A] shadow-xl sm:left-0">
              <p className="text-xs font-medium text-gray-500">
                Your neighborhood
              </p>

              <p className="mt-1 font-bold">One place to explore</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutHero;
