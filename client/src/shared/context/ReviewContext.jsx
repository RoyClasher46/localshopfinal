import { createContext, useCallback, useContext, useState } from "react";

import { reviewAPI } from "../../services/api";

const ReviewContext = createContext(null);

//--->>> VALID TARGET TYPES

const VALID_TARGET_TYPES = ["Shop", "Product"];

//--->>> NORMALIZE TARGET TYPE

// Accepts:
// product -> Product
// PRODUCT -> Product
// Product -> Product
// shop -> Shop

const normalizeTargetType = (targetType) => {
  if (!targetType) {
    return "";
  }

  const value = String(targetType).trim().toLowerCase();

  const targetMap = {
    shop: "Shop",
    product: "Product",
  };

  return targetMap[value] || "";
};

//--->>>> PROVIDER

export function ReviewProvider({ children }) {
  const [reviews, setReviews] = useState({});

  const [reviewStats, setReviewStats] = useState({});

  const [loading, setLoading] = useState({});

  const [errors, setErrors] = useState({});

  const getTargetKey = useCallback((targetType, targetId) => {
    const normalizedTargetType = normalizeTargetType(targetType);

    if (!normalizedTargetType || !targetId) {
      return "";
    }

    return `${normalizedTargetType}-${String(targetId)}`;
  }, []);

  //--->>>> GET REVIEWS

  const getReviews = useCallback(
    (targetType, targetId) => {
      const key = getTargetKey(targetType, targetId);

      if (!key) {
        return [];
      }

      return reviews[key] || [];
    },
    [reviews, getTargetKey],
  );

  //---->>> GET AVERAGE RATING

  const getAverageRating = useCallback(
    (targetType, targetId) => {
      const key = getTargetKey(targetType, targetId);

      if (!key) {
        return 0;
      }

      return Number(reviewStats[key]?.averageRating ?? 0);
    },
    [reviewStats, getTargetKey],
  );

  //--->>> GET REVIEW COUNT

  const getReviewCount = useCallback(
    (targetType, targetId) => {
      const key = getTargetKey(targetType, targetId);

      if (!key) {
        return 0;
      }

      return Number(reviewStats[key]?.count ?? 0);
    },
    [reviewStats, getTargetKey],
  );

  //--->>>> GET REVIEW STATS

  const getReviewStats = useCallback(
    (targetType, targetId) => {
      const key = getTargetKey(targetType, targetId);

      if (!key) {
        return {
          count: 0,
          averageRating: 0,
        };
      }

      return (
        reviewStats[key] || {
          count: 0,
          averageRating: 0,
        }
      );
    },
    [reviewStats, getTargetKey],
  );

  //---->>> LOAD REVIEWS

  const loadReviews = useCallback(
    async (targetType, targetId) => {
      const normalizedTargetType = normalizeTargetType(targetType);

      if (!normalizedTargetType || !targetId) {
        console.warn("loadReviews: invalid target", {
          targetType,
          targetId,
        });

        return [];
      }

      const key = getTargetKey(normalizedTargetType, targetId);

      try {
        setLoading((prev) => ({
          ...prev,
          [key]: true,
        }));

        setErrors((prev) => ({
          ...prev,
          [key]: "",
        }));

        const response = await reviewAPI.byTarget(
          normalizedTargetType,
          targetId,
        );

        const data = response?.data || {};

        const targetReviews = Array.isArray(data)
          ? data
          : Array.isArray(data.reviews)
            ? data.reviews
            : [];

        const count =
          typeof data.count === "number" ? data.count : targetReviews.length;

        const averageRating =
          typeof data.averageRating === "number" ? data.averageRating : 0;

        setReviews((prev) => ({
          ...prev,
          [key]: targetReviews,
        }));

        setReviewStats((prev) => ({
          ...prev,
          [key]: {
            count,
            averageRating,
          },
        }));

        return targetReviews;
      } catch (error) {
        console.error("Load reviews error:", error);

        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Unable to load reviews.";

        setErrors((prev) => ({
          ...prev,
          [key]: message,
        }));

        throw error;
      } finally {
        setLoading((prev) => ({
          ...prev,
          [key]: false,
        }));
      }
    },
    [getTargetKey],
  );

  //--->>>> ADD REVIEW

  const addReview = useCallback(
    async (data) => {
      const normalizedTargetType = normalizeTargetType(data?.targetType);

      const targetId = data?.target || data?.targetId;

      if (!VALID_TARGET_TYPES.includes(normalizedTargetType)) {
        throw new Error("Target type must be Shop or Product.");
      }

      if (!targetId) {
        throw new Error("Target ID is required.");
      }

      const numericRating = Number(data?.rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        throw new Error("Rating must be an integer between 1 and 5.");
      }

      if (typeof data?.comment !== "string" || !data.comment.trim()) {
        throw new Error("Comment cannot be empty.");
      }

      const payload = {
        targetType: normalizedTargetType,
        target: String(targetId),
        rating: numericRating,
        comment: data.comment.trim(),
      };

      const response = await reviewAPI.create(payload);

      await loadReviews(normalizedTargetType, targetId);

      return response;
    },
    [loadReviews],
  );

  //---->>> UPDATE REVIEW

  const updateReview = useCallback(
    async (id, data) => {
      if (!id) {
        throw new Error("Review ID is required.");
      }

      const payload = {};

      if (data?.rating !== undefined) {
        const numericRating = Number(data.rating);

        if (
          !Number.isInteger(numericRating) ||
          numericRating < 1 ||
          numericRating > 5
        ) {
          throw new Error("Rating must be an integer between 1 and 5.");
        }

        payload.rating = numericRating;
      }

      if (data?.comment !== undefined) {
        if (typeof data.comment !== "string" || !data.comment.trim()) {
          throw new Error("Comment cannot be empty.");
        }

        payload.comment = data.comment.trim();
      }

      if (payload.rating === undefined && payload.comment === undefined) {
        throw new Error("Rating or comment is required.");
      }

      const response = await reviewAPI.update(id, payload);

      const normalizedTargetType = normalizeTargetType(data?.targetType);

      const targetId = data?.target || data?.targetId;

      if (normalizedTargetType && targetId) {
        await loadReviews(normalizedTargetType, targetId);
      }

      return response;
    },
    [loadReviews],
  );

  //--->>>> DELETE REVIEW

  const deleteReview = useCallback(
    async (id, targetType, targetId) => {
      if (!id) {
        throw new Error("Review ID is required.");
      }

      const response = await reviewAPI.delete(id);

      const normalizedTargetType = normalizeTargetType(targetType);

      if (normalizedTargetType && targetId) {
        await loadReviews(normalizedTargetType, targetId);
      }

      return response;
    },
    [loadReviews],
  );

  //--->>> LOADING

  const isLoading = useCallback(
    (targetType, targetId) => {
      const key = getTargetKey(targetType, targetId);

      if (!key) {
        return false;
      }

      return Boolean(loading[key]);
    },
    [loading, getTargetKey],
  );

  //--->>> ERROR

  const getError = useCallback(
    (targetType, targetId) => {
      const key = getTargetKey(targetType, targetId);

      if (!key) {
        return "";
      }

      return errors[key] || "";
    },
    [errors, getTargetKey],
  );

  //--->>> CLEAR ERROR

  const clearError = useCallback(
    (targetType, targetId) => {
      const key = getTargetKey(targetType, targetId);

      if (!key) {
        return;
      }

      setErrors((prev) => ({
        ...prev,
        [key]: "",
      }));
    },
    [getTargetKey],
  );

  //--->>> CONTEXT VALUE

  const value = {
    reviews,
    reviewStats,

    getReviews,
    getAverageRating,
    getReviewCount,
    getReviewStats,

    loadReviews,

    addReview,
    updateReview,
    deleteReview,

    isLoading,

    getError,
    clearError,

    normalizeTargetType,
  };

  //--->>>> PROVIDER

  return (
    <ReviewContext.Provider value={value}>{children}</ReviewContext.Provider>
  );
}

//--->>> HOOK

export function useReviews() {
  const context = useContext(ReviewContext);

  if (!context) {
    throw new Error("useReviews must be used inside ReviewProvider");
  }

  return context;
}

export default ReviewContext;
