import api from "./api";

/**
 * Customer signup
 *
 * POST /api/auth/user/signup
 */
export const signupUser = async (data) => {
  const response = await api.post("/auth/user/signup", {
    name: data.name,
    email: data.email,
    password: data.password,
  });

  return response.data;
};

/**
 * Customer login
 *
 * POST /api/auth/user/login
 */
export const loginUser = async (data) => {
  const response = await api.post("/auth/user/login", {
    email: data.email,
    password: data.password,
    role: "customer",
  });

  return response.data;
};

/**
 * Get currently authenticated customer
 *
 * GET /api/auth/user/me
 */
export const getCurrentUser = async () => {
  const response = await api.get("/auth/user/me");

  return response.data;
};

/**
 * Customer logout
 *
 * POST /api/auth/user/logout
 */
export const logoutUser = async () => {
  const response = await api.post("/auth/user/logout");

  return response.data;
};

/**
 * Seller signup
 *
 * POST /api/auth/seller/signup
 *
 * Seller account ONLY.
 */
export const signupSeller = async (data) => {
  const response = await api.post("/auth/seller/signup", {
    ownerName: data.ownerName,
    email: data.email,
    phone: data.phone,
    password: data.password,
  });

  return response.data;
};

/**
 * Seller login
 *
 * POST /api/auth/seller/login
 */
export const loginSeller = async (data) => {
  const response = await api.post("/auth/seller/login", {
    email: data.email,
    password: data.password,
  });

  return response.data;
};

/**
 * Get currently authenticated seller
 *
 * GET /api/auth/seller/me
 */
export const getCurrentSeller = async () => {
  const response = await api.get("/auth/seller/me");

  return response.data;
};

/**
 * Seller logout
 *
 * POST /api/auth/seller/logout
 */
export const logoutSeller = async () => {
  const response = await api.post("/auth/seller/logout");

  return response.data;
};
