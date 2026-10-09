import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import Seller from "../models/Seller.js";
import Shop from "../models/Shop.js";
import Product from "../models/Product.js";
import { generateToken } from "../utils/token.js";

//--->>> SUPER ADMIN LOGIN
// POST /api/admin/login

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // STRICT CHECK: Only admin@gmail.com can log in as Super Admin
    if (normalizedEmail !== "admin@gmail.com") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only the authorized Super Admin (admin@gmail.com) can access this portal.",
      });
    }

    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Super Admin account not found.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, admin.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid Super Admin credentials.",
      });
    }

    const token = generateToken(admin._id, "admin");

    return res.status(200).json({
      success: true,
      message: "Super Admin logged in successfully.",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        isSuperAdmin: admin.isSuperAdmin,
        type: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to process Super Admin login.",
    });
  }
};

//--->>> GET CURRENT ADMIN
// GET /api/admin/me

export const getCurrentAdmin = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      admin: req.admin,
    });
  } catch (error) {
    console.error("Get current admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve admin profile.",
    });
  }
};

//--->>> GET ALL SELLERS (WITH SHOPS & STATS)
// GET /api/admin/sellers

export const getSellers = async (req, res) => {
  try {
    const { status, search } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.approvalStatus = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { ownerName: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    const sellers = await Seller.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // Also fetch associated shop for each seller
    const sellerIds = sellers.map((s) => s._id);
    const shops = await Shop.find({ seller: { $in: sellerIds } }).lean();

    const shopMap = {};
    for (const shop of shops) {
      shopMap[String(shop.seller)] = shop;
    }

    // Also get product count for each seller
    const productsCountMap = {};
    const productCounts = await Product.aggregate([
      { $match: { seller: { $in: sellerIds } } },
      { $group: { _id: "$seller", count: { $sum: 1 } } },
    ]);
    for (const pc of productCounts) {
      productsCountMap[String(pc._id)] = pc.count;
    }

    // Attach shop and product count to seller data
    const enrichedSellers = sellers.map((seller) => {
      const shop = shopMap[String(seller._id)] || null;
      const productCount = productsCountMap[String(seller._id)] || 0;
      return {
        ...seller,
        approvalStatus: seller.approvalStatus || "pending",
        shop,
        productCount,
      };
    });

    // Compute summary stats across all sellers
    const [total, pending, approved, rejected] = await Promise.all([
      Seller.countDocuments(),
      Seller.countDocuments({
        $or: [{ approvalStatus: "pending" }, { approvalStatus: { $exists: false } }],
      }),
      Seller.countDocuments({ approvalStatus: "approved" }),
      Seller.countDocuments({ approvalStatus: "rejected" }),
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        approved,
        rejected,
      },
      count: enrichedSellers.length,
      sellers: enrichedSellers,
    });
  } catch (error) {
    console.error("Get sellers for admin error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch shop owners list.",
    });
  }
};

//--->>> APPROVE SELLER
// PATCH /api/admin/sellers/:id/approve

export const approveSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await Seller.findById(id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Shop owner not found.",
      });
    }

    seller.approvalStatus = "approved";
    seller.approvedAt = new Date();
    seller.rejectionReason = "";
    seller.isActive = true;

    await seller.save();

    // If shop exists, activate and mark verified
    const shop = await Shop.findOne({ seller: seller._id });
    if (shop) {
      shop.isActive = true;
      shop.verification = shop.verification || {};
      shop.verification.isVerified = true;
      shop.verification.verifiedAt = new Date();
      await shop.save();
    }

    return res.status(200).json({
      success: true,
      message: `Shop owner "${seller.ownerName}" has been successfully approved! They can now list products and manage their shop.`,
      seller: {
        id: seller._id,
        ownerName: seller.ownerName,
        email: seller.email,
        phone: seller.phone,
        approvalStatus: seller.approvalStatus,
        approvedAt: seller.approvedAt,
        isActive: seller.isActive,
        shop,
      },
    });
  } catch (error) {
    console.error("Approve seller error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to approve shop owner.",
    });
  }
};

//--->>> REJECT SELLER
// PATCH /api/admin/sellers/:id/reject

export const rejectSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const seller = await Seller.findById(id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Shop owner not found.",
      });
    }

    seller.approvalStatus = "rejected";
    seller.rejectedAt = new Date();
    seller.rejectionReason = String(reason || "Application rejected by Super Admin.").trim();

    await seller.save();

    // If shop exists, deactivate
    const shop = await Shop.findOne({ seller: seller._id });
    if (shop) {
      shop.isActive = false;
      await shop.save();
    }

    return res.status(200).json({
      success: true,
      message: `Shop owner "${seller.ownerName}" has been rejected.`,
      seller: {
        id: seller._id,
        ownerName: seller.ownerName,
        email: seller.email,
        phone: seller.phone,
        approvalStatus: seller.approvalStatus,
        rejectionReason: seller.rejectionReason,
        rejectedAt: seller.rejectedAt,
        isActive: seller.isActive,
        shop,
      },
    });
  } catch (error) {
    console.error("Reject seller error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to reject shop owner.",
    });
  }
};

//--->>> REVERT SELLER TO PENDING
// PATCH /api/admin/sellers/:id/revert

export const revertSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await Seller.findById(id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Shop owner not found.",
      });
    }

    seller.approvalStatus = "pending";
    seller.rejectionReason = "";
    seller.approvedAt = null;
    seller.rejectedAt = null;

    await seller.save();

    return res.status(200).json({
      success: true,
      message: `Shop owner "${seller.ownerName}" status reset to Pending Review.`,
      seller: {
        id: seller._id,
        ownerName: seller.ownerName,
        email: seller.email,
        phone: seller.phone,
        approvalStatus: seller.approvalStatus,
        isActive: seller.isActive,
      },
    });
  } catch (error) {
    console.error("Revert seller error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to revert shop owner status.",
    });
  }
};
