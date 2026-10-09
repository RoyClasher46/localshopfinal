import { useEffect, useState } from "react";

import ReviewSummary from "./components/ReviewSummary";
import ShopReviews from "./components/ShopReviews";
import ProductReviews from "./components/ProductReviews";
import ReviewDetailsModal from "./components/ReviewDetailsModal";

import { sellerReviewAPI } from "../../../../services/api";

function normalizeReview(review) {
  return {
    ...review,

    id: review._id || review.id,

    targetType: String(review.targetType || "").toLowerCase(),

    targetId: review.target?._id || review.target,

    customerName: review.user?.name || "Customer",

    customerEmail: review.user?.email || "",

    customerPhone: review.user?.phone || "",

    comment: review.comment || "",

    rating: Number(review.rating || 0),

    createdAt: review.createdAt,

    productId: review.productId || review.target,

    productName: review.productName || "Unknown Product",

    sellerReply: review.sellerReply || null,
  };
}

function ReviewsPage() {
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedReview, setSelectedReview] = useState(null);

  const loadReviews = async () => {
    try {
      setLoading(true);

      const response = await sellerReviewAPI.list();

      const data = response.data;

      const shopReviews = data?.shopReviews || [];

      const productReviews = data?.productReviews || [];

      setReviews([
        ...shopReviews.map(normalizeReview),
        ...productReviews.map(normalizeReview),
      ]);
    } catch (err) {
      console.error("Reviews load error:", err);

      setError(err.response?.data?.message || "Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-16 text-center">
        Loading reviews...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-red-600">{error}</div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#022B3A] sm:text-3xl">
          Reviews
        </h1>

        <p className="mt-1 text-sm text-[#64748B]">
          Monitor what customers are saying about your shop and products.
        </p>
      </div>

      <section>
        <ReviewSummary reviews={reviews} />
      </section>

      <section className="space-y-6">
        <ShopReviews reviews={reviews} onViewReview={setSelectedReview} />

        <ProductReviews reviews={reviews} onViewReview={setSelectedReview} />
      </section>

      {selectedReview && (
        <ReviewDetailsModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </div>
  );
}

export default ReviewsPage;
