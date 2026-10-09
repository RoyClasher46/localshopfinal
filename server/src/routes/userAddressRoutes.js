import express from "express";

import {
  getMyAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/userAddressController.js";

import userAuthMiddleware from "../middleware/userAuthMiddleware.js";

const router = express.Router();

//-->>> USER ADDRESSES

router.get("/", userAuthMiddleware, getMyAddresses);

router.post("/", userAuthMiddleware, addAddress);

router.put("/:id", userAuthMiddleware, updateAddress);

router.delete("/:id", userAuthMiddleware, deleteAddress);

export default router;
