import { useEffect, useMemo } from "react";
import { Star } from "lucide-react";

import { useAuth } from "../../../shared/context/AuthContext";
import { useReviews } from "../../../shared/context/ReviewContext";

import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";

function ReviewSection({ targetType, targetId }) {
  const { user } = useAuth();

  const {
    getReviews,
    getAverageRating,
    getReviewCount,
    loadReviews,
    isLoading,
    getError,
  } = useReviews();

  const targetReviews = getReviews(targetType, targetId);

  const averageRating = getAverageRating(targetType, targetId);

  const reviewCount = getReviewCount(targetType, targetId);

  const loading = isLoading(targetType, targetId);

  const error = getError(targetType, targetId);

  //--->>> LOAD REVIEWS

  useEffect(() => {
    if (!targetType || !targetId) {
      return;
    }

    loadReviews(targetType, targetId);
  }, [targetType, targetId, loadReviews]);

  //--->>> FIND CURRENT USER REVIEW

  const currentUserReview = useMemo(() => {
    if (!user || !targetReviews?.length) {
      return null;
    }

    const currentUserId = user.id || user._id;

    if (!currentUserId) {
      return null;
    }

    return (
      targetReviews.find((review) => {
        const reviewUserId =
          review?.userId?.id ||
          review?.userId?._id ||
          review?.userId ||
          review?.user?.id ||
          review?.user?._id;

        return reviewUserId && String(reviewUserId) === String(currentUserId);
      }) || null
    );
  }, [targetReviews, user]);

  if (!targetType || !targetId) {
    return null;
  }

  return (
    <section className="mt-10 rounded-2xl border border-[#DDE4E2] bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      {/* HEADER */}

      <div className="flex flex-col gap-5 border-b border-[#DDE4E2] pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#022B3A]">
            Customer Reviews
          </h2>

          <p className="mt-1 text-sm text-[#64748B]">
            See what customers are saying.
          </p>
        </div>

        {/*  RATING SUMMARY */}

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Star size={22} fill="#FF8C00" className="text-[#FF8C00]" />

            <span className="text-xl font-bold text-[#022B3A]">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </span>
          </div>

          <span className="text-sm text-[#64748B]">
            {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>

      {/* REVIEW FORM */}

      <div className="border-b border-[#DDE4E2] py-6">
        {user ? (
          currentUserReview ? (
            <div className="rounded-xl border border-[#DDE4E2] bg-[#F8F4E9] p-5">
              <h3 className="font-semibold text-[#022B3A]">
                You have already reviewed this item.
              </h3>

              <p className="mt-1 text-sm text-[#64748B]">
                You can edit or delete your existing review below.
              </p>
            </div>
          ) : (
            <ReviewForm targetType={targetType} targetId={targetId} />
          )
        ) : (
          <ReviewForm targetType={targetType} targetId={targetId} />
        )}
      </div>

      {/*  ERROR */}

      {error && (
        <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* REVIEW LIST */}

      <div className="pt-6">
        {loading ? (
          <div className="py-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF8C00]" />

            <p className="mt-3 text-sm text-[#64748B]">Loading reviews...</p>
          </div>
        ) : (
          <ReviewList
            reviews={targetReviews}
            targetType={targetType}
            targetId={targetId}
          />
        )}
      </div>
    </section>
  );
}

export default ReviewSection;
