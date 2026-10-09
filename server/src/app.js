import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import userAuthRoutes from "./routes/userAuthRoutes.js";
import sellerAuthRoutes from "./routes/sellerAuthRoutes.js";
import sellerShopRoutes from "./routes/sellerShopRoutes.js";
import shopRoutes from "./routes/shopRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import bulkProductRoutes from "./routes/bulkProductRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import userAddressRoutes from "./routes/userAddressRoutes.js";
import sellerSettingsRoutes from "./routes/sellerSettingsRoutes.js";
import contributionRoutes from "./routes/contributionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

//--->> SECURITY

app.use(helmet());

//--->>> CORS

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [process.env.CLIENT_URL].filter(Boolean)
    : [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        process.env.CLIENT_URL,
      ].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

//--->>> REQUEST PARSING

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//--->>> LOGGING

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
//--->>>ROUTES
app.use("/api/auth/user", userAuthRoutes);
app.use("/api/auth/seller", sellerAuthRoutes);

app.use("/api/seller/shop", sellerShopRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/products/bulk", bulkProductRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/seller/analytics", analyticsRoutes);
app.use("/api/users/me/addresses", userAddressRoutes);
app.use("/api/seller/settings", sellerSettingsRoutes);

app.use("/api/contributions", contributionRoutes);
app.use("/api/admin", adminRoutes);

//-->>> HEALTH CHECK

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ShopLocal API is running",
  });
});

export default app;
