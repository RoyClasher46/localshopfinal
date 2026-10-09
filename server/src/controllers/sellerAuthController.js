import bcrypt from "bcryptjs";

import Seller from "../models/Seller.js";
import { generateToken } from "../utils/token.js";

const formatSellerResponse = (seller) => ({
  id: seller._id,
  ownerName: seller.ownerName,
  email: seller.email,
  phone: seller.phone,
  isActive: seller.isActive,
  approvalStatus: seller.approvalStatus || "pending",
  rejectionReason: seller.rejectionReason || "",
  approvedAt: seller.approvedAt || null,
  rejectedAt: seller.rejectedAt || null,
  isEmailVerified: seller.isEmailVerified,
  isPhoneVerified: seller.isPhoneVerified,
  type: "seller",
});

//---->>>> SELLER SIGNUP
// POST /api/seller-auth/signup

export const signupSeller = async (req, res) => {
  try {
    const { ownerName, email, phone, password } = req.body;

    if (!ownerName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Owner name, email, phone and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingSeller = await Seller.findOne({
      email: normalizedEmail,
    });

    if (existingSeller) {
      return res.status(409).json({
        success: false,
        message: "A seller account with this email already exists.",
      });
    }

    //-->>> Hash password

    const hashedPassword = await bcrypt.hash(password, 12);

    const seller = await Seller.create({
      ownerName: ownerName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      approvalStatus: "pending",
    });

    //--->>> Generate seller JWT

    const token = generateToken(seller._id, "seller");

    return res.status(201).json({
      success: true,
      message: "Seller account created successfully. Awaiting Super Admin approval.",
      token,
      seller: formatSellerResponse(seller),
    });
  } catch (error) {
    console.error("Seller signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create seller account.",
    });
  }
};

//---->>> SELLER LOGIN
// POST /api/seller-auth/login

export const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const seller = await Seller.findOne({
      email: normalizedEmail,
    });

    if (!seller) {
      return res.status(401).json({
        success: false,
        message: "Invalid seller email or password.",
      });
    }

    if (!seller.isActive) {
      return res.status(403).json({
        success: false,
        message: "Seller account is currently inactive.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, seller.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid seller email or password.",
      });
    }

    const token = generateToken(seller._id, "seller");

    return res.status(200).json({
      success: true,
      message: "Seller login successful.",
      token,

      seller: formatSellerResponse(seller),
    });
  } catch (error) {
    console.error("Seller login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login.",
    });
  }
};

//---->>> GET CURRENT SELLER
// GET /api/seller-auth/me

export const getCurrentSeller = async (req, res) => {
  try {
    if (!req.seller || !req.seller.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const seller = await Seller.findById(req.seller.id).select("-password");

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller account not found.",
      });
    }

    if (!seller.isActive) {
      return res.status(403).json({
        success: false,
        message: "Seller account is currently inactive.",
      });
    }

    return res.status(200).json({
      success: true,

      seller: formatSellerResponse(seller),
    });
  } catch (error) {
    console.error("Get current seller error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch seller profile.",
    });
  }
};

//---->>> SELLER LOGOUT
// POST /api/seller-auth/logout

export const logoutSeller = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Seller logged out successfully.",
    });
  } catch (error) {
    console.error("Seller logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to logout.",
    });
  }
};

//--->>> UPDATE SELLER PROFILE
// PUT /api/auth/seller/profile

export const updateSellerProfile = async (req, res) => {
  try {
    const sellerId = req.seller?.id;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller account not found.",
      });
    }

    const { ownerName, email, phone } = req.body;

    if (ownerName !== undefined) {
      if (!String(ownerName).trim()) {
        return res.status(400).json({
          success: false,
          message: "Seller name cannot be empty.",
        });
      }

      seller.ownerName = String(ownerName).trim();
    }

    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();

      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Email cannot be empty.",
        });
      }

      const existingSeller = await Seller.findOne({
        email: normalizedEmail,
        _id: { $ne: sellerId },
      });

      if (existingSeller) {
        return res.status(409).json({
          success: false,
          message: "This email is already being used by another seller.",
        });
      }

      seller.email = normalizedEmail;
    }

    if (phone !== undefined) {
      if (!String(phone).trim()) {
        return res.status(400).json({
          success: false,
          message: "Phone number cannot be empty.",
        });
      }

      seller.phone = String(phone).trim();
    }

    await seller.save();

    return res.status(200).json({
      success: true,
      message: "Account details updated successfully.",
      seller: formatSellerResponse(seller),
    });
  } catch (error) {
    console.error("Update seller profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update account details.",
    });
  }
};

//--->>> CHANGE SELLER PASSWORD
// PUT /api/auth/seller/password

export const changeSellerPassword = async (req, res) => {
  try {
    const sellerId = req.seller?.id;

    if (!sellerId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const seller = await Seller.findById(sellerId);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller account not found.",
      });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      seller.password,
    );

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    seller.password = await bcrypt.hash(newPassword, 12);

    await seller.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change seller password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to change password.",
    });
  }
};
