import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

//--->>> AXIOS INSTANCE

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
});

//--->>> REQUEST INTERCEPTOR

api.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    const method = (config.method || "get").toLowerCase();

    const isAdminRequest = url.startsWith("/admin");

    const isSellerProductRequest =
      url === "/products/seller" ||
      (url === "/products" && method === "post") ||
      (url.startsWith("/products/") && ["put", "delete"].includes(method));

    const isSellerReviewRequest =
      url === "/reviews/seller" || /^\/reviews\/[^/]+\/reply$/.test(url);

    const isSellerRequest =
      url.startsWith("/auth/seller") ||
      url.startsWith("/seller") ||
      url.startsWith("/products/bulk") ||
      isSellerProductRequest ||
      url.startsWith("/orders/seller") ||
      url.startsWith("/customers") ||
      isSellerReviewRequest;

    //-->>> SELECT TOKEN

    let token = localStorage.getItem("shoplocal_token");
    if (isAdminRequest) {
      token = localStorage.getItem("shoplocal_admin_token");
    } else if (isSellerRequest) {
      token = localStorage.getItem("shoplocal_seller_token");
    }

    //-->>> AUTHORIZATION

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);

//--->>> USER AUTH API

export const userAPI = {
  signup: (data) => api.post("/auth/user/signup", data),

  login: (data) => api.post("/auth/user/login", data),

  me: () => api.get("/auth/user/me"),

  updateProfile: (data) => api.put("/auth/user/profile", data),

  updatePassword: (data) => api.put("/auth/user/password", data),

  logout: () => api.post("/auth/user/logout"),
};

//--->>>> USER ADDRESS API

export const addressAPI = {
  list: () => api.get("/users/me/addresses"),

  create: (data) => api.post("/users/me/addresses", data),

  update: (id, data) => api.put(`/users/me/addresses/${id}`, data),

  delete: (id) => api.delete(`/users/me/addresses/${id}`),
};

userAPI.addresses = addressAPI.list;
userAPI.addAddress = addressAPI.create;
userAPI.updateAddress = addressAPI.update;
userAPI.deleteAddress = addressAPI.delete;

//--->>> SELLER AUTH API

export const sellerAuthAPI = {
  signup: (data) => api.post("/auth/seller/signup", data),

  login: (data) => api.post("/auth/seller/login", data),

  me: () => api.get("/auth/seller/me"),

  logout: () => api.post("/auth/seller/logout"),

  updateProfile: (data) => api.put("/auth/seller/profile", data),

  changePassword: (data) => api.put("/auth/seller/password", data),
};

//-->>> SELLER SHOP API

export const sellerShopAPI = {
  // GET /api/seller/shop
  get: () => api.get("/seller/shop"),

  // POST /api/seller/shop
  create: (data) => api.post("/seller/shop", data),

  // PUT /api/seller/shop
  update: (data) => api.put("/seller/shop", data),
};

//-->>> SELLER PRODUCTS API

const buildProductFormData = (data) => {
  const formData = new FormData();

  formData.append("name", data.name || "");
  formData.append("description", data.description || "");
  formData.append("category", data.category || "");
  formData.append("price", String(data.price ?? ""));
  formData.append("stock", String(data.stock ?? ""));
  formData.append("unit", data.unit || "piece");

  if (Array.isArray(data.images)) {
    data.images.forEach((file) => {
      if (file instanceof File) {
        formData.append("images", file);
      }
    });
  }

  if (Array.isArray(data.existingImages)) {
    formData.append("existingImages", JSON.stringify(data.existingImages));
  }

  return formData;
};

export const sellerProductAPI = {
  products: (params = {}) =>
    api.get("/products/seller", {
      params,
    }),

  create: (data) => {
    const formData = buildProductFormData(data);

    return api.post("/products", formData);
  },

  update: (id, data) => {
    const formData = buildProductFormData(data);

    return api.put(`/products/${id}`, formData);
  },

  delete: (id) => api.delete(`/products/${id}`),

  generateAiImage: (id, forceAi = true, description = "") =>
    api.post(`/products/${id}/ai-image`, { forceAi, description }),
};

//-->>> BULK PRODUCT IMPORT API
export const bulkProductAPI = {
  getCategories: () => api.get("/products/bulk/categories"),

  getTemplateUrl: (categoryId, format = "xlsx") =>
    `${API_URL}/products/bulk/template?categoryId=${encodeURIComponent(categoryId)}&format=${format}`,

  getCustomTemplateUrl: (format = "xlsx") =>
    `${API_URL}/products/bulk/custom-template?format=${format}`,

  downloadTemplate: async (categoryId, format = "xlsx") => {
    return api.get("/products/bulk/template", {
      params: { categoryId, format },
      responseType: "blob",
    });
  },

  downloadCustomTemplate: async (format = "xlsx") => {
    return api.get("/products/bulk/custom-template", {
      params: { format },
      responseType: "blob",
    });
  },

  validateSheet: (file, categoryId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("categoryId", categoryId);
    return api.post("/products/bulk/validate", formData);
  },

  confirmImport: (data) => api.post("/products/bulk/confirm-import", data),

  addCustomProduct: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    return api.post("/products/bulk/custom-product", formData);
  },

  parseSupplierSheet: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/products/bulk/supplier-parse", formData);
  },

  matchSupplierProducts: (data) =>
    api.post("/products/bulk/supplier-match", data),

  generateAiImage: (data) => api.post("/products/bulk/ai-image", data),

  batchGenerateAiImages: (products) =>
    api.post("/products/bulk/ai-images-batch", { products }),
};

//--->>> PUBLIC SHOP API

export const shopAPI = {
  list: (params = {}) =>
    api.get("/shops", {
      params,
    }),

  get: (id) => api.get(`/shops/${id}`),
};

//--->>> PUBLIC PRODUCT API

export const productAPI = {
  list: (params = {}) =>
    api.get("/products", {
      params,
    }),

  get: (id) => api.get(`/products/${id}`),
};

//--->>> USER ORDER API

export const orderAPI = {
  create: (data) => api.post("/orders", data),

  mine: (params = {}) =>
    api.get("/orders/my", {
      params,
    }),

  one: (id) => api.get(`/orders/${id}`),

  cancel: (id, reason) =>
    api.put(`/orders/${id}/cancel`, {
      reason,
    }),
};

//--->>> SELLER ORDER API

export const sellerOrderAPI = {
  list: (params = {}) =>
    api.get("/orders/seller", {
      params,
    }),

  get: (id) => api.get(`/orders/seller/${id}`),

  updateStatus: (id, status) =>
    api.put(`/orders/seller/${id}/status`, {
      status,
    }),
};

//-->>> CUSTOMER API

export const customerAPI = {
  list: () => api.get("/customers"),

  get: (id) => api.get(`/customers/${id}`),

  orders: (id) => api.get(`/customers/${id}/orders`),
};


//--->>> COMMUNITY CONTRIBUTION API

export const contributionAPI = {
  submit: (data) => api.post("/contributions", data),
};

//-->>> REVIEW API

export const reviewAPI = {
  create: (data) => api.post("/reviews", data),

  mine: () => api.get("/reviews/my"),

  byTarget: (targetType, targetId) =>
    api.get(`/reviews/${targetType}/${targetId}`),

  update: (id, data) => api.put(`/reviews/${id}`, data),

  delete: (id) => api.delete(`/reviews/${id}`),
};

//--->>> SELLER REVIEW API

export const sellerReviewAPI = {
  list: () => api.get("/reviews/seller"),

  reply: (id, text) =>
    api.put(`/reviews/${id}/reply`, {
      text,
    }),
};

//--->>> SELLER ANALYTICS API

export const analyticsAPI = {
  get: (period = "7d") =>
    api.get("/seller/analytics", {
      params: {
        period,
      },
    }),
};

//--->>> SELLER SETTINGS API

export const sellerSettingsAPI = {
  get: () => api.get("/seller/settings"),

  update: (data) => api.put("/seller/settings", data),
};

//--->>> BACKWARD-COMPATIBLE SELLER API

export const sellerAPI = {
  signup: sellerAuthAPI.signup,
  login: sellerAuthAPI.login,
  me: sellerAuthAPI.me,
  logout: sellerAuthAPI.logout,

  shop: sellerShopAPI.get,
  createShop: sellerShopAPI.create,
  updateShop: sellerShopAPI.update,

  products: sellerProductAPI.products,
  createProduct: sellerProductAPI.create,
  updateProduct: sellerProductAPI.update,
  deleteProduct: sellerProductAPI.delete,

  orders: sellerOrderAPI.list,
  order: sellerOrderAPI.get,
  updateOrderStatus: sellerOrderAPI.updateStatus,

  customers: customerAPI.list,
  customer: customerAPI.get,
  customerOrders: customerAPI.orders,

  reviews: sellerReviewAPI.list,
  replyToReview: sellerReviewAPI.reply,

  analytics: analyticsAPI.get,

  settings: sellerSettingsAPI.get,
  updateSettings: sellerSettingsAPI.update,
};

//--->>> BACKWARD-COMPATIBLE PUBLIC API

export const publicAPI = {
  shops: shopAPI.list,
  shop: shopAPI.get,

  products: productAPI.list,
  product: productAPI.get,


  reviews: reviewAPI.byTarget,
};

//--->>> SUPER ADMIN API

export const adminAPI = {
  login: (data) => api.post("/admin/login", data),
  me: () => api.get("/admin/me"),
  sellers: (params = {}) => api.get("/admin/sellers", { params }),
  approveSeller: (id) => api.patch(`/admin/sellers/${id}/approve`),
  rejectSeller: (id, data) => api.patch(`/admin/sellers/${id}/reject`, data),
  revertSeller: (id) => api.patch(`/admin/sellers/${id}/revert`),
};

//--->>> HEALTH CHECK

export const healthAPI = {
  check: () => api.get("/health"),
};

export default api;
