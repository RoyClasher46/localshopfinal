import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBasket,
  Croissant,
  Pill,
  Shirt,
  Laptop,
  Wrench,
  Smartphone,
  Sparkles,
  Baby,
  BookOpen,
  Apple,
  Milk,
  Fish,
  Utensils,
  Coffee,
  Candy,
  Footprints,
  Gem,
  Sofa,
  Pencil,
  Dumbbell,
  ToyBrick,
  PawPrint,
  Flower2,
  Lightbulb,
  Car,
  Cable,
  Scissors,
  WashingMachine,
  Gift,
} from "lucide-react";

function CategorySection() {
  const navigate = useNavigate();

  const scrollContainerRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const categories = [
    {
      id: 1,
      name: "Grocery",
      icon: ShoppingBasket,
    },
    {
      id: 2,
      name: "Bakery",
      icon: Croissant,
    },
    {
      id: 3,
      name: "Fruits & Vegetables",
      icon: Apple,
    },
    {
      id: 4,
      name: "Dairy",
      icon: Milk,
    },
    {
      id: 5,
      name: "Meat & Fish",
      icon: Fish,
    },
    {
      id: 6,
      name: "Restaurants",
      icon: Utensils,
    },
    {
      id: 7,
      name: "Cafés",
      icon: Coffee,
    },
    {
      id: 8,
      name: "Sweets & Snacks",
      icon: Candy,
    },
    {
      id: 9,
      name: "Medical",
      icon: Pill,
    },
    {
      id: 10,
      name: "Fashion",
      icon: Shirt,
    },
    {
      id: 11,
      name: "Footwear",
      icon: Footprints,
    },
    {
      id: 12,
      name: "Jewellery",
      icon: Gem,
    },
    {
      id: 13,
      name: "Electronics",
      icon: Laptop,
    },
    {
      id: 14,
      name: "Mobiles",
      icon: Smartphone,
    },
    {
      id: 15,
      name: "Mobile Accessories",
      icon: Cable,
    },
    {
      id: 16,
      name: "Hardware",
      icon: Wrench,
    },
    {
      id: 17,
      name: "Electrical",
      icon: Lightbulb,
    },
    {
      id: 18,
      name: "Home & Furniture",
      icon: Sofa,
    },
    {
      id: 19,
      name: "Beauty",
      icon: Sparkles,
    },
    {
      id: 20,
      name: "Baby Care",
      icon: Baby,
    },
    {
      id: 21,
      name: "Books",
      icon: BookOpen,
    },
    {
      id: 22,
      name: "Stationery",
      icon: Pencil,
    },
    {
      id: 23,
      name: "Sports",
      icon: Dumbbell,
    },
    {
      id: 24,
      name: "Toys",
      icon: ToyBrick,
    },
    {
      id: 25,
      name: "Pet Supplies",
      icon: PawPrint,
    },
    {
      id: 26,
      name: "Florists",
      icon: Flower2,
    },
    {
      id: 27,
      name: "Auto Parts",
      icon: Car,
    },
    {
      id: 28,
      name: "Tailoring",
      icon: Scissors,
    },
    {
      id: 29,
      name: "Laundry",
      icon: WashingMachine,
    },
    {
      id: 30,
      name: "Gifts",
      icon: Gift,
    },
  ];

  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;

    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  const scroll = (direction) => {
    const container = scrollContainerRef.current;

    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  //--->>> CATEGORY CLICK

  const handleCategoryClick = (categoryName) => {
    navigate(`/shops?category=${encodeURIComponent(categoryName)}`);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    updateScrollButtons();

    container.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      container.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, []);

  return (
    <section className="border-t border-[#022B3A]/5 bg-[#FCFAF3]">
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-6 sm:py-8 lg:px-10">
        {/* SECTION HEADER */}

        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#022B3A] sm:text-xl">
              Popular Categories
            </h2>

            <p className="mt-1 text-xs text-[#022B3A]/55 sm:text-sm">
              Explore products from local stores near you
            </p>
          </div>

          {/* DESKTOP ARROWS */}

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Previous categories"
              className={`cursor-pointer
                flex h-8 w-8 cursor-pointer items-center justify-center
                rounded-full border transition-all duration-200
                ${
                  canScrollLeft
                    ? "border-[#022B3A]/15 bg-white text-[#022B3A] hover:border-[#FF8C00] hover:bg-[#FF8C00] hover:text-white"
                    : "cursor-not-allowed border-[#022B3A]/5 bg-white/60 text-[#022B3A]/20"
                }
              `}
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Next categories"
              className={`
                flex h-8 w-8 cursor-pointer items-center justify-center
                rounded-full border transition-all duration-200
                ${
                  canScrollRight
                    ? "border-[#022B3A]/15 bg-white text-[#022B3A] hover:border-[#FF8C00] hover:bg-[#FF8C00] hover:text-white"
                    : "cursor-not-allowed border-[#022B3A]/5 bg-white/60 text-[#022B3A]/20"
                }
              `}
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        {/*  CATEGORY SCROLLER */}

        <div className="relative">
          {/* Mobile Left Arrow */}

          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Previous categories"
              className="cursor-pointer
                absolute left-0 top-1/2 z-20
                flex h-8 w-8 -translate-y-1/2
                items-center justify-center
                rounded-full border border-[#022B3A]/10
                bg-white shadow-md
                sm:hidden
              "
            >
              <ChevronLeft size={17} className="text-[#022B3A]" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="
              flex
              gap-4
              overflow-x-auto
              scroll-smooth
              px-1
              pb-1
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
              sm:gap-6
            "
          >
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryClick(category.name)}
                  className="
                    group
                    flex
                    shrink-0
                    cursor-pointer
                    flex-col
                    items-center
                  "
                >
                  <div
                    className="
                      flex
                      h-[60px]
                      w-[60px]
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-[#022B3A]/10
                      bg-white
                      shadow-sm
                      transition-all
                      duration-200

                      group-hover:-translate-y-1
                      group-hover:border-[#FF8C00]/30
                      group-hover:bg-[#FFF3E5]
                      group-hover:shadow-md

                      sm:h-[68px]
                      sm:w-[68px]

                      lg:h-[72px]
                      lg:w-[72px]
                    "
                  >
                    <Icon
                      size={25}
                      strokeWidth={1.7}
                      className="
                        text-[#022B3A]
                        transition-colors
                        duration-200
                        group-hover:text-[#FF8C00]
                        sm:h-7
                        sm:w-7
                      "
                    />
                  </div>

                  <span
                    className="
                      mt-2
                      whitespace-nowrap
                      text-[11px]
                      font-medium
                      text-[#022B3A]
                      transition-colors
                      duration-200
                      group-hover:text-[#FF8C00]
                      sm:text-xs
                    "
                  >
                    {category.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mobile Right Arrow */}

          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Next categories"
              className="cursor-pointer
                absolute right-0 top-1/2 z-20
                flex h-8 w-8 -translate-y-1/2
                items-center justify-center
                rounded-full border border-[#022B3A]/10
                bg-white shadow-md
                sm:hidden
              "
            >
              <ChevronRight size={17} className="text-[#022B3A]" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default CategorySection;
