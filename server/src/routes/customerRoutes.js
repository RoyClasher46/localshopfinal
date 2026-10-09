import express from "express";

import {
  getSellerCustomers,
  getCustomerDetails,
  getCustomerOrders,
} from "../controllers/customerController.js";

import sellerAuthMiddleware from "../middleware/sellerAuthMiddleware.js";

const router = express.Router();

//-->>> SELLER CUSTOMER ROUTES

// GET /api/customers
router.get("/", sellerAuthMiddleware, getSellerCustomers);

// GET /api/customers/:id
router.get("/:id", sellerAuthMiddleware, getCustomerDetails);

// GET /api/customers/:id/orders
router.get("/:id/orders", sellerAuthMiddleware, getCustomerOrders);

export default router;
