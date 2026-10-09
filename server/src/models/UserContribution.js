import mongoose from "mongoose";

const userContributionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["shop"],
      required: true,
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    promotedDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    promotedModel: {
      type: String,
      enum: ["Shop", null],
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("UserContribution", userContributionSchema);
