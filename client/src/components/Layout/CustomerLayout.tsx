// client/src/components/Layout/CustomerLayout.tsx
import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";

export const CustomerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, loading } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
    { name: "My Orders", href: "/customer/orders", icon: ShoppingBag },
    { name: "Profile", href: "/customer/profile", icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (href: string) => location.pathname === href;

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    const first = user?.first_name?.charAt(0) || "";
    const last = user?.last_name?.charAt(0) || "";
    return `${first}${last}`.toUpperCase() || "U";
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If no user, show message (should be redirected by parent)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Please login to access this page.</p>
          <Link
            to="/customer/login"
            className="text-blue-600 hover:text-blue-700 mt-2 inline-block"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#1D2735] border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/images/ph-logo.png"
                alt="Logo"
                className="h-8 w-8 rounded-full"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/32";
                }}
              />
              <span className="font-bold text-gray-50">
                {user?.first_name || "Customer"} {user?.last_name || ""}
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-50 text-gray-700"
                      : "text-gray-50 hover:bg-gray-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4 p-2 bg-gray-50 rounded-lg">
              {/* Sidebar User Avatar */}
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                {user?.profile_image_url ? (
                  <img
                    src={user.profile_image_url}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement?.classList.add(
                        "bg-blue-100",
                      );
                    }}
                  />
                ) : (
                  <User className="h-5 w-5 text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || user?.phone_number}
                </p>
              </div>
            </div>
            <Link
              to="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-50 hover:bg-gray-100 hover:text-gray-700 transition-colors mb-2"
            >
              <Home className="h-5 w-5" />
              Back to Store
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 bg-gradient-to-r from-gray-900 to-gray-800 text-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              {/* Header User Avatar */}
              <div className="h-10 w-10 rounded-full border-2 border-gray-50 bg-blue-100 flex items-center justify-center overflow-hidden">
                {user?.profile_image_url ? (
                  <img
                    src={user.profile_image_url}
                    alt={`${user.first_name} ${user.last_name}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-xs font-medium text-blue-600">
                    {getUserInitials()}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-50">
                Welcome, {user?.first_name || "Customer"}
              </span>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
