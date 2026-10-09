import jwt from "jsonwebtoken";

export const generateToken = (id, type) => {
  return jwt.sign(
    {
      id,
      type,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};
