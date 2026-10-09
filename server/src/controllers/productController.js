import mongoose from "mongoose";

import Product from "../models/Product.js";
import Seller from "../models/Seller.js";
import Shop from "../models/Shop.js";

import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import generateOrMatchProductImage from "../utils/aiProductImageService.js";

const getSellerId = (req) => req.seller?.id || req.seller?._id;

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const parseJSON = (value, fallback = []) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

//--->>> CREATE

export const createProduct = async (req, res) => {
  try {
    const sellerId = getSellerId(req);

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    const { name, description, category, price, stock, unit, isAvailable } =
      req.body;

    if (
      !String(name || "").trim() ||
      !String(category || "").trim() ||
      price === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, category and price are required.",
      });
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock ?? 0);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be valid.",
      });
    }

    if (!Number.isFinite(numericStock) || numericStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be valid.",
      });
    }

    const seller = await Seller.findById(sellerId);

    if (!seller || !seller.isActive) {
      return res.status(404).json({
        success: false,
        message: "Seller not found or inactive.",
      });
    }

    if (seller.approvalStatus !== "approved") {
      const isRejected = seller.approvalStatus === "rejected";
      return res.status(403).json({
        success: false,
        isApproved: false,
        approvalStatus: seller.approvalStatus,
        message: isRejected
          ? `Your shop owner account was rejected by the Super Admin.${seller.rejectionReason ? ` Reason: ${seller.rejectionReason}` : ""}`
          : "Your shop owner account is pending approval by the Super Admin. You cannot list products until approved.",
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
        message: "Please create your shop before adding products.",
      });
    }

    const uploadedImages = [];

    if (req.files?.length) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(
          file.buffer,
          "shoplocal/products",
        );

        if (uploaded?.url) {
          uploadedImages.push(uploaded.url);
        }
      }
    }

    let existingImages = [];
    if (req.body.existingImages !== undefined) {
      existingImages = parseJSON(req.body.existingImages, []);
      if (!Array.isArray(existingImages)) {
        existingImages = [];
      }
      existingImages = existingImages.filter(
        (img) => typeof img === "string" && img.trim()
      );
    } else if (req.body.image && typeof req.body.image === "string" && req.body.image.trim()) {
      existingImages = [req.body.image.trim()];
    }

    const finalImages = [...existingImages, ...uploadedImages].filter(Boolean);
    const uniqueImages = [...new Set(finalImages)].slice(0, 4);
    const image = uniqueImages[0] || "";

    const product = await Product.create({
      seller: sellerId,
      shop: shop._id,

      name: String(name).trim(),
      description: String(description || "").trim(),
      category: String(category).trim(),

      price: numericPrice,
      stock: numericStock,

      image,

      images: uniqueImages,

      unit: String(unit || "piece").trim(),

      isAvailable:
        isAvailable === undefined
          ? numericStock > 0
          : String(isAvailable) === "true",

      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create product.",
    });
  }
};

//--->>> SELLER PRODUCTS

export const getSellerProducts = async (req, res) => {
  try {
    const sellerId = getSellerId(req);

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    const { search, category, status } = req.query;

    const filter = {
      seller: sellerId,
    };

    if (search?.trim()) {
      const regex = new RegExp(search.trim(), "i");

      filter.$or = [
        { name: regex },
        { description: regex },
        { category: regex },
      ];
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (status === "Available") {
      filter.isAvailable = true;
      filter.isActive = true;
    }

    if (status === "Unavailable") {
      filter.isAvailable = false;
    }

    if (status === "Inactive") {
      filter.isActive = false;
    }

    const products = await Product.find(filter)
      .populate("shop", "name category")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get seller products error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch products.",
    });
  }
};

//--->>> PUBLIC PRODUCTS

export const getProducts = async (req, res) => {
  try {
    const { search, category, shop, minPrice, maxPrice } = req.query;

    const filter = {
      isActive: true,
      isAvailable: true,
    };

    if (search?.trim()) {
      const regex = new RegExp(search.trim(), "i");

      filter.$or = [
        { name: regex },
        { description: regex },
        { category: regex },
      ];
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (shop) {
      if (!isValidObjectId(shop)) {
        return res.status(400).json({
          success: false,
          message: "Invalid shop ID.",
        });
      }

      filter.shop = shop;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    const products = await Product.find(filter)
      .populate("seller", "ownerName email phone")
      .populate("shop", "name category image logo location rating")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch products.",
    });
  }
};

//---->>> SINGLE PRODUCT

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findOne({
      _id: id,
      isActive: true,
    })
      .populate("seller", "ownerName email phone")
      .populate("shop", "name category image");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch product.",
    });
  }
};

//--->>> UPDATE

export const updateProduct = async (req, res) => {
  try {
    const sellerId = getSellerId(req);
    const { id } = req.params;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findOne({
      _id: id,
      seller: sellerId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const fields = [
      "name",
      "description",
      "category",
      "price",
      "stock",
      "unit",
      "isAvailable",
      "isActive",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    let existingImages = [];

    if (req.body.existingImages !== undefined) {
      existingImages = parseJSON(req.body.existingImages, []);

      if (!Array.isArray(existingImages)) {
        existingImages = [];
      }

      existingImages = existingImages.filter(
        (image) => typeof image === "string" && image.trim(),
      );
    } else {
      existingImages = Array.isArray(product.images)
        ? product.images.filter(Boolean)
        : [];
    }

    //--->>> NEW IMAGES

    const newUploadedImages = [];

    if (req.files?.length) {
      for (const file of req.files) {
        const uploaded = await uploadToCloudinary(
          file.buffer,
          "shoplocal/products",
        );

        if (uploaded?.url) {
          newUploadedImages.push(uploaded.url);
        }
      }
    }

    const finalImages = [...existingImages, ...newUploadedImages].filter(
      Boolean,
    );

    const uniqueImages = [...new Set(finalImages)].slice(0, 4);

    product.images = uniqueImages;
    product.image = uniqueImages[0] || "";

    //--->>> VALIDATE PRICE / STOCK

    product.price = Number(product.price);
    product.stock = Number(product.stock);

    if (!Number.isFinite(product.price) || product.price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be valid.",
      });
    }

    if (!Number.isFinite(product.stock) || product.stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be valid.",
      });
    }

    const reservedStock = Number(product.reservedStock || 0);

    if (product.stock < reservedStock) {
      return res.status(400).json({
        success: false,
        message: `Stock cannot be less than reserved stock (${reservedStock}).`,
      });
    }

    product.isAvailable = product.stock - reservedStock > 0;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update product.",
    });
  }
};

//--->>> DELETE / SOFT DELETE

export const deleteProduct = async (req, res) => {
  try {
    const sellerId = getSellerId(req);
    const { id } = req.params;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findOne({
      _id: id,
      seller: sellerId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    await Product.deleteOne({
      _id: id,
      seller: sellerId,
    });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete product.",
    });
  }
};

//--->>> AI GENERATE PRODUCT IMAGE
export const generateProductAiImage = async (req, res) => {
  try {
    const sellerId = getSellerId(req);
    const { id } = req.params;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID.",
      });
    }

    const product = await Product.findOne({
      _id: id,
      seller: sellerId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const result = await generateOrMatchProductImage({
      name: product.name,
      description: req.body.description || product.description || "",
      brand: product.brand,
      category: product.category,
      variant: product.variant,
      packSize: product.packSize,
      barcode: product.barcode,
      forceAi: req.body.forceAi !== false,
    });

    product.image = result.url;
    product.images = [
      result.url,
      ...(product.images || []).filter((img) => img !== result.url),
    ].slice(0, 4);

    await product.save();

    return res.status(200).json({
      success: true,
      message: "AI product image generated and saved successfully.",
      product,
      imageUrl: result.url,
      source: result.source,
    });
  } catch (error) {
    console.error("Generate product AI image error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to generate AI image for product.",
    });
  }
};
