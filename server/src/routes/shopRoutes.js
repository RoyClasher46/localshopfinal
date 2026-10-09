import express from "express";

import { getAllShops, getShopById } from "../controllers/shopController.js";

const router = express.Router();

//--->> Public shop discovery
router.get("/", getAllShops);

router.get("/:id", getShopById);

export default router;
