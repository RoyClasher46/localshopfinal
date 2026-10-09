import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../shared/context/AuthContext";
import { useReviews } from "../../../shared/context/ReviewContext";

function ReviewForm({
  targetType,
  targetId,
  existingReview = null,
  onCancelEdit,
}) {
  const navigate = useNavigate();

  const { user } = useAuth();

  const { addReview, updateReview } = useReviews();

  const isEditing = Boolean(existingReview);

  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  //--->> UPDATE FORM WHEN REVIEW CHANGES

  useEffect(() => {
    if (existingReview) {
      setRating(Number(existingReview.rating) || 0);
      setComment(existingReview.comment || "");
    } else {
      setRating(0);
      setComment("");
    }

    setHoverRating(0);
    setError("");
  }, [existingReview]);

  //--->> LOGIN CHECK

  if (!user) {
    return (
      <div className="rounded-xl border border-[#DDE4E2] bg-[#F8F4E9] p-5">
        <h3 className="font-semibold text-[#022B3A]">
          Want to share your experience?
        </h3>

        <p className="mt-1 text-sm text-[#64748B]">
          Sign in to leave a review.
        </p>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-4 cursor-pointer rounded-lg bg-[#022B3A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#033B4F]"
        >
          Sign In to Review
        </button>
      </div>
    );
  }

  //--->> SUBMIT / UPDATE REVIEW

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (rating < 1) {
      setError("Please select a rating.");
      return;
    }

    if (!comment.trim()) {
      setError("Please write a review.");
      return;
    }

    if (!targetType || !targetId) {
      setError("Unable to identify this item.");
      return;
    }

    try {
      setIsSubmitting(true);

      const normalizedTargetType = String(targetType).trim().toLowerCase();

      const targetTypeMap = {
        shop: "Shop",
        product: "Product",
      };

      const normalizedType = targetTypeMap[normalizedTargetType];

      if (!normalizedType) {
        setError("Invalid review target type.");
        return;
      }

      const reviewData = {
        targetType: normalizedType,
        target: targetId,
        rating,
        comment: comment.trim(),
      };

      if (isEditing) {
        await updateReview(existingReview.id || existingReview._id, {
          rating,
          comment: comment.trim(),
          targetType,
          targetId,
        });

        if (onCancelEdit) {
          onCancelEdit();
        }

        return;
      }

      //--->>> CREATE NEW REVIEW

      await addReview(reviewData);

      setRating(0);
      setHoverRating(0);
      setComment("");
    } catch (submitError) {
      console.error(
        isEditing ? "Update review error:" : "Submit review error:",
        submitError,
      );

      setError(
        submitError?.response?.data?.message ||
          submitError?.message ||
          (isEditing
            ? "Unable to update your review."
            : "Unable to submit your review."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setRating(existingReview?.rating || 0);
    setComment(existingReview?.comment || "");
    setHoverRating(0);
    setError("");

    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  const displayedRating = hoverRating || rating;

  return (
    <form onSubmit={handleSubmit}>
      {/* HEADER */}

      <div>
        <h3 className="text-lg font-bold text-[#022B3A]">
          {isEditing ? "Edit Your Review" : "Write a Review"}
        </h3>

        <p className="mt-1 text-sm text-[#64748B]">
          {isEditing
            ? "Update your experience and rating."
            : "Share your experience with other customers."}
        </p>
      </div>

      {/*  RATING*/}

      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold text-[#022B3A]">Your Rating</p>

        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              className="cursor-pointer rounded-md p-1 transition hover:scale-110"
              aria-label={`Rate ${star} out of 5`}
            >
              <Star
                size={27}
                fill={star <= displayedRating ? "#FF8C00" : "transparent"}
                className={
                  star <= displayedRating ? "text-[#FF8C00]" : "text-gray-300"
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* COMMENT */}

      <div className="mt-5">
        <label
          htmlFor={`review-${targetType}-${targetId}`}
          className="mb-2 block text-sm font-semibold text-[#022B3A]"
        >
          Your Review
        </label>

        <textarea
          id={`review-${targetType}-${targetId}`}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Tell others about your experience..."
          rows={4}
          maxLength={1000}
          className="w-full resize-none rounded-xl border border-[#DDE4E2] bg-white p-4 text-sm text-[#022B3A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#FF8C00] focus:ring-2 focus:ring-[#FF8C00]/20"
        />

        <div className="mt-1 text-right text-xs text-[#64748B]">
          {comment.length}/1000
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {/*  ACTIONS */}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer rounded-xl bg-[#022B3A] px-6 py-3 font-semibold text-white transition hover:bg-[#033B4F] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? isEditing
              ? "Updating..."
              : "Submitting..."
            : isEditing
              ? "Update Review"
              : "Submit Review"}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="cursor-pointer rounded-xl border border-[#DDE4E2] bg-white px-6 py-3 font-semibold text-[#022B3A] transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default ReviewForm;
