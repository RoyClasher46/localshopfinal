import express from "express";

import {
  getSellerSettings,
  updateSellerSettings,
} from "../controllers/sellerSettingsController.js";

import sellerAuthMiddleware from "../middleware/sellerAuthMiddleware.js";

const router = express.Router();

//-->>> SELLER SETTINGS

router.get("/", sellerAuthMiddleware, getSellerSettings);

router.put("/", sellerAuthMiddleware, updateSellerSettings);

export default router;
