import mongoose from "mongoose";

import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Seller from "../models/Seller.js";
import Shop from "../models/Shop.js";

//---->>>> CHECK TARGET EXISTS
// Shop    -> Seller._id
// Product -> Product._id

const syncShopRating = async (shopId) => {
  if (!shopId || !mongoose.Types.ObjectId.isValid(shopId)) {
    return;
  }

  const stats = await Review.aggregate([
    {
      $match: {
        targetType: "Shop",
        target: new mongoose.Types.ObjectId(shopId),
        isActive: true,
      },
    },

    {
      $group: {
        _id: null,

        totalReviews: {
          $sum: 1,
        },

        totalRating: {
          $sum: "$rating",
        },

        one: {
          $sum: {
            $cond: [{ $eq: ["$rating", 1] }, 1, 0],
          },
        },

        two: {
          $sum: {
            $cond: [{ $eq: ["$rating", 2] }, 1, 0],
          },
        },

        three: {
          $sum: {
            $cond: [{ $eq: ["$rating", 3] }, 1, 0],
          },
        },

        four: {
          $sum: {
            $cond: [{ $eq: ["$rating", 4] }, 1, 0],
          },
        },

        five: {
          $sum: {
            $cond: [{ $eq: ["$rating", 5] }, 1, 0],
          },
        },
      },
    },
  ]);

  const result = stats[0];

  const totalReviews = result?.totalReviews || 0;
  const totalRating = result?.totalRating || 0;

  const average =
    totalReviews > 0 ? Number((totalRating / totalReviews).toFixed(1)) : 0;

  await Shop.findByIdAndUpdate(
    shopId,
    {
      $set: {
        "rating.average": average,
        "rating.totalReviews": totalReviews,
        "rating.distribution": {
          one: result?.one || 0,
          two: result?.two || 0,
          three: result?.three || 0,
          four: result?.four || 0,
          five: result?.five || 0,
        },
      },
    },
    {
      new: true,
    },
  );
};

const targetExists = async (targetType, targetId) => {
  if (targetType === "Shop") {
    return Shop.findOne({
      _id: targetId,
      isActive: true,
      isSuspended: false,
    });
  }

  if (targetType === "Product") {
    return Product.findOne({
      _id: targetId,
      isActive: true,
    });
  }



  return null;
};

//---->>> CREATE REVIEW
// POST /api/reviews
// USER

export const createReview = async (req, res) => {
  try {
    const { targetType, target, rating, comment } = req.body;

    if (
      !targetType ||
      !target ||
      rating === undefined ||
      comment === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Target type, target, rating and comment are required.",
      });
    }

    if (!["Shop", "Product"].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: "Target type must be Shop or Product.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(target)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target ID.",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5.",
      });
    }

    if (typeof comment !== "string" || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty.",
      });
    }

    const trimmedComment = comment.trim();

    const targetDocument = await targetExists(targetType, target);

    if (!targetDocument) {
      return res.status(404).json({
        success: false,
        message: `${targetType} not found.`,
      });
    }

    const existingReview = await Review.findOne({
      user: req.user.id,
      targetType,
      target,
      isActive: true,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this item.",
      });
    }

    const review = await Review.create({
      user: req.user.id,
      targetType,
      target,
      rating: numericRating,
      comment: trimmedComment,
    });

    if (targetType === "Shop") {
      await syncShopRating(target);
    }

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name email")
      .populate("sellerReply.repliedBy", "ownerName");

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Create review error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this item.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create review.",
    });
  }
};

//--->>> GET REVIEWS BY TARGET
// GET /api/reviews/:targetType/:targetId
// PUBLIC

export const getReviewsByTarget = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    if (!targetType) {
      return res.status(400).json({
        success: false,
        message: "Target type is required.",
      });
    }

    const normalizedTargetType =
      targetType.charAt(0).toUpperCase() + targetType.slice(1).toLowerCase();

    if (!["Shop", "Product"].includes(normalizedTargetType)) {
      return res.status(400).json({
        success: false,
        message: "Target type must be shop or product.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target ID.",
      });
    }

    const targetDocument = await targetExists(normalizedTargetType, targetId);

    if (!targetDocument) {
      return res.status(404).json({
        success: false,
        message: `${normalizedTargetType} not found.`,
      });
    }

    const reviews = await Review.find({
      targetType: normalizedTargetType,
      target: targetId,
      isActive: true,
    })
      .populate("user", "name")
      .populate("sellerReply.repliedBy", "ownerName")
      .sort({ createdAt: -1 });

    const count = reviews.length;

    const averageRating =
      count > 0
        ? Number(
            (
              reviews.reduce((total, review) => total + review.rating, 0) /
              count
            ).toFixed(1),
          )
        : 0;

    return res.status(200).json({
      success: true,
      targetType: normalizedTargetType,
      targetId,
      count,
      averageRating,
      reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch reviews.",
    });
  }
};

//--->>> GET MY REVIEWS
// GET /api/reviews/my
// USER

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      user: req.user.id,
      isActive: true,
    })
      .populate("sellerReply.repliedBy", "ownerName")
      .sort({ createdAt: -1 });

    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        let targetInfo = null;

        if (review.targetType === "Shop") {
          const seller = await Seller.findById(review.target).select(
            "ownerName email phone shop",
          );

          if (seller) {
            targetInfo = {
              id: seller._id,
              type: "Shop",
              name: seller.shop?.name || "",
              category: seller.shop?.category || "",
              image: seller.shop?.image || "",
            };
          }
        }

        if (review.targetType === "Product") {
          const product = await Product.findById(review.target).select(
            "name category price image shop seller",
          );

          if (product) {
            targetInfo = {
              id: product._id,
              type: "Product",
              name: product.name || "",
              category: product.category || "",
              price: product.price,
              image: product.image || "",
              shop: product.shop,
              seller: product.seller,
            };
          }
        }


        return {
          ...review.toObject(),
          targetInfo,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      count: enrichedReviews.length,
      reviews: enrichedReviews,
    });
  } catch (error) {
    console.error("Get my reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch your reviews.",
    });
  }
};

//---->>> UPDATE REVIEW
// PUT /api/reviews/:id
// USER - OWNER

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID.",
      });
    }

    const review = await Review.findOne({
      _id: id,
      isActive: true,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (review.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this review.",
      });
    }

    const { rating, comment } = req.body;

    if (rating === undefined && comment === undefined) {
      return res.status(400).json({
        success: false,
        message: "Rating or comment is required.",
      });
    }

    if (rating !== undefined) {
      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be an integer between 1 and 5.",
        });
      }

      review.rating = numericRating;
    }

    if (comment !== undefined) {
      if (typeof comment !== "string" || !comment.trim()) {
        return res.status(400).json({
          success: false,
          message: "Comment cannot be empty.",
        });
      }

      review.comment = comment.trim();
    }

    await review.save();

    if (review.targetType === "Shop") {
      await syncShopRating(review.target);
    }

    const updatedReview = await Review.findById(review._id)
      .populate("user", "name email")
      .populate("sellerReply.repliedBy", "ownerName");

    return res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Update review error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update review.",
    });
  }
};

//--->>>> DELETE REVIEW
// DELETE /api/reviews/:id
// USER - OWNER

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID.",
      });
    }

    const review = await Review.findOne({
      _id: id,
      isActive: true,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    if (review.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this review.",
      });
    }

    review.isActive = false;

    await review.save();

    if (review.targetType === "Shop") {
      await syncShopRating(review.target);
    }

    return res.status(200).json({
      success: true,
      message: "Review removed successfully.",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete review.",
    });
  }
};

//---->>>> GET SELLER REVIEWS
// GET /api/reviews/seller
// SELLER

export const getSellerReviews = async (req, res) => {
  try {
    const sellerId = req.seller.id;

    const seller = await Seller.findOne({
      _id: sellerId,
      isActive: true,
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found.",
      });
    }

    const shop = await Shop.findOne({
      seller: sellerId,
      isActive: true,
    }).lean();

    const shopReviews = shop
      ? (
          await Review.find({
            targetType: "Shop",
            target: shop._id,
            isActive: true,
          })
            .populate("user", "name email")
            .populate("sellerReply.repliedBy", "ownerName")
            .sort({ createdAt: -1 })
        ).map((review) => ({
          ...review.toObject(),

          shopName: seller.shop?.name || shop.name || "Shop",

          shopImage: seller.shop?.image || shop.image || "",

          shopCategory: seller.shop?.category || shop.category || "",
        }))
      : [];

    const products = await Product.find({
      seller: sellerId,
      isActive: true,
    }).select("_id name");

    const productIds = products.map((product) => product._id);

    const productReviews =
      productIds.length > 0
        ? await Review.find({
            targetType: "Product",
            target: {
              $in: productIds,
            },
            isActive: true,
          })
            .populate("user", "name email phone")
            .populate("sellerReply.repliedBy", "ownerName")
            .sort({ createdAt: -1 })
        : [];

    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );

    const enrichedProductReviews = productReviews.map((review) => {
      const product = productMap.get(review.target.toString());

      return {
        ...review.toObject(),

        productId: product?._id || null,

        productName: product?.name || "Unknown Product",
      };
    });

    return res.status(200).json({
      success: true,

      shopReviewCount: shopReviews.length,

      productReviewCount: enrichedProductReviews.length,

      totalReviews: shopReviews.length + enrichedProductReviews.length,

      shop: {
        id: shop?._id || null,

        name: shop?.name || seller.shop?.name || "",

        image: shop?.image || seller.shop?.image || "",

        category: shop?.category || seller.shop?.category || "",
      },

      shopReviews,

      productReviews: enrichedProductReviews,
    });
  } catch (error) {
    console.error("Get seller reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch seller reviews.",
    });
  }
};

//--->>> SELLER REPLY
// PUT /api/reviews/:id/reply
// SELLER

export const replyToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID.",
      });
    }

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reply text is required.",
      });
    }

    const trimmedText = text.trim();

    const review = await Review.findOne({
      _id: id,
      isActive: true,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    const seller = await Seller.findOne({
      _id: req.seller.id,
      isActive: true,
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found.",
      });
    }

    let sellerOwnsTarget = false;

    if (review.targetType === "Shop") {
      const shop = await Shop.findOne({
        _id: review.target,
        seller: seller._id,
        isActive: true,
      });

      sellerOwnsTarget = !!shop;
    }

    if (review.targetType === "Product") {
      const product = await Product.findOne({
        _id: review.target,
        isActive: true,
      });

      if (product?.seller) {
        sellerOwnsTarget = product.seller.toString() === seller._id.toString();
      }
    }

    if (!sellerOwnsTarget) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to reply to this review.",
      });
    }

    review.sellerReply = {
      text: trimmedText,
      repliedAt: new Date(),
      repliedBy: seller._id,
    };

    await review.save();

    const updatedReview = await Review.findById(review._id)
      .populate("user", "name email")
      .populate("sellerReply.repliedBy", "ownerName");

    return res.status(200).json({
      success: true,
      message: "Reply added successfully.",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Reply to review error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reply to review.",
    });
  }
};
