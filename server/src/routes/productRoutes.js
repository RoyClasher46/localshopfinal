import express from "express";

import {
  createProduct,
  getProducts,
  getSellerProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  generateProductAiImage,
} from "../controllers/productController.js";

import sellerAuthMiddleware, {
  requireApprovedSeller,
} from "../middleware/sellerAuthMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

//-->>>> SELLER
router.get("/seller", sellerAuthMiddleware, getSellerProducts);

router.post(
  "/",
  sellerAuthMiddleware,
  requireApprovedSeller,
  upload.array("images", 4),
  createProduct,
);

router.put(
  "/:id",
  sellerAuthMiddleware,
  requireApprovedSeller,
  upload.array("images", 4),
  updateProduct,
);

router.delete("/:id", sellerAuthMiddleware, requireApprovedSeller, deleteProduct);

// AI generate or refresh product image
router.post(
  "/:id/ai-image",
  sellerAuthMiddleware,
  requireApprovedSeller,
  generateProductAiImage,
);

//--->>> PUBLIC
router.get("/", getProducts);

router.get("/:id", getProductById);

export default router;
