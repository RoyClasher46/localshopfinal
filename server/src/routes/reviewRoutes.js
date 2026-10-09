import express from "express";

import {
  createReview,
  getReviewsByTarget,
  getMyReviews,
  updateReview,
  deleteReview,
  getSellerReviews,
  replyToReview,
} from "../controllers/reviewController.js";

import userAuthMiddleware from "../middleware/userAuthMiddleware.js";
import sellerAuthMiddleware from "../middleware/sellerAuthMiddleware.js";

const router = express.Router();

//-->> PUBLIC

// GET /api/reviews/shop/SHOP_ID
// GET /api/reviews/product/PRODUCT_ID

router.get("/:targetType/:targetId", getReviewsByTarget);

//-->>> USER

router.post("/", userAuthMiddleware, createReview);

router.get("/my", userAuthMiddleware, getMyReviews);

router.put("/:id", userAuthMiddleware, updateReview);

router.delete("/:id", userAuthMiddleware, deleteReview);

//--->>> SELLER

router.get("/seller", sellerAuthMiddleware, getSellerReviews);

router.put("/:id/reply", sellerAuthMiddleware, replyToReview);

export default router;
