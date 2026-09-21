// client/src/hooks/useCustomerAuth.ts
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
import { customerAuthAPI, CustomerUser } from "@/lib/customerApi";

interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
}

interface AxiosError {
  response?: {
    status?: number;
    data?: {
      error?: string;
    };
  };
}

export const useCustomerAuth = () => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await customerAuthAPI.me();
      setUser(response.data.user || null);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    first_name?: string,
    last_name?: string,
    phone_number?: string,
  ) => {
    try {
      const response = await customerAuthAPI.signup({
        email,
        password,
        first_name,
        last_name,
        phone_number,
      });
      setUser(response.data.user || null);
      showToast("Account created successfully!", "success");
      navigate("/customer/dashboard");
      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 400) {
        if (axiosError.response?.data?.error === "Email already registered") {
          showToast("Email already registered. Please login instead.", "error");
        } else if (
          axiosError.response?.data?.error === "Invalid email format"
        ) {
          showToast("Please enter a valid email address.", "error");
        } else if (
          axiosError.response?.data?.error ===
          "Password must be at least 6 characters"
        ) {
          showToast("Password must be at least 6 characters long.", "error");
        } else if (
          axiosError.response?.data?.error === "Invalid phone number format"
        ) {
          showToast("Please enter a valid phone number.", "error");
        } else {
          showToast(
            axiosError.response?.data?.error || "Signup failed",
            "error",
          );
        }
      } else if (axiosError.response?.status === 500) {
        showToast("Server error. Please try again later.", "error");
      } else {
        showToast(
          axiosError.response?.data?.error ||
            "Signup failed. Please try again.",
          "error",
        );
      }
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await customerAuthAPI.login({ email, password });
      setUser(response.data.user || null);
      showToast("Login successful!", "success");
      navigate("/customer/dashboard");
      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        if (axiosError.response?.data?.error === "Invalid credentials") {
          showToast("Invalid email or password. Please try again.", "error");
        } else if (
          axiosError.response?.data?.error ===
          "Please use OTP login for this account"
        ) {
          showToast(
            "This account uses OTP login. Please use the Phone (OTP) option.",
            "warning",
            5000,
          );
        } else {
          showToast(
            axiosError.response?.data?.error ||
              "Login failed. Please check your credentials.",
            "error",
          );
        }
      } else if (axiosError.response?.status === 400) {
        showToast(
          axiosError.response?.data?.error ||
            "Invalid request. Please check your input.",
          "error",
        );
      } else if (axiosError.response?.status === 404) {
        showToast("Account not found. Please sign up first.", "error");
      } else if (axiosError.response?.status === 500) {
        showToast("Server error. Please try again later.", "error");
      } else {
        showToast(
          "Network error. Please check your connection and try again.",
          "error",
        );
      }
      return false;
    }
  };

  const loginWithOTP = async (phone_number: string, otp: string) => {
    try {
      const response = await customerAuthAPI.loginWithOTP({
        phone_number,
        otp,
      });

      const data = response.data;

      setUser(data.user || null);
      showToast("Login successful!", "success");

      // Check if user needs to change default password
      if (data.needsPasswordChange) {
        showToast(
          "Please change your default password (123456) for security",
          "warning",
          5000,
        );
        navigate("/customer/profile");
      } else {
        navigate("/customer/dashboard");
      }

      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        if (axiosError.response?.data?.error === "Invalid or expired OTP") {
          showToast(
            "Invalid or expired OTP. Please request a new code.",
            "error",
          );
        } else {
          showToast(
            axiosError.response?.data?.error || "OTP verification failed.",
            "error",
          );
        }
      } else if (axiosError.response?.status === 400) {
        showToast(
          axiosError.response?.data?.error ||
            "Invalid phone number or OTP format.",
          "error",
        );
      } else if (axiosError.response?.status === 404) {
        showToast("Service unavailable. Please try again later.", "error");
      } else if (axiosError.response?.status === 500) {
        showToast("Server error. Please try again later.", "error");
      } else {
        showToast(
          "Network error. Please check your connection and try again.",
          "error",
        );
      }
      return false;
    }
  };

  const sendOTP = async (phone_number: string) => {
    try {
      const response = await customerAuthAPI.sendOTP(phone_number);
      // Show success message with OTP in development
      if (import.meta.env.DEV && response.data.debug_otp) {
        showToast(
          `OTP sent successfully! Debug OTP: ${response.data.debug_otp}`,
          "info",
        );
      } else {
        showToast("OTP sent successfully! Please check your phone.", "success");
      }
      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 400) {
        if (
          axiosError.response?.data?.error === "Invalid phone number format"
        ) {
          showToast(
            "Please enter a valid phone number (e.g., +91XXXXXXXXXX)",
            "error",
          );
        } else {
          showToast(
            axiosError.response?.data?.error || "Invalid phone number.",
            "error",
          );
        }
      } else if (axiosError.response?.status === 429) {
        showToast(
          "Too many attempts. Please wait a few minutes before trying again.",
          "warning",
        );
      } else if (axiosError.response?.status === 500) {
        showToast("Server error. Please try again later.", "error");
      } else {
        showToast(
          axiosError.response?.data?.error ||
            "Failed to send OTP. Please try again.",
          "error",
        );
      }
      return false;
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      const response = await customerAuthAPI.updateProfile(data);
      setUser(response.data.user || null);
      showToast("Profile updated successfully!", "success");
      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 400) {
        if (
          axiosError.response?.data?.error ===
          "Email already in use by another account"
        ) {
          showToast("Email already in use by another account.", "error");
        } else if (
          axiosError.response?.data?.error ===
          "Phone number already in use by another account"
        ) {
          showToast("Phone number already in use by another account.", "error");
        } else {
          showToast(
            axiosError.response?.data?.error || "Failed to update profile.",
            "error",
          );
        }
      } else if (axiosError.response?.status === 401) {
        showToast("Session expired. Please login again.", "error");
        navigate("/customer/login");
      } else if (axiosError.response?.status === 500) {
        showToast("Server error. Please try again later.", "error");
      } else {
        showToast(
          axiosError.response?.data?.error ||
            "Failed to update profile. Please try again.",
          "error",
        );
      }
      return false;
    }
  };

  const changePassword = async (
    current_password: string,
    new_password: string,
  ) => {
    try {
      await customerAuthAPI.changePassword({ current_password, new_password });
      showToast(
        "Password changed successfully! Please use your new password next time.",
        "success",
      );
      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 400) {
        if (
          axiosError.response?.data?.error ===
          "New password must be at least 6 characters"
        ) {
          showToast(
            "New password must be at least 6 characters long.",
            "error",
          );
        } else if (
          axiosError.response?.data?.error ===
          "This account uses OTP login. Password cannot be changed. Please use OTP to login."
        ) {
          showToast(
            "This account uses OTP login. Password cannot be changed. Please use OTP to login.",
            "warning",
            5000,
          );
        } else {
          showToast(
            axiosError.response?.data?.error || "Failed to change password.",
            "error",
          );
        }
      } else if (axiosError.response?.status === 401) {
        if (
          axiosError.response?.data?.error === "Current password is incorrect"
        ) {
          showToast(
            "Current password is incorrect. Please try again.",
            "error",
          );
        } else {
          showToast(
            axiosError.response?.data?.error ||
              "Session expired. Please login again.",
            "error",
          );
          navigate("/customer/login");
        }
      } else if (axiosError.response?.status === 500) {
        showToast("Server error. Please try again later.", "error");
      } else {
        showToast(
          axiosError.response?.data?.error ||
            "Failed to change password. Please try again.",
          "error",
        );
      }
      return false;
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      const response = await customerAuthAPI.uploadAvatar(file);
      setUser(response.data.user || null);
      showToast("Profile picture updated successfully!", "success");
      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 400) {
        if (axiosError.response?.data?.error === "No file uploaded") {
          showToast("Please select a file to upload.", "error");
        } else if (
          axiosError.response?.data?.error ===
          "Only image files are allowed (jpeg, jpg, png, gif, webp)"
        ) {
          showToast(
            "Only image files are allowed (jpeg, jpg, png, gif, webp)",
            "error",
          );
        } else {
          showToast(
            axiosError.response?.data?.error || "Failed to upload avatar.",
            "error",
          );
        }
      } else if (axiosError.response?.status === 401) {
        showToast("Session expired. Please login again.", "error");
        navigate("/customer/login");
      } else if (axiosError.response?.status === 413) {
        showToast("File too large. Maximum size is 5MB.", "error");
      } else if (axiosError.response?.status === 500) {
        showToast("Server error. Please try again later.", "error");
      } else {
        showToast(
          axiosError.response?.data?.error ||
            "Failed to upload avatar. Please try again.",
          "error",
        );
      }
      return false;
    }
  };

  const deleteAvatar = async () => {
    try {
      const response = await customerAuthAPI.deleteAvatar();
      setUser(response.data.user || null);
      showToast("Profile picture removed successfully!", "success");
      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        showToast("Session expired. Please login again.", "error");
        navigate("/customer/login");
      } else if (axiosError.response?.status === 500) {
        showToast("Server error. Please try again later.", "error");
      } else {
        showToast(
          axiosError.response?.data?.error ||
            "Failed to delete avatar. Please try again.",
          "error",
        );
      }
      return false;
    }
  };

  const logout = async () => {
    try {
      await customerAuthAPI.logout();
      setUser(null);
      showToast("Logged out successfully", "success");
      navigate("/");
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 500) {
        showToast("Server error. Please try again.", "error");
      } else {
        showToast("Logout failed. Please try again.", "error");
      }
    }
  };

  return {
    user,
    loading,
    signup,
    login,
    loginWithOTP,
    sendOTP,
    updateProfile,
    changePassword,
    uploadAvatar,
    deleteAvatar,
    logout,
  };
};
