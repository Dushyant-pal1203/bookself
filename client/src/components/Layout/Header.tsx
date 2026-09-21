// client/src/components/Layout/Header.tsx
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Menu,
  X,
  Settings,
  LogOut,
  LayoutDashboard,
  UserCircle,
  Shield,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/common/Button";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useSettings } from "@/hooks/useSettings";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const { user: customerUser, logout: customerLogout } = useCustomerAuth();
  const { settings } = useSettings();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleCustomerLogout = async () => {
    await customerLogout();
    closeMenu();
    setIsUserDropdownOpen(false);
    navigate("/");
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user display name
  const getDisplayName = (user: any) => {
    if (user?.name) return user.name;
    if (user?.fullName) return user.fullName;
    if (user?.username) return user.username;
    return user?.email?.split("@")[0] || "User";
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const { getCartCount } = useCart();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo Section */}
          <Link
            to="/"
            className="flex items-center space-x-2"
            onClick={closeMenu}
          >
            <img
              src="/images/ph-logo.png"
              alt="Logo"
              className="h-12 w-12 rounded-full shadow hover:shadow-lg hover:shadow-cyan-600 transition"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/48";
              }}
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {settings.publisher_name}
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {settings.tagline}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Home
            </Link>
            <Link
              to="/catalogue"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Catalogue
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-blue-600 transition"
            >
              Contact Us
            </Link>

            {/* Customer Account - Updated with avatar, name, and email */}
            {customerUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
                >
                  {/* User Avatar with Initials or Image */}
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                    {customerUser?.profile_image_url ? (
                      <img
                        src={customerUser.profile_image_url}
                        alt={getDisplayName(customerUser)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-blue-600">
                        {getUserInitials(getDisplayName(customerUser))}
                      </span>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {getDisplayName(customerUser)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {customerUser.email}
                    </p>
                  </div>

                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      isUserDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                          {customerUser?.profile_image_url ? (
                            <img
                              src={customerUser.profile_image_url}
                              alt={getDisplayName(customerUser)}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-blue-600">
                              {getUserInitials(getDisplayName(customerUser))}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {getDisplayName(customerUser)}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {customerUser.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/customer/dashboard"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <LayoutDashboard className="h-4 w-4 text-gray-400" />
                        <span>My Dashboard</span>
                      </Link>
                      <Link
                        to="/customer/orders"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <UserCircle className="h-4 w-4 text-gray-400" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        to="/customer/profile"
                        onClick={() => setIsUserDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span>Profile Settings</span>
                      </Link>
                    </div>

                    {/* Divider and Logout */}
                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleCustomerLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={() => navigate("/customer/login")}
                className="gap-2"
                variant="primary"
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </Button>
            )}
            <Button onClick={() => navigate("/cart")} className="relative p-2">
              <ShoppingCart className="h-5 w-5" />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav className="flex flex-col space-y-4 pb-4">
            {/* Mobile User Profile Section */}
            {customerUser && (
              <div className="mb-2 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-3 p-2">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                    {customerUser?.profile_image_url ? (
                      <img
                        src={customerUser.profile_image_url}
                        alt={getDisplayName(customerUser)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="font-medium text-base text-blue-600">
                        {getUserInitials(getDisplayName(customerUser))}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {getDisplayName(customerUser)}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {customerUser.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Link
              to="/"
              onClick={closeMenu}
              className="text-gray-700 hover:text-blue-600 transition py-2"
            >
              Home
            </Link>
            <Link
              to="/catalogue"
              onClick={closeMenu}
              className="text-gray-700 hover:text-blue-600 transition py-2"
            >
              Catalogue
            </Link>
            <Link
              to="/about"
              onClick={closeMenu}
              className="text-gray-700 hover:text-blue-600 transition py-2"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={closeMenu}
              className="text-gray-700 hover:text-blue-600 transition py-2"
            >
              Contact Us
            </Link>
            {customerUser ? (
              <>
                <Link
                  to="/customer/dashboard"
                  onClick={closeMenu}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition py-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>My Dashboard</span>
                </Link>
                <Link
                  to="/customer/orders"
                  onClick={closeMenu}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition py-2"
                >
                  <UserCircle className="h-4 w-4" />
                  <span>My Orders</span>
                </Link>
                <Link
                  to="/customer/profile"
                  onClick={closeMenu}
                  className="flex items-center gap-3 text-gray-700 hover:text-blue-600 transition py-2"
                >
                  <Shield className="h-4 w-4" />
                  <span>Profile Settings</span>
                </Link>
                <button
                  onClick={handleCustomerLogout}
                  className="flex items-center gap-3 text-left text-red-600 hover:text-red-700 transition py-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Button
                onClick={() => {
                  closeMenu();
                  navigate("/customer/login");
                }}
                className="gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <User className="h-4 w-4" />
                <span>Login</span>
              </Button>
            )}

            <Button
              onClick={() => {
                closeMenu();
                navigate("/admin/login");
              }}
              variant="secondary"
              className="gap-2 border border-gray-300 rounded-lg"
            >
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};
