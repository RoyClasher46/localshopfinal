import express from "express";

import {
  createOrder,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
  getSellerOrders,
  getSellerOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";

import userAuthMiddleware from "../middleware/userAuthMiddleware.js";
import sellerAuthMiddleware from "../middleware/sellerAuthMiddleware.js";

const router = express.Router();

//--->>> USER ROUTES

//--->> Create order
router.post("/", userAuthMiddleware, createOrder);

//-->>> My orders
router.get("/my", userAuthMiddleware, getMyOrders);

//-->>> Cancel my order
router.put("/:id/cancel", userAuthMiddleware, cancelMyOrder);

//-->>> SELLER ROUTES

//-->>> Seller orders
router.get("/seller", sellerAuthMiddleware, getSellerOrders);

//--->>> Seller single order
router.get("/seller/:id", sellerAuthMiddleware, getSellerOrderById);

//-->>> Seller changes status
router.put("/seller/:id/status", sellerAuthMiddleware, updateOrderStatus);

//--->> USER SINGLE ORDER

router.get("/:id", userAuthMiddleware, getMyOrderById);

export default router;
