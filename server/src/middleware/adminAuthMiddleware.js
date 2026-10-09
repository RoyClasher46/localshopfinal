import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Super Admin authentication required.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only the authorized Super Admin can access this resource.",
      });
    }

    const admin = await Admin.findById(decoded.id);

    if (!admin || admin.email !== "admin@gmail.com" || !admin.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Invalid Super Admin account.",
      });
    }

    req.admin = {
      id: admin._id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      isSuperAdmin: admin.isSuperAdmin,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired Super Admin token.",
    });
  }
};

export default adminAuthMiddleware;
