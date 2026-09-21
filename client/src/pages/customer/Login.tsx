import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { Button } from "@/components/common/Button";
import {
  Mail,
  Phone,
  UserPlus,
  Loader2,
  ArrowLeft,
  Shield,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export const CustomerLogin = () => {
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { login, loginWithOTP, sendOTP } = useCustomerAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      toast.success("Welcome back!");
      navigate("/customer/dashboard");
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingOtp(true);
    const success = await sendOTP(phoneNumber);
    setSendingOtp(false);
    if (success) {
      setShowOtpInput(true);
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      toast.success("OTP sent! Please check your phone.", {
        duration: 3000,
      });
    }
  };

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await loginWithOTP(phoneNumber, otp);
    setLoading(false);
    // Navigation is handled inside loginWithOTP
    if (success) {
      toast.success("Login successful!");
      navigate("/customer/dashboard");
    }
  };

  const switchMethod = (newMethod: "email" | "phone") => {
    setMethod(newMethod);
    setShowOtpInput(false);
    setOtp("");
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
            Customer Login
          </h1>
          <p className="text-gray-600 flex items-center justify-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            Access your account to track orders
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </p>
        </div>

        {/* Method Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => switchMethod("email")}
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
            onClick={() => switchMethod("phone")}
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

        {/* Forms */}
        {method === "email" ? (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email or Phone
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Email or phone"
                  required
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
            </div>
            {/* Login */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
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
                  disabled={showOtpInput || sendingOtp}
                />
              </div>
            </div>

            {showOtpInput && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter OTP
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Shield className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-center text-2xl tracking-widest font-mono"
                    placeholder="6-digit code"
                    required
                    disabled={loading}
                    maxLength={6}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={sendingOtp || resendCooldown > 0}
                  className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {resendCooldown > 0
                    ? `Resend OTP (${resendCooldown}s)`
                    : "Resend OTP"}
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={loading || sendingOtp}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                  Verifying...
                </>
              ) : sendingOtp ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin inline mr-2" />
                  Sending OTP...
                </>
              ) : showOtpInput ? (
                "Verify & Login"
              ) : (
                "Send OTP"
              )}
            </Button>
          </form>
        )}

        {/* Additional Links */}
        <div className="mt-6 space-y-3">
          <div className="text-center">
            <Link
              to="/customer/signup"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 group"
            >
              <UserPlus className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Create new account
            </Link>
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
          {/* Back to Home */}
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
