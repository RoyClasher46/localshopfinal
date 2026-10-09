import mongoose from "mongoose";

const masterCategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    iconName: {
      type: String,
      default: "Package",
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
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

masterCategorySchema.index({ name: "text", description: "text" });

const MasterCategory = mongoose.model("MasterCategory", masterCategorySchema);

export default MasterCategory;
