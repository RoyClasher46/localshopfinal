import jwt from "jsonwebtoken";
import Seller from "../models/Seller.js";

const sellerAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Seller access required.",
      });
    }

    req.seller = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired seller token.",
    });
  }
};

export const requireApprovedSeller = async (req, res, next) => {
  try {
    const sellerId = req.seller?.id || req.seller?._id;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Seller authentication required.",
      });
    }

    const seller = await Seller.findById(sellerId);

    if (!seller || !seller.isActive) {
      return res.status(404).json({
        success: false,
        message: "Seller account not found or is currently inactive.",
      });
    }

    if (seller.approvalStatus !== "approved") {
      const isRejected = seller.approvalStatus === "rejected";
      return res.status(403).json({
        success: false,
        isApproved: false,
        approvalStatus: seller.approvalStatus,
        message: isRejected
          ? `Your seller account was rejected by the Super Admin.${seller.rejectionReason ? ` Reason: ${seller.rejectionReason}` : ""}`
          : "Your seller account is pending approval by the Super Admin. You cannot list products or perform seller operations until approved.",
      });
    }

    req.sellerDoc = seller;
    next();
  } catch (error) {
    console.error("Require approved seller error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify seller approval status.",
    });
  }
};

export default sellerAuthMiddleware;
