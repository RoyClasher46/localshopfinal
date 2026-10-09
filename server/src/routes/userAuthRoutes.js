import express from "express";

import {
  signupUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  updateUserProfile,
  updateUserPassword,
} from "../controllers/userAuthController.js";

import userAuthMiddleware from "../middleware/userAuthMiddleware.js";

const router = express.Router();

//--->> Public routes
router.post("/signup", signupUser);
router.post("/login", loginUser);

//--->>>> Protected routes
router.get("/me", userAuthMiddleware, getCurrentUser);
router.put("/profile", userAuthMiddleware, updateUserProfile);
router.put("/password", userAuthMiddleware, updateUserPassword);

router.post("/logout", userAuthMiddleware, logoutUser);

export default router;
