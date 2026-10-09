import { Star } from "lucide-react";

function ReviewRatingBadge({ rating, showNumber = true, size = 16 }) {
  const safeRating = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            fill={star <= safeRating ? "#FF8C00" : "none"}
            className={star <= safeRating ? "text-[#FF8C00]" : "text-[#CBD5E1]"}
          />
        ))}
      </div>

      {showNumber && (
        <span className="text-sm font-semibold text-[#022B3A]">
          {safeRating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

export default ReviewRatingBadge;
