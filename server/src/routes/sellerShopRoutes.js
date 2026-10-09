import express from "express";

import {
  createShop,
  getSellerShop,
  updateSellerShop,
} from "../controllers/shopController.js";

import sellerAuthMiddleware from "../middleware/sellerAuthMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

//-->>> SELLER SHOP

const shopImageUpload = upload.fields([
  {
    name: "logo",
    maxCount: 1,
  },
  {
    name: "image",
    maxCount: 1,
  },
  {
    name: "gallery",
    maxCount: 4,
  },
]);

router.post("/", sellerAuthMiddleware, shopImageUpload, createShop);

router.get("/", sellerAuthMiddleware, getSellerShop);

router.put("/", sellerAuthMiddleware, shopImageUpload, updateSellerShop);

export default router;
