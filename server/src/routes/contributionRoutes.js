import express from "express";

import { submitContribution } from "../controllers/contributionController.js";

import userAuthMiddleware from "../middleware/userAuthMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

//--->>> COMMUNITY CONTRIBUTION

// POST /api/contributions

router.post(
  "/",
  userAuthMiddleware,
  upload.fields([
    {
      name: "shopLogo",
      maxCount: 1,
    },
    {
      name: "shopBanner",
      maxCount: 1,
    },
    {
      name: "shopGallery",
      maxCount: 4,
    },
  ]),
  submitContribution,
);

export default router;
