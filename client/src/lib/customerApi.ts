// client/src/lib/customerApi.ts
import axios, { AxiosInstance } from "axios";
import toast from "react-hot-toast";

const customerApi: AxiosInstance = axios.create({
  baseURL: "/api/customer",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor
customerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on 401 for the me endpoint - it's expected when not logged in
    const isMeEndpoint = error.config?.url === "/me";

    if (error.response?.status === 401 && !isMeEndpoint) {
      if (
        !window.location.pathname.includes("/customer/login") &&
        !window.location.pathname.includes("/customer/signup")
      ) {
        window.location.href = "/customer/login";
        toast.error("Session expired. Please login again.");
      }
    }
    return Promise.reject(error);
  },
);

// Types
export interface CustomerUser {
  id: string;
  email?: string;
  phone_number?: string;
  first_name: string;
  last_name: string;
  profile_image_url?: string;
  created_at?: string;
}

export interface SignupData {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginWithOTPData {
  phone_number: string;
  otp: string;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  user?: CustomerUser;
  message?: string;
  error?: string;
  [key: string]: any;
}

// API methods
export const customerAuthAPI = {
  uploadAvatar: (file: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append("avatar", file);
    return customerApi.post("/upload-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteAvatar: (): Promise<ApiResponse> =>
    customerApi.delete("/delete-avatar"),

  me: (): Promise<ApiResponse> => customerApi.get("/me"),

  signup: (data: SignupData): Promise<ApiResponse> =>
    customerApi.post("/signup", data),

  login: (data: LoginData): Promise<ApiResponse> =>
    customerApi.post("/login", data),

  loginWithOTP: (data: LoginWithOTPData): Promise<ApiResponse> =>
    customerApi.post("/login-otp", data),

  sendOTP: (phone_number: string): Promise<ApiResponse> =>
    customerApi.post("/send-otp", { phone_number }),

  logout: (): Promise<ApiResponse> => customerApi.post("/logout"),

  updateProfile: (data: UpdateProfileData): Promise<ApiResponse> =>
    customerApi.put("/profile", data),

  changePassword: (data: ChangePasswordData): Promise<ApiResponse> =>
    customerApi.put("/profile", data),
};

export const customerOrderAPI = {
  getMyOrders: (): Promise<ApiResponse> => customerApi.get("/my-orders"),
  getOrderDetails: (id: number): Promise<ApiResponse> =>
    customerApi.get(`/orders/${id}`),
  trackOrder: (id: number): Promise<ApiResponse> =>
    customerApi.get(`/orders/${id}/track`),
  // Add createOrder method
  createOrder: (data: any): Promise<ApiResponse> =>
    customerApi.post("/orders", data),
  // Add sync order method
  syncOrder: (data: any): Promise<ApiResponse> =>
    customerApi.post("/sync-order", data),
};

export default customerApi;
