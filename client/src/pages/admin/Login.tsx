import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/common/Button";
import {
  Mail,
  Phone,
  BookOpen,
  Sparkles,
  ArrowLeft,
  Shield,
} from "lucide-react";

export const AdminLogin = () => {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const { login, loginWithOTP, sendOTP } = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate("/admin/dashboard");
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await sendOTP(phoneNumber);
    if (success) {
      setShowOtpInput(true);
    }
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginWithOTP(phoneNumber, otp);
    if (success) {
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-4">
          <Link to="/" className="inline-block group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <img
                src="/images/ph-logo.png"
                alt="Logo"
                className="relative h-16 w-16 rounded-full shadow-lg group-hover:scale-105 transition-transform duration-300 mx-auto border-2 border-transparent group-hover:border-blue-500"
              />
            </div>
          </Link>

          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Admin Access
          </h1>
          <p className="text-gray-600 flex items-center justify-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            Login to manage your publishing house
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </p>
        </div>
        {/* Method Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMethod("email")}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              method === "email"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Mail className="h-4 w-4 inline mr-2" />
            Email
          </button>
          <button
            onClick={() => setMethod("phone")}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              method === "phone"
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Phone className="h-4 w-4 inline mr-2" />
            Phone (OTP)
          </button>
        </div>

        {method === "email" ? (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>
            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Shield className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            {/* Login */}
            <Button
              type="submit"
              size="md"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Login
            </Button>
          </form>
        ) : (
          <form
            onSubmit={showOtpInput ? handleOTPLogin : handleSendOTP}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Phone className="h-5 w-5" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="+91XXXXXXXXXX"
                  required
                  disabled={showOtpInput}
                />
              </div>
            </div>
            {showOtpInput && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="6-digit code"
                  required
                />
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {showOtpInput ? "Verify & Login" : "Send OTP"}
            </Button>
          </form>
        )}

        {/* Additional Links */}
        <div className="mt-6 space-y-3">
          <div className=" p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-800 text-center">
              Demo Credentials: admin@123gmail.com / admin1203
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500">Secure login</span>
            </div>
          </div>

          <div className="flex justify-center space-x-4 text-xs text-gray-400">
            <span>256-bit SSL</span>
            <span>•</span>
            <span>Data Protected</span>
            <span>•</span>
            <span>Privacy Guaranteed</span>
          </div>

          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
