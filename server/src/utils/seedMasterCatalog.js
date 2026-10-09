import MasterCategory from "../models/MasterCategory.js";
import MasterProduct from "../models/MasterProduct.js";
import { MASTER_CATEGORIES, MASTER_PRODUCTS } from "./masterCatalogData.js";

export const seedMasterCatalog = async () => {
  try {
    // 1. Upsert Categories
    for (const cat of MASTER_CATEGORIES) {
      await MasterCategory.findOneAndUpdate(
        { categoryId: cat.categoryId },
        {
          $set: {
            name: cat.name,
            iconName: cat.iconName,
            displayOrder: cat.displayOrder,
            description: cat.description,
            isActive: true,
          },
        },
        { upsert: true, returnDocument: "after" },
      );
    }

    // 2. Upsert Master Products
    for (const prod of MASTER_PRODUCTS) {
      // Do not store generic Unsplash stock photos
      const isUnsplash =
        prod.imageUrl &&
        (prod.imageUrl.includes("unsplash.com") ||
          prod.imageUrl.includes("placeholder") ||
          prod.imageUrl.includes("picsum.photos"));

      const cleanImageUrl = isUnsplash ? "" : prod.imageUrl || "";

      // Check if existing master product already has a verified Cloudinary/CDN image
      const existing = await MasterProduct.findOne({ productId: prod.productId });
      const currentImg = existing?.imageUrl || "";
      const isExistingCloudinary =
        currentImg &&
        !currentImg.includes("unsplash.com") &&
        !currentImg.includes("placeholder") &&
        !currentImg.includes("picsum.photos");

      await MasterProduct.findOneAndUpdate(
        { productId: prod.productId },
        {
          $set: {
            name: prod.name,
            brand: prod.brand,
            categoryId: prod.categoryId,
            category: prod.category,
            variant: prod.variant || "",
            packSize: prod.packSize,
            unit: prod.unit || "packet",
            barcode: prod.barcode || "",
            mrp: prod.mrp,
            imageUrl: isExistingCloudinary ? currentImg : cleanImageUrl,
            description: prod.description || "",
            isActive: true,
          },
        },
        { upsert: true, returnDocument: "after" },
      );
    }

    const catCount = await MasterCategory.countDocuments();
    const prodCount = await MasterProduct.countDocuments();

    console.log(
      `✓ Master Catalog Seeded: ${catCount} categories, ${prodCount} products ready.`,
    );

    return { catCount, prodCount };
  } catch (error) {
    console.error("Error seeding master catalog:", error);
    throw error;
  }
};

export default seedMasterCatalog;
