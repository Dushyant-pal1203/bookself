import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to admin login for admin routes
    const isAdminRoute = window.location.pathname.includes("/admin");

    if (error.response?.status === 401) {
      // For customer routes, just show a toast and don't redirect
      if (
        !isAdminRoute &&
        !window.location.pathname.includes("/customer/login")
      ) {
        // Don't show error for checkout - let it continue with localStorage
        if (!window.location.pathname.includes("/checkout")) {
          toast.error("Session expired. Please login again.");
        }
        // Clear any customer tokens if they exist
        localStorage.removeItem("customer_token");
        localStorage.removeItem("customer_user");
        // Don't redirect - let the customer continue as guest
        return Promise.reject(error);
      }

      // Only redirect to admin login for admin routes
      if (isAdminRoute && !window.location.pathname.includes("/admin/login")) {
        localStorage.removeItem("admin_token");
        window.location.href = "/admin/login";
        toast.error("Session expired. Please login again.");
      }
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  me: () => api.get("/auth/me"),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  loginWithOTP: (data: { phone_number: string; otp: string }) =>
    api.post("/auth/login-otp", data),
  sendOTP: (phone_number: string) =>
    api.post("/auth/send-otp", { phone_number }),
  logout: () => api.post("/auth/logout"),
  setup: (data: any) => api.post("/auth/setup", data),

  // ✅ THESE ARE ALREADY ADDED - Good!
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data: { name: string; email: string }) =>
    api.put("/auth/profile", data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.post("/auth/change-password", data),
};

// Article API
export const articleAPI = {
  getAll: () => api.get("/articles"),
  getPublic: () => api.get("/articles/public"),
  getPublicById: (id: number) => api.get(`/articles/public/${id}`),
  getById: (id: number) => api.get(`/articles/${id}`),
  getRelated: (id: number, type?: string) => {
    // Try to get related by type first, fallback to all articles
    return api
      .get(`/articles/${id}/related`, { params: { type } })
      .catch(() => {
        // If related endpoint fails, return empty array
        return { data: [] };
      });
  },
  create: (data: any) => {
    if (data instanceof FormData) {
      return api.post("/articles", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    return api.post("/articles", data);
  },
  update: (id: number, data: any) => {
    if (data instanceof FormData) {
      return api.put(`/articles/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    return api.put(`/articles/${id}`, data);
  },
  delete: (id: number) => api.delete(`/articles/${id}`),
};

// Reviews API
export const reviewsAPI = {
  getProductReviews: (productId: number, page?: number, limit?: number) =>
    api.get(`/products/${productId}/reviews`, { params: { page, limit } }),
  getReviewStats: (productId: number) =>
    api.get(`/products/${productId}/reviews/stats`),
  create: (reviewData: any) => api.post("/reviews", reviewData),
  markHelpful: (reviewId: number) => api.post(`/reviews/${reviewId}/helpful`),
};

// Order API
export const orderAPI = {
  getAll: () => api.get("/orders"),
  getById: (id: number) => api.get(`/orders/${id}`),
  create: (data: any) => api.post("/orders", data),
  updateStatus: (id: number, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/orders/${id}`),
};

// Customer Order API (for customer routes)
export const customerOrderAPI = {
  getMyOrders: () => api.get("/customer/orders"),
  getOrderDetails: (id: number) => api.get(`/customer/orders/${id}`),
  cancelOrder: (id: number) => api.post(`/customer/orders/${id}/cancel`),

  // ✅ ADD THIS
  syncOrder: (data: any) => api.post("/customer/orders", data),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
  getQuickStats: () => api.get("/dashboard/quick-stats"),
  getInventoryValue: () => api.get("/dashboard/inventory-value"), // Add this
};

// Settings API
export const settingsAPI = {
  get: () => api.get("/settings"),
  update: (data: any) => {
    // Check if data is FormData for file upload
    if (data instanceof FormData) {
      return api.put("/settings", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    return api.put("/settings", data);
  },
  getPublic: () => api.get("/settings/public"),
  deleteQRCode: () => api.delete("/settings/qr-code"),
};

export default api;
