import mongoose from "mongoose";

const masterProductSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    categoryId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    variant: {
      type: String,
      default: "",
      trim: true,
    },
    packSize: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      default: "packet",
      trim: true,
    },
    barcode: {
      type: String,
      default: "",
      trim: true,
      sparse: true,
      index: true,
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

masterProductSchema.index({
  name: "text",
  brand: "text",
  variant: "text",
  category: "text",
});

masterProductSchema.index({ categoryId: 1, isActive: 1 });
masterProductSchema.index({ brand: 1, categoryId: 1 });

const MasterProduct = mongoose.model("MasterProduct", masterProductSchema);

export default MasterProduct;
