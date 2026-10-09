import ReviewItem from "./ReviewItem";

function ReviewList({ reviews, targetType, targetId }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF0D9] text-[#FF8C00]">
          ★
        </div>

        <h3 className="mt-4 font-semibold text-[#022B3A]">No reviews yet</h3>

        <p className="mt-1 text-sm text-[#64748B]">
          Be the first customer to share your experience.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {reviews.map((review) => (
        <ReviewItem
          key={review.id || review._id}
          review={review}
          targetType={targetType}
          targetId={targetId}
        />
      ))}
    </div>
  );
}

export default ReviewList;
