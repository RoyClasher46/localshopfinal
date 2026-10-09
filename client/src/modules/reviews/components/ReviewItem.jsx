import { useState } from "react";
import { Pencil, Star, Trash2 } from "lucide-react";

import { useAuth } from "../../../shared/context/AuthContext";
import { useReviews } from "../../../shared/context/ReviewContext";
import ReviewForm from "./ReviewForm";

function ReviewItem({ review, targetType, targetId }) {
  const { user } = useAuth();

  const { deleteReview } = useReviews();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const formattedDate = review?.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  const rating = Number(review?.rating) || 0;

  //---->>> CHECK REVIEW OWNER

  const reviewUserName =
    review?.user?.name || review?.userName || "ShopLocal User";

  const reviewUserId =
    review?.userId?.id ||
    review?.userId?._id ||
    review?.userId ||
    review?.user?.id ||
    review?.user?._id;

  const currentUserId = user?.id || user?._id;

  const isOwner =
    reviewUserId &&
    currentUserId &&
    String(reviewUserId) === String(currentUserId);

  //--->>> DELETE REVIEW

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your review?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setIsDeleting(true);

      await deleteReview(review.id || review._id, targetType, targetId);
    } catch (deleteError) {
      console.error("Delete review error:", deleteError);

      setError(
        deleteError?.response?.data?.message ||
          deleteError?.message ||
          "Unable to delete your review.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  //--->> EDIT MODE

  if (isEditing) {
    return (
      <article className="border-b border-[#DDE4E2] pb-5 last:border-b-0 last:pb-0">
        <ReviewForm
          targetType={targetType}
          targetId={targetId}
          existingReview={review}
          onCancelEdit={() => setIsEditing(false)}
        />
      </article>
    );
  }

  return (
    <article className="border-b border-[#DDE4E2] pb-5 last:border-b-0 last:pb-0">
      {/* HEADER */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          {/* AVATAR */}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#022B3A] text-sm font-bold text-white">
            {reviewUserName.charAt(0).toUpperCase()}
          </div>

          <div>
            <h4 className="font-semibold text-[#022B3A]">{reviewUserName}</h4>

            {formattedDate && (
              <p className="text-xs text-[#64748B]">{formattedDate}</p>
            )}
          </div>
        </div>

        {/* RATING + OWNER ACTIONS */}

        <div className="flex flex-wrap items-center gap-3">
          {/* RATING */}

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={15}
                fill={star <= rating ? "#FF8C00" : "transparent"}
                className={star <= rating ? "text-[#FF8C00]" : "text-gray-300"}
              />
            ))}
          </div>

          {/* OWNER ACTIONS */}

          {isOwner && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setIsEditing(true);
                }}
                className="cursor-pointer rounded-lg p-2 text-[#022B3A] transition hover:bg-[#F8F4E9] hover:text-[#FF8C00]"
                aria-label="Edit review"
                title="Edit review"
              >
                <Pencil size={16} />
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="cursor-pointer rounded-lg p-2 text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Delete review"
                title="Delete review"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DELETE ERROR */}

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {/* COMMENT */}

      <p className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-600">
        {review?.comment}
      </p>

      {/* SELLER REPLY */}

      {review?.sellerReply?.text && (
        <div className="mt-4 rounded-xl bg-[#F8F4E9] p-4">
          <p className="text-sm font-semibold text-[#022B3A]">
            Seller Response
          </p>

          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-gray-600">
            {review.sellerReply.text}
          </p>

          {review.sellerReply.repliedAt && (
            <p className="mt-2 text-xs text-[#64748B]">
              {new Date(review.sellerReply.repliedAt).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                },
              )}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export default ReviewItem;
