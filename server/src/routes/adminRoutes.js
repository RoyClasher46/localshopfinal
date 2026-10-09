import express from "express";
import {
  loginAdmin,
  getCurrentAdmin,
  getSellers,
  approveSeller,
  rejectSeller,
  revertSeller,
} from "../controllers/adminController.js";
import adminAuthMiddleware from "../middleware/adminAuthMiddleware.js";

const router = express.Router();

// Public Super Admin Login
router.post("/login", loginAdmin);

// Protected Super Admin Routes (Only accessible by admin@gmail.com)
router.get("/me", adminAuthMiddleware, getCurrentAdmin);
router.get("/sellers", adminAuthMiddleware, getSellers);
router.patch("/sellers/:id/approve", adminAuthMiddleware, approveSeller);
router.patch("/sellers/:id/reject", adminAuthMiddleware, rejectSeller);
router.patch("/sellers/:id/revert", adminAuthMiddleware, revertSeller);

export default router;
