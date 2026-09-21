// client/src/pages/customer/CustomerDashboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { customerOrderAPI } from "@/lib/customerApi";
import {
  Package,
  ShoppingBag,
  Clock,
  CheckCircle,
  ArrowRight,
  User,
  Truck,
  Eye,
  Search,
  Calendar,
  ShoppingCart,
  Plus,
  AlertCircle,
  PackagePlus,
} from "lucide-react";
import { Button } from "@/components/common/Button";

interface CustomerOrder {
  id: number;
  article_title: string;
  article_author: string;
  quantity: number;
  total_amount: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"; // ✅ ADD confirmed
  created_at: string;
  tracking_number?: string;
  estimated_delivery?: string;
  _isLocal?: boolean;
}

interface LocalOrder {
  orderId: string;
  items: any[];
  total: number;
  customer: any;
  orderDate: string;
  status: string;
  databaseId?: number;
}

export const CustomerDashboard = () => {
  const { user, loading: authLoading } = useCustomerAuth();
  const [recentOrders, setRecentOrders] = useState<CustomerOrder[]>([]);
  const [localOrderCount, setLocalOrderCount] = useState(0);
  const [stats, setStats] = useState({
    totalOrders: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCustomerData();
      // loadLocalOrders();
    }
  }, [user]);

  // const loadLocalOrders = () => {
  //   if (!user) return;

  //   const userPhone = user.phone_number;
  //   const userEmail = user.email?.toLowerCase();
  //   let matchedCount = 0;

  //   const savedOrders = localStorage.getItem("userOrders");
  //   if (savedOrders) {
  //     try {
  //       const orders: LocalOrder[] = JSON.parse(savedOrders);
  //       const matched = orders.filter((order) => {
  //         const orderPhone = order.customer?.phone;
  //         const orderEmail = order.customer?.email?.toLowerCase();
  //         return (
  //           (orderPhone && userPhone && orderPhone === userPhone) ||
  //           (orderEmail && userEmail && orderEmail === userEmail)
  //         );
  //       });
  //       matchedCount = matched.length;
  //     } catch (error) {
  //       console.error("Failed to parse local orders:", error);
  //     }
  //   }

  //   setLocalOrderCount(matchedCount);
  // };

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const response = await customerOrderAPI.getMyOrders();
      const orders = response.data.orders || [];

      // Convert orders to consistent format
      const formattedOrders: CustomerOrder[] = orders.map((order: any) => ({
        id: order.id,
        article_title: order.article_title,
        article_author: order.article_author,
        quantity: order.quantity,
        total_amount:
          typeof order.total_amount === "string"
            ? parseFloat(order.total_amount)
            : order.total_amount,
        status: order.status,
        created_at: order.created_at,
        tracking_number: order.tracking_number,
        estimated_delivery: order.estimated_delivery,
      }));

      setRecentOrders(formattedOrders.slice(0, 5));

      // Calculate stats
      const delivered = formattedOrders.filter(
        (o: CustomerOrder) => o.status === "delivered",
      );
      const pending = formattedOrders.filter(
        (o: CustomerOrder) =>
          ["pending", "confirmed", "processing", "shipped"].includes(o.status), // ✅ ADD confirmed here
      );

      const totalSpent = delivered.reduce((sum: number, o: CustomerOrder) => {
        let amount =
          typeof o.total_amount === "string"
            ? parseFloat(o.total_amount as unknown as string)
            : Number(o.total_amount);
        if (isNaN(amount)) amount = 0;
        return sum + amount;
      }, 0);

      setStats({
        totalOrders: formattedOrders.length,
        deliveredOrders: delivered.length,
        pendingOrders: pending.length,
        totalSpent: totalSpent,
      });
    } catch (error) {
      console.error("Failed to fetch customer data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "shipped":
        return "bg-purple-100 text-purple-700";
      case "confirmed":
        return "bg-emerald-100 text-emerald-800";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "confirmed":
        return <PackagePlus className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Please Login
        </h2>
        <p className="text-gray-500 mb-6">Login to view your dashboard.</p>
        <Link
          to="/customer/login"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.first_name || "Customer"}!
            </h1>
            <p className="text-blue-100">
              Track your orders, manage your profile, and discover new
              publications.
            </p>
          </div>
          <Button
            className="gap-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            variant="secondary"
          >
            <Link to="/catalogue" className="flex gap-2 items-center">
              <Plus className="h-4 w-4" />
              New Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Guest Orders Alert */}
      {/* {localOrderCount > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">
                You have {localOrderCount} guest order
                {localOrderCount !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-blue-600">
                <Link to="/customer/orders" className="underline font-medium">
                  Click here
                </Link>{" "}
                to view and sync your guest orders to your account
              </p>
            </div>
          </div>
        </div>
      )} */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:scale-105">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalOrders + localOrderCount}
              </p>
              {/* {localOrderCount > 0 && (
                <p className="text-xs text-blue-600">
                  +{localOrderCount} guest orders
                </p>
              )} */}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:scale-105">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Delivered</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.deliveredOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:scale-105">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pendingOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 hover:scale-105">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-purple-600">
                ₹{stats.totalSpent.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h2>
            <p className="text-sm text-gray-500 mt-1">Your latest purchases</p>
          </div>
          <Button
            variant="secondary"
            size="md"
            className="gap-2 inline-flex duration-200 group"
          >
            <Link to="/customer/orders" className="flex gap-2 items-center">
              View All Orders
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : // ) : recentOrders.length === 0 && localOrderCount === 0 ? (
        recentOrders.length === 0 ? (
          <div className="p-12 text-center justify-items-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No orders yet</p>
            <Button className="gap-2 mt-4">
              <Link to="/catalogue" className="flex gap-2 items-center">
                <ShoppingCart className="h-4 w-4" />
                Start Shopping
              </Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        #{order.id}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
                      >
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900">
                      {order.article_title}
                    </p>
                    <p className="text-sm text-gray-500">
                      by {order.article_author}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      ₹{order.total_amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Qty: {order.quantity}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    to={`/customer/orders/${order.id}`}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                    Track Order
                  </Link>
                </div>
              </div>
            ))}
            {/* {localOrderCount > 0 && recentOrders.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-gray-500">
                  You have {localOrderCount} guest order(s).
                  <Link to="/customer/orders" className="text-blue-600 ml-1">
                    Click here to view them
                  </Link>
                </p>
              </div>
            )} */}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Contact our support team for assistance with your orders.
          </p>
          <Button
            variant="secondary"
            size="md"
            className="gap-2 inline-flex duration-200 group"
          >
            <Link to="/about" className="flex gap-2 items-center">
              Contact Support
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-2">Discover More</h3>
          <p className="text-sm text-gray-600 mb-4">
            Explore our latest collection of books and journals.
          </p>
          <Button
            variant="secondary"
            size="md"
            className="!bg-black gap-2 inline-flex duration-200 group"
          >
            <Link to="/catalogue" className="flex gap-2 items-center">
              Browse Catalogue
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
