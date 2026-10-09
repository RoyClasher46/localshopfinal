import express from "express";

import { getSellerAnalytics } from "../controllers/analyticsController.js";

import sellerAuthMiddleware from "../middleware/sellerAuthMiddleware.js";

const router = express.Router();

//--->>> SELLER ANALYTICS

router.get("/", sellerAuthMiddleware, getSellerAnalytics);

export default router;
