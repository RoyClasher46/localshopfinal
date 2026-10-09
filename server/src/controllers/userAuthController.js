import bcrypt from "bcryptjs";

import User from "../models/User.js";
import { generateToken } from "../utils/token.js";

//--->> USER SIGNUP

export const signupUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
    });

    const token = generateToken(user._id, "user");

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        type: "user",
      },
    });
  } catch (error) {
    console.error("User signup error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  }
};

//-->> USER LOGIN

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is currently inactive.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id, "user");

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        type: "user",
      },
    });
  } catch (error) {
    console.error("User login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login.",
    });
  }
};

//--->> GET CURRENT USER
// GET /api/user-auth/me

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (req.user.type !== "user") {
      return res.status(403).json({
        success: false,
        message: "User authentication required.",
      });
    }

    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is currently inactive.",
      });
    }

    return res.status(200).json({
      success: true,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        type: "user",
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch user profile.",
    });
  }
};

//--->>> USER LOGOUT
// POST /api/user-auth/logout

export const logoutUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("User logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to logout.",
    });
  }
};

//--->>> UPDATE USER PROFILE
// PUT /api/auth/user/profile
// PROTECTED USER ROUTE

export const updateUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (req.user.type !== "user") {
      return res.status(403).json({
        success: false,
        message: "User authentication required.",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is currently inactive.",
      });
    }

    const { name, email, phone } = req.body;

    if (name !== undefined) {
      const trimmedName = String(name).trim();

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty.",
        });
      }

      user.name = trimmedName;
    }

    if (email !== undefined) {
      const normalizedEmail = String(email).toLowerCase().trim();

      if (!normalizedEmail) {
        return res.status(400).json({
          success: false,
          message: "Email cannot be empty.",
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address.",
        });
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      user.email = normalizedEmail;
    }

    if (phone !== undefined) {
      user.phone = String(phone).trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        type: "user",
      },
    });
  } catch (error) {
    console.error("Update user profile error:", error);

    if (error?.code === 11000 && error?.keyPattern?.email) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update user profile.",
    });
  }
};

//---->>>> UPDATE USER PASSWORD
// PUT /api/auth/user/password
// PROTECTED USER ROUTE

export const updateUserPassword = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (req.user.type !== "user") {
      return res.status(403).json({
        success: false,
        message: "User authentication required.",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is currently inactive.",
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is required.",
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
    }

    // Verify current password
    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // Prevent reusing current password
    const samePassword = await bcrypt.compare(newPassword, user.password);

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message:
          "Your new password must be different from your current password.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Update user password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update password.",
    });
  }
};
