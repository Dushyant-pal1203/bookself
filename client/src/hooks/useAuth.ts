import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { User } from "@/types/user";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      setUser(response.data.user);
      toast.success("Login successful!");
      navigate("/admin/dashboard");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Login failed");
      return false;
    }
  };

  const loginWithOTP = async (phone_number: string, otp: string) => {
    try {
      const response = await api.post("/auth/login-otp", { phone_number, otp });
      setUser(response.data.user);
      toast.success("Login successful!");
      navigate("/admin/dashboard");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Login failed");
      return false;
    }
  };

  const sendOTP = async (phone_number: string) => {
    try {
      await api.post("/auth/send-otp", { phone_number });
      toast.success("OTP sent successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send OTP");
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return { user, loading, login, loginWithOTP, sendOTP, logout };
};
