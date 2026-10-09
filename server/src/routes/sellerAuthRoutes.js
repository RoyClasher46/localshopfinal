import express from "express";

import {
  signupSeller,
  loginSeller,
  getCurrentSeller,
  logoutSeller,
  updateSellerProfile,
  changeSellerPassword,
} from "../controllers/sellerAuthController.js";

import sellerAuthMiddleware from "../middleware/sellerAuthMiddleware.js";

const router = express.Router();

//--->>> Public routes
router.post("/signup", signupSeller);
router.post("/login", loginSeller);

//--->>> Protected routes
router.get("/me", sellerAuthMiddleware, getCurrentSeller);
router.post("/logout", sellerAuthMiddleware, logoutSeller);

router.put("/profile", sellerAuthMiddleware, updateSellerProfile);

router.put("/password", sellerAuthMiddleware, changeSellerPassword);

export default router;
