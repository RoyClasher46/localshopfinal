import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    //--->> REVIEW AUTHOR

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    //--->> TARGET

    targetType: {
      type: String,
      required: true,
      enum: ["Shop", "Product"],
      index: true,
    },

    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
      index: true,
    },

    //--->>> RATING

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    //--->>> COMMENT

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    //--->>>> SELLER REPLY

    sellerReply: {
      text: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },

      repliedAt: {
        type: Date,
        default: null,
      },

      repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        default: null,
      },
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

reviewSchema.index({
  targetType: 1,
  target: 1,
  createdAt: -1,
});

reviewSchema.index({
  user: 1,
  createdAt: -1,
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
