import { Heart, MapPinned, Users } from "lucide-react";

function AboutMission() {
  const values = [
    {
      icon: MapPinned,
      title: "Local Discovery",
      description:
        "Make it easier for people to find useful shops and products around them.",
    },
    {
      icon: Users,
      title: "Community First",
      description:
        "Create stronger connections between customers, shop owners, and local communities.",
    },
    {
      icon: Heart,
      title: "Support Local",
      description:
        "Help local businesses gain visibility and give customers more reasons to shop nearby.",
    },
  ];

  return (
    <section className="bg-[#F8F4E9] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#FF8C00]">
            Our Mission
          </p>

          <h2 className="mt-3 text-3xl font-bold leading-tight text-[#022B3A] sm:text-4xl">
            Making local commerce easier for everyone.
          </h2>

          <p className="mt-5 text-base leading-8 text-gray-600 sm:text-lg">
            ShopLocal was created with a simple idea: local businesses should be
            easy to discover, and people should be able to find what they need
            close to home.
          </p>
        </div>

        {/* Values */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {values.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-3xl bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF0D9] text-[#FF8C00]">
                  <Icon size={23} />
                </div>

                <h3 className="mt-6 text-xl font-bold text-[#022B3A]">
                  {item.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default AboutMission;
