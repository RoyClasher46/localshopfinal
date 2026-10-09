import { MessageSquare, Star, Store, Package } from "lucide-react";

import ReviewRatingBadge from "./ReviewRatingBadge";

function ReviewSummary({ reviews }) {
  const shopReviews = reviews.filter((review) => review.targetType === "shop");

  const productReviews = reviews.filter(
    (review) => review.targetType === "product",
  );

  const getAverageRating = (items) => {
    if (!items.length) return 0;

    const total = items.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0,
    );

    return total / items.length;
  };

  const shopRating = getAverageRating(shopReviews);
  const productRating = getAverageRating(productReviews);

  const getRatingCount = (rating) =>
    reviews.filter((review) => Number(review.rating) === rating).length;

  const stats = [
    {
      label: "Shop Rating",
      value: shopRating.toFixed(1),
      subtext: `${shopReviews.length} ${
        shopReviews.length === 1 ? "review" : "reviews"
      }`,
      icon: Store,
      iconClass: "bg-orange-50 text-[#FF8C00]",
    },
    {
      label: "Product Rating",
      value: productRating.toFixed(1),
      subtext: `${productReviews.length} ${
        productReviews.length === 1 ? "review" : "reviews"
      }`,
      icon: Package,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total Reviews",
      value: reviews.length,
      subtext: "All customer reviews",
      icon: MessageSquare,
      iconClass: "bg-green-50 text-green-600",
    },
  ];

  return (
    <div className="space-y-4">
      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#DDE4E2] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#64748B]">
                    {stat.label}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-[#022B3A]">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-[#64748B]">{stat.subtext}</p>
                </div>

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}
                >
                  <Icon size={21} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* RATING DISTRIBUTION */}

      <div className="rounded-2xl border border-[#DDE4E2] bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Star size={19} className="text-[#FF8C00]" />

          <h3 className="font-bold text-[#022B3A]">Rating Distribution</h3>
        </div>

        <div className="mt-5 space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = getRatingCount(rating);

            const percentage =
              reviews.length > 0 ? (count / reviews.length) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex w-12 shrink-0 items-center gap-1">
                  <span className="text-sm font-semibold text-[#022B3A]">
                    {rating}
                  </span>

                  <Star size={14} fill="#FF8C00" className="text-[#FF8C00]" />
                </div>

                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#EEF2F1]">
                  <div
                    className="h-full rounded-full bg-[#FF8C00] transition-all"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <span className="w-8 text-right text-xs font-medium text-[#64748B]">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-5 border-t border-[#DDE4E2] pt-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div>
              <p className="text-xs text-[#64748B]">Shop average</p>

              <div className="mt-1">
                <ReviewRatingBadge rating={shopRating} size={15} />
              </div>
            </div>

            <div>
              <p className="text-xs text-[#64748B]">Product average</p>

              <div className="mt-1">
                <ReviewRatingBadge rating={productRating} size={15} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReviewSummary;
