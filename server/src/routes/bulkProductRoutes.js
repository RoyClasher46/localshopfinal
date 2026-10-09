import express from "express";
import {
  getMasterCategories,
  downloadCategoryTemplate,
  downloadCustomTemplate,
  validateCategorySpreadsheet,
  confirmBulkImport,
  addCustomProducts,
  parseSupplierSpreadsheet,
  matchSupplierProducts,
  generateAiImage,
  batchGenerateAiImages,
} from "../controllers/bulkProductController.js";
import sellerAuthMiddleware, {
  requireApprovedSeller,
} from "../middleware/sellerAuthMiddleware.js";
import spreadsheetUpload from "../middleware/spreadsheetUploadMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Master categories (Public / Seller viewable)
router.get("/categories", getMasterCategories);

// Download templates (Public / Seller)
router.get("/template", downloadCategoryTemplate);
router.get("/custom-template", downloadCustomTemplate);

// Validate Category Spreadsheet (Step 3 & 4)
router.post(
  "/validate",
  sellerAuthMiddleware,
  requireApprovedSeller,
  spreadsheetUpload.single("file"),
  validateCategorySpreadsheet,
);

// Final Confirmation & Save (Step 5)
router.post(
  "/confirm-import",
  sellerAuthMiddleware,
  requireApprovedSeller,
  confirmBulkImport,
);

// Custom / Local product addition (Section 9)
router.post(
  "/custom-product",
  sellerAuthMiddleware,
  requireApprovedSeller,
  upload.single("image"),
  addCustomProducts,
);

// Supplier Spreadsheet Import (Section 10 - Option B)
router.post(
  "/supplier-parse",
  sellerAuthMiddleware,
  requireApprovedSeller,
  spreadsheetUpload.single("file"),
  parseSupplierSpreadsheet,
);

router.post(
  "/supplier-match",
  sellerAuthMiddleware,
  requireApprovedSeller,
  matchSupplierProducts,
);

// Automated AI Product Image Generation
router.post(
  "/ai-image",
  sellerAuthMiddleware,
  requireApprovedSeller,
  generateAiImage,
);

router.post(
  "/ai-images-batch",
  sellerAuthMiddleware,
  requireApprovedSeller,
  batchGenerateAiImages,
);

export default router;
