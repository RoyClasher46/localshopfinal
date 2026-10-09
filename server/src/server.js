import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { seedSuperAdmin } from "./utils/seedAdmin.js";
import { seedMasterCatalog } from "./utils/seedMasterCatalog.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await seedSuperAdmin();
    await seedMasterCatalog();

    app.listen(PORT, () => {
      console.log(`ShopLocal server running on port ${PORT}`);
      if (process.env.NODE_ENV !== "production") {
        console.log(`http://localhost:${PORT}`);
      }
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
