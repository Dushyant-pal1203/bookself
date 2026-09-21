// client/src/pages/admin/Dashboard.tsx
import { useDashboard } from "@/hooks/useDashboard";
import { StatsCard } from "@/components/UI/StatsCard";
import { StatusBadge } from "@/components/UI/StatusBadge";
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  BookOpen,
  Package,
  ArrowRight,
  Truck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { dashboardAPI, orderAPI } from "@/lib/api";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";

export const AdminDashboard = () => {
  const { stats, loading } = useDashboard();
  const navigate = useNavigate();
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  // Fetch inventory value
  useEffect(() => {
    const fetchInventoryValue = async () => {
      try {
        const response = await dashboardAPI.getInventoryValue();
        setTotalInventoryValue(response.data.totalValue);
      } catch (error) {
        console.error("Failed to fetch inventory value:", error);
      } finally {
        setInventoryLoading(false);
      }
    };

    fetchInventoryValue();
  }, []);

  // Fetch complete order details when an order is selected
  const handleOrderClick = async (order: any) => {
    setSelectedOrder(order);
    setLoadingOrderDetails(true);

    try {
      const response = await orderAPI.getById(order.id);
      // IMPORTANT FIX: The order data is nested inside 'order' property
      const orderData = response.data.order || response.data;
      setSelectedOrderDetails(orderData);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      // Fallback to the order data we already have
      setSelectedOrderDetails(order);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Handle card clicks
  const handleCardClick = (type: string) => {
    switch (type) {
      case "revenue":
        navigate("/admin/orders?status=delivered");
        break;
      case "totalOrders":
        navigate("/admin/orders");
        break;
      case "pendingOrders":
        navigate("/admin/orders?status=pending");
        break;
      case "shippedOrders":
        navigate("/admin/orders?status=shipped");
        break;
      case "catalogueSize":
        navigate("/admin/articles");
        break;
      case "inventoryValue":
        navigate("/admin/articles");
        break;
      default:
        break;
    }
  };

  const statsData = [
    {
      title: "Inventory Value",
      value: inventoryLoading
        ? "Loading..."
        : `₹${totalInventoryValue.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      icon: <Package className="h-6 w-6" />,
      onClick: () => handleCardClick("inventoryValue"),
      description: "Stock value (Price × Quantity)",
    },
    {
      title: "Total Revenue",
      value: `₹${stats?.totalRevenue?.toLocaleString("en-IN") || 0}`,
      icon: <IndianRupee className="h-6 w-6" />,
      trend: { value: 15, isPositive: true },
      onClick: () => handleCardClick("revenue"),
      description: "From delivered orders",
    },
    {
      title: "Catalogue Size",
      value: stats?.catalogueSize || 0,
      icon: <BookOpen className="h-6 w-6" />,
      onClick: () => handleCardClick("catalogueSize"),
      description: "Total articles",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: <ShoppingBag className="h-6 w-6" />,
      onClick: () => handleCardClick("totalOrders"),
      description: "All time orders",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: <Clock className="h-6 w-6" />,
      // FIX: Remove trend property or ensure it has correct structure
      description: "Awaiting processing",
    },
    {
      title: "Shipped Orders",
      value: stats?.shippedOrders || 0, // Make sure this is coming from your API
      icon: <Truck className="h-6 w-6" />,
      description: "Orders in transit",
    },
  ];

  // Get the order details to display (either fetched details or fallback to selected order)
  const displayOrder = selectedOrderDetails || selectedOrder;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="cursor-pointer transition-transform hover:scale-105"
            onClick={stat.onClick}
          >
            <StatsCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              description={stat.description}
              // Only pass trend if it exists and has correct structure
              {...(stat.trend && { trend: stat.trend })}
            />
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <button
            onClick={() => navigate("/admin/orders")}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.recentOrders?.length ? (
                stats.recentOrders.map((order: any) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleOrderClick(order)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.article_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{order.total_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Catalogue Breakdown */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Catalogue Breakdown
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.catalogueBreakdown?.length ? (
                  stats.catalogueBreakdown.map((item: any, idx: number) => {
                    const percentage = (
                      (item.count / (stats?.catalogueSize || 1)) *
                      100
                    ).toFixed(1);
                    return (
                      <tr
                        key={idx}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() =>
                          navigate(`/admin/articles?type=${item.type}`)
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {item.type || "Uncategorized"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      Catalogue is empty.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Monthly Revenue Trend
            </h2>
            <p className="text-sm text-gray-500 mt-1">Last 6 months</p>
          </div>
          <div className="p-6">
            {stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 ? (
              <div className="space-y-4">
                {stats.monthlyRevenue.map((item: any, idx: number) => {
                  const maxRevenue = Math.max(
                    ...stats.monthlyRevenue.map(
                      (m: any) => parseFloat(m.revenue) || 0,
                    ),
                  );
                  const revenue = parseFloat(item.revenue) || 0;
                  const percentage =
                    maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={idx} className="group">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{item.month}</span>
                        <span className="font-semibold text-gray-900">
                          ₹{revenue.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-lg transition-all duration-500 flex items-center px-3"
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="text-xs text-white font-medium">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No revenue data available
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => navigate("/admin/orders?status=delivered")}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View Detailed Reports →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal*/}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => {
          setSelectedOrder(null);
          setSelectedOrderDetails(null);
        }}
        title="Order Details"
      >
        {loadingOrderDetails ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          displayOrder && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Order Information
                </h3>
                <p className="text-sm text-gray-600">
                  Order #{displayOrder.id}
                </p>
                <p className="text-sm text-gray-600">
                  Date:{" "}
                  {displayOrder.created_at
                    ? new Date(displayOrder.created_at).toLocaleString()
                    : new Date().toLocaleString()}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Article Details</h3>
                <p className="text-sm text-gray-600">
                  Title: {displayOrder.article_title || "N/A"}
                </p>
                {displayOrder.article_author && (
                  <p className="text-sm text-gray-600">
                    Author: {displayOrder.article_author}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  Quantity: {displayOrder.quantity || 1}
                </p>
                <p className="text-sm text-gray-600">
                  Total: ₹{displayOrder.total_amount || 0}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  Customer Details
                </h3>
                <p className="text-sm text-gray-600">
                  Name: {displayOrder.customer_name || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Phone: {displayOrder.customer_phone || "N/A"}
                </p>
                {displayOrder.customer_email && (
                  <p className="text-sm text-gray-600">
                    Email: {displayOrder.customer_email}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  Address: {displayOrder.customer_address || "N/A"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">Payment</h3>
                <p className="text-sm text-gray-600">
                  Method: {displayOrder.payment_method || "N/A"}
                </p>
                <p className="text-sm text-gray-600">
                  Status: <StatusBadge status={displayOrder.status} />
                </p>
              </div>

              {displayOrder.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900">Notes</h3>
                  <p className="text-sm text-gray-600">{displayOrder.notes}</p>
                </div>
              )}

              {/* View Order Button */}
              <div className="pt-4 border-t border-gray-200 text-end">
                <Button
                  variant="secondary"
                  size="md"
                  className="!bg-black gap-2 inline-flex duration-200 group"
                  onClick={() => {
                    setSelectedOrder(null);
                    setSelectedOrderDetails(null);
                    navigate(
                      `/admin/orders?searchType=id&searchTerm=${displayOrder.id}`,
                    );
                  }}
                >
                  <p className="flex gap-2 items-center">
                    View Full Order Details
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </p>
                </Button>
              </div>
            </div>
          )
        )}
      </Modal>
    </div>
  );
};
