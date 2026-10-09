import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
      index: true,
    },

    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    reservedStock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    unit: {
      type: String,
      default: "piece",
      trim: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Master Catalog References & Attributes
    masterProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MasterProduct",
      default: null,
      index: true,
    },

    catalogId: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },

    brand: {
      type: String,
      default: "",
      trim: true,
    },

    variant: {
      type: String,
      default: "",
      trim: true,
    },

    packSize: {
      type: String,
      default: "",
      trim: true,
    },

    barcode: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    mrp: {
      type: Number,
      default: null,
      min: 0,
    },

    isCustom: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({
  name: "text",
  description: "text",
  category: "text",
});

productSchema.index({
  shop: 1,
  isActive: 1,
  isAvailable: 1,
});

productSchema.index({
  shop: 1,
  catalogId: 1,
});

productSchema.index({
  shop: 1,
  name: 1,
  category: 1,
});

productSchema.virtual("availableStock").get(function () {
  return Math.max(0, Number(this.stock || 0) - Number(this.reservedStock || 0));
});

productSchema.set("toJSON", {
  virtuals: true,
});

productSchema.set("toObject", {
  virtuals: true,
});

const Product = mongoose.model("Product", productSchema);

export default Product;
