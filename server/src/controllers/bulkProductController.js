import mongoose from "mongoose";
import * as XLSX from "xlsx";
import MasterCategory from "../models/MasterCategory.js";
import MasterProduct from "../models/MasterProduct.js";
import Product from "../models/Product.js";
import Seller from "../models/Seller.js";
import Shop from "../models/Shop.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import generateOrMatchProductImage from "../utils/aiProductImageService.js";

const getSellerId = (req) => req.seller?.id || req.seller?._id;

// Helper to normalize header strings
const normalizeHeader = (str) =>
  String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

// Helper to parse boolean from spreadsheet cell
const parseYesNo = (val) => {
  if (val === true || val === 1) return true;
  if (!val) return false;
  const str = String(val).trim().toLowerCase();
  return ["yes", "y", "true", "1"].includes(str);
};

// =========================================================================
// 1. GET MASTER CATEGORIES
// =========================================================================
export const getMasterCategories = async (req, res) => {
  try {
    const categories = await MasterCategory.find({ isActive: true }).sort({
      displayOrder: 1,
      name: 1,
    });

    // Aggregate product counts per category
    const counts = await MasterProduct.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$categoryId", count: { $sum: 1 } } },
    ]);

    const countMap = {};
    counts.forEach((item) => {
      countMap[item._id] = item.count;
    });

    const categoryList = categories.map((cat) => ({
      id: cat.categoryId,
      categoryId: cat.categoryId,
      name: cat.name,
      description: cat.description,
      iconName: cat.iconName,
      displayOrder: cat.displayOrder,
      productCount: countMap[cat.categoryId] || 0,
    }));

    return res.status(200).json({
      success: true,
      categories: categoryList,
    });
  } catch (error) {
    console.error("Error fetching master categories:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch product categories.",
    });
  }
};

// =========================================================================
// 2. DOWNLOAD CATEGORY TEMPLATE (.xlsx / .csv)
// =========================================================================
export const downloadCategoryTemplate = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const format = (req.query.format || "xlsx").toLowerCase();

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required.",
      });
    }

    const masterCat = await MasterCategory.findOne({
      categoryId: String(categoryId).trim().toLowerCase(),
      isActive: true,
    });

    if (!masterCat) {
      return res.status(404).json({
        success: false,
        message: `Category '${categoryId}' not found in master catalog.`,
      });
    }

    const products = await MasterProduct.find({
      categoryId: masterCat.categoryId,
      isActive: true,
    }).sort({ brand: 1, name: 1 });

    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: `No products available for category '${masterCat.name}'.`,
      });
    }

    // Build Products Data Rows
    const dataRows = products.map((prod) => ({
      "Product ID (Do Not Change)": prod.productId,
      "Category ID (Do Not Change)": masterCat.categoryId,
      "Category Name": masterCat.name,
      "Product Name": prod.name,
      Brand: prod.brand,
      Variant: prod.variant || "-",
      "Pack Size": prod.packSize,
      Barcode: prod.barcode || "-",
      "MRP (₹)": prod.mrp,
      "Add to My Shop (YES/NO)": "NO",
      "My Selling Price (₹)": prod.mrp, // Default to MRP for convenience, seller can edit
      "Stock Quantity": 10,
      "Available (YES/NO)": "YES",
    }));

    // Build Workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Products
    const productsSheet = XLSX.utils.json_to_sheet(dataRows);

    // Set Column Widths for readability
    productsSheet["!cols"] = [
      { wch: 18 }, // Product ID
      { wch: 22 }, // Category ID
      { wch: 22 }, // Category Name
      { wch: 38 }, // Product Name
      { wch: 18 }, // Brand
      { wch: 22 }, // Variant
      { wch: 18 }, // Pack Size
      { wch: 18 }, // Barcode
      { wch: 10 }, // MRP
      { wch: 24 }, // Add to My Shop
      { wch: 22 }, // My Selling Price
      { wch: 16 }, // Stock Quantity
      { wch: 20 }, // Available
    ];

    XLSX.utils.book_append_sheet(workbook, productsSheet, "Products");

    // Sheet 2: Instructions (for XLSX)
    if (format !== "csv") {
      const instructionsData = [
        { Instruction: "SHOPLOCAL BULK PRODUCT UPLOAD GUIDE" },
        { Instruction: "----------------------------------------------------" },
        { Instruction: `Selected Category: ${masterCat.name} (ID: ${masterCat.categoryId})` },
        { Instruction: "HOW TO USE THIS SPREADSHEET:" },
        {
          Instruction:
            "1. Look through the list of products in the 'Products' tab.",
        },
        {
          Instruction:
            "2. Set 'Add to My Shop (YES/NO)' to YES for products your shop sells. Leave as NO for products you do not sell.",
        },
        {
          Instruction:
            "3. In 'My Selling Price (₹)', enter your shop's selling price (must be greater than 0).",
        },
        {
          Instruction:
            "4. In 'Stock Quantity', enter your current available stock count (must be 0 or more).",
        },
        {
          Instruction:
            "5. In 'Available (YES/NO)', set YES if customers can purchase it, or NO if temporarily out of stock.",
        },
        {
          Instruction:
            "IMPORTANT RULES:",
        },
        {
          Instruction:
            "- DO NOT change or tamper with 'Product ID (Do Not Change)' or 'Category ID (Do Not Change)'.",
        },
        {
          Instruction:
            "- Images are automatically verified and linked from the Master Catalog. No manual image upload needed!",
        },
        {
          Instruction:
            "- Only rows marked YES in 'Add to My Shop' will be imported to your shop inventory.",
        },
        {
          Instruction:
            "- Security check: Uploading a spreadsheet for a category other than the one you selected will be rejected.",
        },
      ];

      const instructionsSheet = XLSX.utils.json_to_sheet(instructionsData);
      instructionsSheet["!cols"] = [{ wch: 100 }];
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, "Instructions");
    }

    const sanitizedCategoryName = masterCat.name.replace(/[^a-zA-Z0-9]/g, "_");

    if (format === "csv") {
      const csvBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "csv",
      });
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="ShopLocal_${sanitizedCategoryName}_Catalog.csv"`,
      );
      return res.send(csvBuffer);
    }

    const xlsxBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="ShopLocal_${sanitizedCategoryName}_Catalog.xlsx"`,
    );

    return res.send(xlsxBuffer);
  } catch (error) {
    console.error("Download category template error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to generate category template.",
    });
  }
};

// =========================================================================
// 3. DOWNLOAD BLANK CUSTOM PRODUCT TEMPLATE
// =========================================================================
export const downloadCustomTemplate = async (req, res) => {
  try {
    const format = (req.query.format || "xlsx").toLowerCase();

    const sampleRows = [
      {
        "Product Name *": "Fresh Homemade Kaju Katli",
        "Brand / Manufacturer *": "Sharma Sweets",
        "Category Name *": "Sweets & Snacks",
        "Pack Size *": "500g Box",
        Unit: "box",
        "Selling Price (₹) *": 450,
        "Stock Quantity *": 25,
        "Available (YES/NO)": "YES",
        "Barcode / Code (Optional)": "",
        "Description (Optional)": "Pure cashew fudge with silver vark.",
      },
      {
        "Product Name *": "Local Special Rusk Toast",
        "Brand / Manufacturer *": "City Bakers",
        "Category Name *": "Bread & Bakery",
        "Pack Size *": "400g Packet",
        Unit: "packet",
        "Selling Price (₹) *": 60,
        "Stock Quantity *": 40,
        "Available (YES/NO)": "YES",
        "Barcode / Code (Optional)": "",
        "Description (Optional)": "Crisp baked toast with fennel.",
      },
    ];

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(sampleRows);
    sheet["!cols"] = [
      { wch: 32 },
      { wch: 24 },
      { wch: 22 },
      { wch: 18 },
      { wch: 12 },
      { wch: 20 },
      { wch: 18 },
      { wch: 20 },
      { wch: 26 },
      { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(workbook, sheet, "Custom Products");

    if (format === "csv") {
      const csvBuffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "csv",
      });
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="ShopLocal_Custom_Products_Template.csv"',
      );
      return res.send(csvBuffer);
    }

    const xlsxBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="ShopLocal_Custom_Products_Template.xlsx"',
    );
    return res.send(xlsxBuffer);
  } catch (error) {
    console.error("Download custom template error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to generate custom products template.",
    });
  }
};

// =========================================================================
// 4. VALIDATE CATEGORY SPREADSHEET (Step 3 & Step 4 Preview)
// =========================================================================
export const validateCategorySpreadsheet = async (req, res) => {
  try {
    const sellerId = getSellerId(req);
    const { categoryId } = req.body;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Please specify the selected category ID.",
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Please upload a valid .xlsx, .xls or .csv spreadsheet file.",
      });
    }

    // 1. Authoritative check on selected category from database
    const expectedCat = await MasterCategory.findOne({
      categoryId: String(categoryId).trim().toLowerCase(),
      isActive: true,
    });

    if (!expectedCat) {
      return res.status(400).json({
        success: false,
        message: `Selected category '${categoryId}' is invalid or inactive.`,
      });
    }

    // 2. Check seller's shop
    const shop = await Shop.findOne({
      seller: sellerId,
      isActive: true,
      isSuspended: false,
    });

    if (!shop) {
      return res.status(400).json({
        success: false,
        message: "Please create and register your shop before importing products.",
      });
    }

    // 3. Parse spreadsheet buffer with SheetJS
    let workbook;
    try {
      workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    } catch (parseErr) {
      return res.status(400).json({
        success: false,
        message:
          "Unable to read spreadsheet file. Please verify it is a valid Excel (.xlsx, .xls) or CSV file.",
      });
    }

    const firstSheetName =
      workbook.SheetNames.find((s) => s.toLowerCase() === "products") ||
      workbook.SheetNames[0];

    if (!firstSheetName) {
      return res.status(400).json({
        success: false,
        message: "The uploaded spreadsheet does not contain any sheets.",
      });
    }

    const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
      defval: "",
      raw: false,
    });

    if (!rawRows || !rawRows.length) {
      return res.status(400).json({
        success: false,
        message:
          "The uploaded spreadsheet is empty or has no product rows to parse.",
      });
    }

    // Map headers dynamically
    const headerSample = rawRows[0] || {};
    const headerKeys = Object.keys(headerSample);

    const findColKey = (possibleNames) => {
      for (const name of possibleNames) {
        const normTarget = normalizeHeader(name);
        const match = headerKeys.find((k) => normalizeHeader(k) === normTarget);
        if (match) return match;
      }
      return null;
    };

    const productIdKey = findColKey([
      "Product ID (Do Not Change)",
      "Product ID",
      "productId",
      "product_id",
      "ID",
    ]);
    const addProductKey = findColKey([
      "Add to My Shop (YES/NO)",
      "Add to My Shop",
      "addProduct",
      "add_product",
      "Select",
      "Add",
    ]);
    const priceKey = findColKey([
      "My Selling Price (₹)",
      "Selling Price",
      "Price",
      "sellingPrice",
      "selling_price",
      "MRP (₹)",
      "MRP",
    ]);
    const stockKey = findColKey([
      "Stock Quantity",
      "Stock",
      "Quantity",
      "stockQuantity",
      "stock_quantity",
      "Qty",
    ]);
    const availableKey = findColKey([
      "Available (YES/NO)",
      "Available",
      "isAvailable",
      "is_available",
    ]);

    if (!productIdKey) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required 'Product ID' column. Please use the official category template downloaded from Step 2.",
      });
    }

    // 4. Extract all Product IDs to perform authoritative database verification
    const rawProductIds = rawRows
      .map((r) => String(r[productIdKey] || "").trim().toUpperCase())
      .filter(Boolean);

    if (!rawProductIds.length) {
      return res.status(400).json({
        success: false,
        message: "No product IDs were found in the uploaded spreadsheet.",
      });
    }

    // Query MasterProduct database for all these IDs
    const catalogProducts = await MasterProduct.find({
      productId: { $in: rawProductIds },
    });

    const catalogMap = new Map();
    catalogProducts.forEach((p) => catalogMap.set(p.productId, p));

    // -------------------------------------------------------------------------
    // CRITICAL CATEGORY SAFETY RULE:
    // Verify that uploaded products belong to the selected category!
    // -------------------------------------------------------------------------
    const foreignCategoryCounts = {};
    let matchingCategoryCount = 0;

    for (const prodId of rawProductIds) {
      const dbProd = catalogMap.get(prodId);
      if (dbProd) {
        if (dbProd.categoryId === expectedCat.categoryId) {
          matchingCategoryCount++;
        } else {
          foreignCategoryCounts[dbProd.categoryId] =
            (foreignCategoryCounts[dbProd.categoryId] || 0) + 1;
        }
      }
    }

    // If the vast majority of products belong to a different category, reject!
    const foreignCatKeys = Object.keys(foreignCategoryCounts);
    if (foreignCatKeys.length > 0 && matchingCategoryCount === 0) {
      const topForeignCatId = foreignCatKeys.sort(
        (a, b) => foreignCategoryCounts[b] - foreignCategoryCounts[a],
      )[0];

      const detectedCat = await MasterCategory.findOne({
        categoryId: topForeignCatId,
      });

      const detectedName = detectedCat
        ? detectedCat.name
        : topForeignCatId;

      return res.status(400).json({
        success: false,
        categoryMismatch: true,
        selectedCategory: {
          id: expectedCat.categoryId,
          name: expectedCat.name,
        },
        detectedCategory: {
          id: topForeignCatId,
          name: detectedName,
        },
        message: `Category Mismatch Error: You selected '${expectedCat.name}', but the uploaded spreadsheet contains products belonging to '${detectedName}'. Please upload the correct spreadsheet for '${expectedCat.name}'.`,
      });
    }

    // 5. Query seller's existing inventory to flag existing products
    const existingShopProducts = await Product.find({
      shop: shop._id,
      seller: sellerId,
    }).select("_id catalogId name price stock isAvailable");

    const shopCatalogMap = new Map();
    const shopNameMap = new Map();

    existingShopProducts.forEach((sp) => {
      if (sp.catalogId) {
        shopCatalogMap.set(sp.catalogId.toUpperCase(), sp);
      }
      if (sp.name) {
        shopNameMap.set(sp.name.toLowerCase().trim(), sp);
      }
    });

    // 6. Process Rows
    const validProducts = [];
    const invalidRows = [];
    const seenProductIds = new Set();
    let totalSelectedYes = 0;

    rawRows.forEach((row, index) => {
      const rowNumber = index + 2; // 1-based, accounting for header
      const pId = String(row[productIdKey] || "").trim().toUpperCase();

      if (!pId) {
        // Skip empty lines
        return;
      }

      // Check Add to My Shop (YES/NO)
      const isSelected = addProductKey ? parseYesNo(row[addProductKey]) : true;

      if (!isSelected) {
        // Ignored because seller marked NO or left blank
        return;
      }

      totalSelectedYes++;

      // Check Master Product Existence
      const catalogItem = catalogMap.get(pId);
      if (!catalogItem) {
        invalidRows.push({
          rowNumber,
          productId: pId,
          name: row["Product Name"] || "Unknown",
          reason: `Product ID '${pId}' does not exist in master catalog.`,
        });
        return;
      }

      // Check Category Membership against DB
      if (catalogItem.categoryId !== expectedCat.categoryId) {
        invalidRows.push({
          rowNumber,
          productId: pId,
          name: catalogItem.name,
          reason: `Product belongs to '${catalogItem.category}', not '${expectedCat.name}'.`,
        });
        return;
      }

      // Check Duplicate row within file
      if (seenProductIds.has(pId)) {
        invalidRows.push({
          rowNumber,
          productId: pId,
          name: catalogItem.name,
          reason: `Duplicate row in spreadsheet for product ID '${pId}'.`,
        });
        return;
      }
      seenProductIds.add(pId);

      // Validate Selling Price
      const rawPrice =
        priceKey && row[priceKey] !== undefined && String(row[priceKey]).trim() !== ""
          ? row[priceKey]
          : catalogItem.mrp;
      const cleanPriceStr = String(rawPrice).replace(/[^0-9.-]/g, "").trim();
      const numPrice = Number(cleanPriceStr);

      if (!Number.isFinite(numPrice) || numPrice <= 0) {
        invalidRows.push({
          rowNumber,
          productId: pId,
          name: catalogItem.name,
          reason: "Selling price must be a valid number greater than 0.",
        });
        return;
      }

      // Validate Stock Quantity
      const rawStock =
        stockKey && row[stockKey] !== undefined && String(row[stockKey]).trim() !== ""
          ? row[stockKey]
          : 0;
      const cleanStockStr = String(rawStock).replace(/[^0-9-]/g, "").trim();
      const numStock = Number(cleanStockStr);

      if (!Number.isFinite(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
        invalidRows.push({
          rowNumber,
          productId: pId,
          name: catalogItem.name,
          reason: "Stock quantity must be a non-negative whole number (0 or more).",
        });
        return;
      }

      // Availability
      const isAvailable = availableKey
        ? parseYesNo(row[availableKey])
        : numStock > 0;

      // Check if already in shop inventory
      const existingInShop =
        shopCatalogMap.get(pId) ||
        shopNameMap.get(catalogItem.name.toLowerCase().trim());

      // Strip generic Unsplash/placeholder stock URLs from preview
      const isGenericStock = (url) => {
        if (!url || typeof url !== "string") return true;
        const lower = url.toLowerCase();
        return (
          lower.includes("unsplash.com") ||
          lower.includes("via.placeholder") ||
          lower.includes("placeholder") ||
          lower.includes("picsum.photos") ||
          lower.includes("dummyimage")
        );
      };

      const verifiedImageUrl = isGenericStock(catalogItem.imageUrl)
        ? ""
        : catalogItem.imageUrl;

      validProducts.push({
        rowNumber,
        masterProductId: catalogItem._id,
        productId: catalogItem.productId,
        catalogId: catalogItem.productId,
        name: catalogItem.name,
        description: catalogItem.description || "",
        brand: catalogItem.brand,
        variant: catalogItem.variant || "",
        packSize: catalogItem.packSize,
        unit: catalogItem.unit || "packet",
        barcode: catalogItem.barcode || "",
        categoryId: expectedCat.categoryId,
        category: expectedCat.name,
        mrp: catalogItem.mrp,
        sellingPrice: Number(numPrice.toFixed(2)),
        stockQuantity: Math.floor(numStock),
        isAvailable,
        imageUrl: verifiedImageUrl,
        isExistingInShop: Boolean(existingInShop),
        existingProductId: existingInShop ? existingInShop._id : null,
        existingPrice: existingInShop ? existingInShop.price : null,
        existingStock: existingInShop ? existingInShop.stock : null,
      });
    });

    if (totalSelectedYes === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No products were marked 'YES' in the 'Add to My Shop' column. Please open the spreadsheet and change 'Add to My Shop' to YES for the products you want to add.",
      });
    }

    const existingCount = validProducts.filter(
      (p) => p.isExistingInShop,
    ).length;
    const newCount = validProducts.length - existingCount;

    return res.status(200).json({
      success: true,
      category: {
        id: expectedCat.categoryId,
        name: expectedCat.name,
      },
      summary: {
        totalRowsInFile: rawRows.length,
        selectedYesCount: totalSelectedYes,
        validCount: validProducts.length,
        invalidCount: invalidRows.length,
        existingInShopCount: existingCount,
        newProductCount: newCount,
      },
      validProducts,
      invalidRows,
    });
  } catch (error) {
    console.error("Validate spreadsheet error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while validating the spreadsheet.",
    });
  }
};

// =========================================================================
// 5. CONFIRM BULK IMPORT (Step 5 - Final Confirmation & Save)
// =========================================================================
export const confirmBulkImport = async (req, res) => {
  try {
    const sellerId = getSellerId(req);
    const { products, duplicateStrategy = "update", categoryId } = req.body;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    if (!Array.isArray(products) || !products.length) {
      return res.status(400).json({
        success: false,
        message: "No products selected for import.",
      });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller || !seller.isActive || seller.approvalStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your seller account must be approved before adding products.",
      });
    }

    const shop = await Shop.findOne({
      seller: sellerId,
      isActive: true,
      isSuspended: false,
    });

    if (!shop) {
      return res.status(400).json({
        success: false,
        message: "Shop not found. Please register your shop first.",
      });
    }

    // Re-verify catalog IDs against MasterProduct for database authority
    const catalogIds = products
      .map((p) => String(p.catalogId || p.productId || "").trim().toUpperCase())
      .filter(Boolean);

    const masterCatalogItems = await MasterProduct.find({
      productId: { $in: catalogIds },
    });

    const masterMap = new Map();
    masterCatalogItems.forEach((item) => masterMap.set(item.productId, item));

    // Fetch existing shop products to handle duplicates
    const existingShopProducts = await Product.find({
      shop: shop._id,
      seller: sellerId,
    });

    const shopCatalogMap = new Map();
    const shopNameMap = new Map();

    existingShopProducts.forEach((sp) => {
      if (sp.catalogId) {
        shopCatalogMap.set(sp.catalogId.toUpperCase(), sp);
      }
      if (sp.name) {
        shopNameMap.set(sp.name.toLowerCase().trim(), sp);
      }
    });

    let addedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    const bulkOperations = [];
    const newProductsToInsert = [];

    for (const item of products) {
      const pId = String(item.catalogId || item.productId || "").trim().toUpperCase();
      const masterItem = masterMap.get(pId);

      const numPrice = Number(item.sellingPrice ?? masterItem?.mrp ?? 0);
      const numStock = Number(item.stockQuantity ?? 0);

      if (!Number.isFinite(numPrice) || numPrice <= 0) {
        failedCount++;
        continue;
      }

      if (!Number.isFinite(numStock) || numStock < 0) {
        failedCount++;
        continue;
      }

      const isAvailable =
        item.isAvailable !== undefined ? Boolean(item.isAvailable) : numStock > 0;

      // Helper to ignore generic stock placeholders
      const isGenericStock = (url) => {
        if (!url || typeof url !== "string") return true;
        const lower = url.toLowerCase();
        return (
          lower.includes("unsplash.com") ||
          lower.includes("via.placeholder") ||
          lower.includes("placeholder") ||
          lower.includes("picsum.photos") ||
          lower.includes("dummyimage")
        );
      };

      // Effective image URL: prioritize AI generated preview image, only accept non-generic master image
      let effectiveImage = item.imageUrl || "";
      if (isGenericStock(effectiveImage)) {
        effectiveImage = "";
      }
      if (!effectiveImage && masterItem?.imageUrl && !isGenericStock(masterItem.imageUrl)) {
        effectiveImage = masterItem.imageUrl;
      }

      if (!masterItem) {
        // If not in master catalog (e.g. unmatched supplier product or local item)
        if (item.name) {
          newProductsToInsert.push({
            seller: sellerId,
            shop: shop._id,
            name: String(item.name).trim(),
            brand: String(item.brand || "Local / Homemade").trim(),
            variant: item.variant || "",
            packSize: item.packSize || "Standard",
            unit: item.unit || "piece",
            barcode: item.barcode || "",
            category: item.category || "General",
            price: numPrice,
            stock: numStock,
            reservedStock: 0,
            image: effectiveImage,
            images: effectiveImage ? [effectiveImage] : [],
            mrp: item.mrp ? Number(item.mrp) : numPrice,
            isAvailable,
            isActive: true,
            isCustom: true,
            description: item.description || "",
          });
          addedCount++;
          continue;
        } else {
          failedCount++;
          continue;
        }
      }

      const existingProd =
        shopCatalogMap.get(pId) ||
        shopNameMap.get(masterItem.name.toLowerCase().trim());

      if (existingProd) {
        if (duplicateStrategy === "skip") {
          skippedCount++;
          continue;
        }

        // Strategy: update or replace
        const updateFields = {
          price: numPrice,
          isAvailable,
          isActive: true,
          updatedAt: new Date(),
        };

        if (duplicateStrategy === "replaceStock" || duplicateStrategy === "update") {
          updateFields.stock = numStock;
        }

        // Fill or update image if provided
        if (effectiveImage && (!existingProd.image || item.imageUrl)) {
          updateFields.image = effectiveImage;
          updateFields.images = [effectiveImage];
        }
        if (!existingProd.catalogId) {
          updateFields.catalogId = masterItem.productId;
          updateFields.masterProductId = masterItem._id;
        }

        bulkOperations.push({
          updateOne: {
            filter: { _id: existingProd._id },
            update: { $set: updateFields },
          },
        });

        updatedCount++;
      } else {
        // Insert new product
        newProductsToInsert.push({
          seller: sellerId,
          shop: shop._id,
          masterProductId: masterItem._id,
          catalogId: masterItem.productId,
          name: masterItem.name,
          brand: masterItem.brand,
          variant: masterItem.variant || "",
          packSize: masterItem.packSize,
          unit: masterItem.unit || "packet",
          barcode: masterItem.barcode || "",
          category: masterItem.category,
          price: numPrice,
          stock: numStock,
          reservedStock: 0,
          image: effectiveImage,
          images: effectiveImage ? [effectiveImage] : [],
          mrp: masterItem.mrp,
          isAvailable,
          isActive: true,
          isCustom: false,
          description: masterItem.description || "",
        });

        addedCount++;
      }
    }

    // Execute bulk write operations
    if (bulkOperations.length > 0) {
      await Product.bulkWrite(bulkOperations);
    }

    if (newProductsToInsert.length > 0) {
      await Product.insertMany(newProductsToInsert, { ordered: false });
    }

    return res.status(200).json({
      success: true,
      message: `Successfully processed ${products.length} products!`,
      summary: {
        totalSubmitted: products.length,
        addedCount,
        updatedCount,
        skippedCount,
        failedCount,
      },
    });
  } catch (error) {
    console.error("Confirm bulk import error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save products to shop inventory.",
    });
  }
};

// =========================================================================
// 6. ADD CUSTOM / LOCAL PRODUCT(S) (Section 9)
// =========================================================================
export const addCustomProducts = async (req, res) => {
  try {
    const sellerId = getSellerId(req);

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller || !seller.isActive || seller.approvalStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your seller account must be approved to add products.",
      });
    }

    const shop = await Shop.findOne({
      seller: sellerId,
      isActive: true,
      isSuspended: false,
    });

    if (!shop) {
      return res.status(400).json({
        success: false,
        message: "Please register your shop before adding products.",
      });
    }

    // Handle single product or array
    const { name, brand, category, packSize, price, stock, unit, description, barcode } =
      req.body;

    if (!String(name || "").trim() || !String(category || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name and category are required.",
      });
    }

    const numPrice = Number(price);
    const numStock = Number(stock ?? 0);

    if (!Number.isFinite(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a valid number greater than 0.",
      });
    }

    if (!Number.isFinite(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a valid number greater than or equal to 0.",
      });
    }

    let imageUrl = "";
    if (req.file) {
      const uploaded = await uploadToCloudinary(
        req.file.buffer,
        "shoplocal/custom-products",
      );
      if (uploaded?.url) {
        imageUrl = uploaded.url;
      }
    } else if (req.body.imageUrl && typeof req.body.imageUrl === "string") {
      imageUrl = req.body.imageUrl.trim();
    }

    // Auto-generate authentic packaging photo if no image was uploaded
    if (!imageUrl) {
      try {
        const aiResult = await generateOrMatchProductImage({
          name: String(name).trim(),
          description: String(description || "").trim(),
          brand: String(brand || "Local / Homemade").trim(),
          category: String(category).trim(),
          packSize: String(packSize || "").trim(),
          unit: String(unit || "piece").trim(),
          barcode: String(barcode || "").trim(),
        });
        if (aiResult?.imageUrl) {
          imageUrl = aiResult.imageUrl;
        }
      } catch (aiErr) {
        console.warn("Auto AI image generation for custom product fallback failed:", aiErr.message);
      }
    }

    const newProduct = await Product.create({
      seller: sellerId,
      shop: shop._id,
      name: String(name).trim(),
      brand: String(brand || "Local / Homemade").trim(),
      category: String(category).trim(),
      packSize: String(packSize || "Standard").trim(),
      unit: String(unit || "piece").trim(),
      barcode: String(barcode || "").trim(),
      price: numPrice,
      stock: numStock,
      reservedStock: 0,
      image: imageUrl,
      images: imageUrl ? [imageUrl] : [],
      description: String(description || "").trim(),
      isAvailable: numStock > 0,
      isActive: true,
      isCustom: true,
      masterProductId: null,
      catalogId: null,
    });

    return res.status(201).json({
      success: true,
      message: "Custom product added successfully to your shop.",
      product: newProduct,
    });
  } catch (error) {
    console.error("Add custom product error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to add custom product.",
    });
  }
};

// =========================================================================
// 7. SUPPLIER SPREADSHEET PARSING (Section 10 - Option B)
// =========================================================================
export const parseSupplierSpreadsheet = async (req, res) => {
  try {
    const sellerId = getSellerId(req);

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "Please upload a supplier spreadsheet (.xlsx, .xls or .csv).",
      });
    }

    let workbook;
    try {
      workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid spreadsheet format. Please upload a valid Excel or CSV file.",
      });
    }

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!rawRows || !rawRows.length) {
      return res.status(400).json({
        success: false,
        message: "The uploaded spreadsheet does not contain any data rows.",
      });
    }

    const headers = Object.keys(rawRows[0] || {});

    // Intelligent auto-detection of column mapping
    const detectColumn = (patterns) => {
      const normalizedPatterns = patterns.map(normalizeHeader);
      for (const h of headers) {
        const norm = normalizeHeader(h);
        if (normalizedPatterns.some((p) => norm.includes(p) || p.includes(norm))) {
          return h;
        }
      }
      return "";
    };

    const suggestedMapping = {
      nameCol: detectColumn(["itemname", "productname", "item", "product", "description", "particulars"]),
      brandCol: detectColumn(["brand", "company", "manufacturer", "mfg"]),
      barcodeCol: detectColumn(["barcode", "gtin", "ean", "upc", "code", "itemcode"]),
      packSizeCol: detectColumn(["packsize", "pack", "size", "weight", "netwt"]),
      categoryCol: detectColumn(["category", "group", "type", "dept", "department"]),
      priceCol: detectColumn(["sellingprice", "retailprice", "rate", "price", "mrp", "saleprice"]),
      stockCol: detectColumn(["stock", "quantity", "qty", "closingstock", "inventory"]),
    };

    return res.status(200).json({
      success: true,
      headers,
      sampleRows: rawRows.slice(0, 5),
      totalRows: rawRows.length,
      suggestedMapping,
      allRows: rawRows.slice(0, 500), // Cap at reasonable initial batch
    });
  } catch (error) {
    console.error("Supplier parse error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to parse supplier spreadsheet.",
    });
  }
};

// =========================================================================
// 8. SUPPLIER PRODUCT MATCHING & PREVIEW (Section 10)
// =========================================================================
export const matchSupplierProducts = async (req, res) => {
  try {
    const sellerId = getSellerId(req);
    const { rows, mapping, fallbackCategory } = req.body;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    if (!Array.isArray(rows) || !rows.length) {
      return res.status(400).json({
        success: false,
        message: "No rows provided for matching.",
      });
    }

    if (!mapping?.nameCol) {
      return res.status(400).json({
        success: false,
        message: "Please map at least the Product Name column.",
      });
    }

    // Check seller's shop
    const shop = await Shop.findOne({ seller: sellerId, isActive: true });
    if (!shop) {
      return res.status(400).json({
        success: false,
        message: "Shop not found.",
      });
    }

    // Gather all barcodes and names to match against MasterProduct
    const barcodes = [];
    rows.forEach((r) => {
      const b = mapping.barcodeCol ? String(r[mapping.barcodeCol] || "").trim() : "";
      if (b) barcodes.push(b);
    });

    const masterByBarcode = new Map();
    if (barcodes.length) {
      const barcodeMatches = await MasterProduct.find({
        barcode: { $in: barcodes },
        isActive: true,
      });
      barcodeMatches.forEach((m) => {
        if (m.barcode) masterByBarcode.set(m.barcode.trim(), m);
      });
    }

    // Also load master products for name matching
    const allMaster = await MasterProduct.find({ isActive: true }).select(
      "productId name brand variant packSize unit mrp barcode category categoryId imageUrl",
    );

    const masterByName = new Map();
    allMaster.forEach((m) => {
      masterByName.set(m.name.toLowerCase().trim(), m);
    });

    const matchedProducts = [];
    const unmatchedProducts = [];

    rows.forEach((row, index) => {
      const rowNum = index + 1;
      const rawName = String(row[mapping.nameCol] || "").trim();
      if (!rawName) return;

      const rawBarcode = mapping.barcodeCol ? String(row[mapping.barcodeCol] || "").trim() : "";
      const rawBrand = mapping.brandCol ? String(row[mapping.brandCol] || "").trim() : "";
      const rawPrice = mapping.priceCol ? Number(String(row[mapping.priceCol]).replace(/[^0-9.]/g, "")) : 0;
      const rawStock = mapping.stockCol ? Number(String(row[mapping.stockCol]).replace(/[^0-9]/g, "")) : 0;
      const rawCategory = mapping.categoryCol ? String(row[mapping.categoryCol] || "").trim() : fallbackCategory || "Other / Local Products";
      const rawPack = mapping.packSizeCol ? String(row[mapping.packSizeCol] || "").trim() : "Standard";

      // 1. Barcode match
      let matchedMaster = rawBarcode ? masterByBarcode.get(rawBarcode) : null;

      // 2. Exact name match fallback
      if (!matchedMaster) {
        matchedMaster = masterByName.get(rawName.toLowerCase());
      }

      // 3. Normalized fuzzy token match fallback
      if (!matchedMaster) {
        const cleanRaw = rawName.toLowerCase();
        matchedMaster = allMaster.find((m) => {
          const mName = m.name.toLowerCase();
          return cleanRaw.includes(mName) || mName.includes(cleanRaw);
        });
      }

      const finalPrice = rawPrice > 0 ? rawPrice : matchedMaster ? matchedMaster.mrp : 0;
      const finalStock = Number.isFinite(rawStock) && rawStock >= 0 ? Math.floor(rawStock) : 0;

      const isGenericStock = (url) => {
        if (!url || typeof url !== "string") return true;
        const lower = url.toLowerCase();
        return (
          lower.includes("unsplash.com") ||
          lower.includes("via.placeholder") ||
          lower.includes("placeholder") ||
          lower.includes("picsum.photos") ||
          lower.includes("dummyimage")
        );
      };

      if (matchedMaster) {
        const verifiedMasterImage = (matchedMaster.imageUrl && !isGenericStock(matchedMaster.imageUrl))
          ? matchedMaster.imageUrl
          : "";

        matchedProducts.push({
          rowNumber: rowNum,
          masterProductId: matchedMaster._id,
          productId: matchedMaster.productId,
          catalogId: matchedMaster.productId,
          name: matchedMaster.name,
          description: matchedMaster.description || "",
          brand: matchedMaster.brand,
          variant: matchedMaster.variant || "",
          packSize: matchedMaster.packSize,
          unit: matchedMaster.unit || "packet",
          barcode: matchedMaster.barcode || rawBarcode,
          category: matchedMaster.category,
          categoryId: matchedMaster.categoryId,
          mrp: matchedMaster.mrp,
          sellingPrice: finalPrice || matchedMaster.mrp,
          stockQuantity: finalStock,
          isAvailable: finalStock > 0,
          imageUrl: verifiedMasterImage,
          matchType: "catalog_verified",
          confidence: "high",
        });
      } else {
        unmatchedProducts.push({
          rowNumber: rowNum,
          masterProductId: null,
          productId: `LOCAL-${Date.now()}-${index}`,
          catalogId: null,
          name: rawName,
          description: rawDescription || "",
          brand: rawBrand || "Local Brand",
          variant: "",
          packSize: rawPack,
          unit: "piece",
          barcode: rawBarcode,
          category: rawCategory || "Other / Local Products",
          categoryId: "other-local-products",
          mrp: finalPrice || 0,
          sellingPrice: finalPrice || 0,
          stockQuantity: finalStock,
          isAvailable: finalStock > 0,
          imageUrl: "",
          matchType: "custom_unmatched",
          confidence: "none",
        });
      }
    });

    return res.status(200).json({
      success: true,
      summary: {
        totalRows: rows.length,
        matchedCount: matchedProducts.length,
        unmatchedCount: unmatchedProducts.length,
      },
      matchedProducts,
      unmatchedProducts,
    });
  } catch (error) {
    console.error("Match supplier products error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to match supplier products.",
    });
  }
};

// =========================================================================
// 9. AI PRODUCT IMAGE GENERATION (Single Item)
// =========================================================================
export const generateAiImage = async (req, res) => {
  try {
    const { name, description, brand, category, variant, packSize, barcode, forceAi } =
      req.body;

    if (!String(name || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required to generate a matching image.",
      });
    }

    const result = await generateOrMatchProductImage({
      name,
      description,
      brand,
      category,
      variant,
      packSize,
      barcode,
      forceAi: Boolean(forceAi),
    });

    return res.status(200).json({
      success: true,
      imageUrl: result.url,
      source: result.source,
      promptUsed: result.promptUsed,
      matchedName: result.matchedName,
    });
  } catch (error) {
    console.error("AI image generation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate AI product image.",
    });
  }
};

// =========================================================================
// 10. AI PRODUCT IMAGE GENERATION (Batch for missing images)
// =========================================================================
export const batchGenerateAiImages = async (req, res) => {
  try {
    const { products } = req.body;

    if (!Array.isArray(products) || !products.length) {
      return res.status(400).json({
        success: false,
        message: "No products provided for AI image generation.",
      });
    }

    // Limit to max 15 products per batch to prevent server overload
    const batch = products.slice(0, 15);
    const results = [];

    for (let i = 0; i < batch.length; i++) {
      const item = batch[i];
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      try {
        const result = await generateOrMatchProductImage({
          name: item.name,
          description: item.description,
          brand: item.brand,
          category: item.category,
          variant: item.variant,
          packSize: item.packSize,
          barcode: item.barcode,
          forceAi: item.forceAi || false,
        });

        results.push({
          id: item.catalogId || item.productId || item.name,
          productId: item.productId || item.catalogId,
          name: item.name,
          index: item.index,
          imageUrl: result.url,
          source: result.source,
          success: true,
        });
      } catch (itemErr) {
        results.push({
          id: item.catalogId || item.productId || item.name,
          productId: item.productId || item.catalogId,
          name: item.name,
          index: item.index,
          success: false,
          error: itemErr.message,
        });
      }
    }

    return res.status(200).json({
      success: true,
      results,
      count: results.filter((r) => r.success).length,
    });
  } catch (error) {
    console.error("Batch AI image generation error:", error);
    return res.status(500).json({
      success: false,
      message: "Batch AI image generation failed.",
    });
  }
};
