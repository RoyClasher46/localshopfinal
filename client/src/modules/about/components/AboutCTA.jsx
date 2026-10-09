import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

function AboutCTA() {
  return (
    <section className="bg-[#F8F4E9] px-5 pb-20 pt-4 sm:px-8 sm:pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#FF8C00] px-6 py-14 text-center text-white sm:px-10 lg:px-16">
          {/* Decorative circles */}
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-black/5" />

          <div className="relative mx-auto max-w-3xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
              <MapPin size={27} />
            </div>

            <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
              Start exploring your local community.
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-7 text-white/85">
              Discover nearby shops, find products you need, and experience the
              businesses that make your neighborhood unique.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/shops"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#022B3A] px-6 py-3.5 font-semibold text-white transition hover:bg-[#0A3A4A]"
              >
                Explore Shops
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutCTA;
