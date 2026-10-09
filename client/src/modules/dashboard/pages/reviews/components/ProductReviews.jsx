import { useMemo, useState } from "react";
import { Eye, Package } from "lucide-react";

import ReviewFilters from "./ReviewFilters";
import ReviewRatingBadge from "./ReviewRatingBadge";

function ProductReviews({ reviews, onViewReview }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("All");

  const filteredReviews = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return reviews
      .filter((review) => review.targetType === "product")
      .filter((review) => {
        const matchesSearch =
          !query ||
          (review.customerName || "").toLowerCase().includes(query) ||
          (review.productName || "").toLowerCase().includes(query) ||
          (review.comment || "").toLowerCase().includes(query);

        const matchesRating =
          ratingFilter === "All" ||
          Number(review.rating) === Number(ratingFilter);

        return matchesSearch && matchesRating;
      });
  }, [reviews, searchQuery, ratingFilter]);

  return (
    <section className="rounded-2xl border border-[#DDE4E2] bg-white shadow-sm">
      {/* HEADER */}

      <div className="border-b border-[#DDE4E2] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Package size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#022B3A]">
              Product Reviews
            </h2>

            <p className="mt-1 text-sm text-[#64748B]">
              Reviews customers have given to your products.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <ReviewFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            ratingFilter={ratingFilter}
            setRatingFilter={setRatingFilter}
          />
        </div>
      </div>

      {/* RESULT COUNT */}

      <div className="border-b border-[#DDE4E2] px-5 py-3 sm:px-6">
        <p className="text-sm text-[#64748B]">
          Showing{" "}
          <span className="font-semibold text-[#022B3A]">
            {filteredReviews.length}
          </span>{" "}
          product {filteredReviews.length === 1 ? "review" : "reviews"}
        </p>
      </div>

      {filteredReviews.length > 0 ? (
        <>
          {/* DESKTOP */}

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-[#DDE4E2] bg-[#F8F4E9]">
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Product
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Rating
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Review
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Date
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#64748B]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredReviews.map((review) => (
                  <tr
                    key={review.id}
                    className="border-b border-[#DDE4E2] last:border-b-0 transition hover:bg-[#FAFBFA]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#022B3A]">
                        {review.customerName}
                      </p>

                      <p className="mt-1 text-xs text-[#64748B]">{review.id}</p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-[#022B3A]">
                        {review.productName}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <ReviewRatingBadge rating={review.rating} size={14} />
                    </td>

                    <td className="max-w-[260px] px-5 py-4">
                      <p className="truncate text-sm text-[#475569]">
                        {review.comment}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm text-[#64748B]">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onViewReview(review)}
                        className="cursor-pointer inline-flex h-9 items-center gap-2 rounded-lg border border-[#DDE4E2] px-3 text-sm font-semibold text-[#022B3A] transition hover:border-[#FF8C00] hover:bg-[#FFF0D9] hover:text-[#FF8C00]"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}

          <div className="divide-y divide-[#DDE4E2] md:hidden">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#022B3A]">
                      {review.productName}
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                      {review.customerName}
                    </p>
                  </div>

                  <ReviewRatingBadge rating={review.rating} size={14} />
                </div>

                <p className="mt-4 text-sm leading-6 text-[#475569]">
                  {review.comment}
                </p>

                <p className="mt-2 text-xs text-[#64748B]">
                  {new Date(review.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                <button
                  type="button"
                  onClick={() => onViewReview(review)}
                  className="cursor-pointer mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#022B3A] text-sm font-semibold text-white transition hover:bg-[#033B4F]"
                >
                  <Eye size={16} />
                  View Review
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F4E9] text-[#FF8C00]">
            <Package size={24} />
          </div>

          <h3 className="mt-4 text-lg font-bold text-[#022B3A]">
            No product reviews found
          </h3>

          <p className="mt-1 text-sm text-[#64748B]">
            Try changing your search or rating filter.
          </p>
        </div>
      )}
    </section>
  );
}

export default ProductReviews;
