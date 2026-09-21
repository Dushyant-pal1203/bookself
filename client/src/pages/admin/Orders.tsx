import { useState, useMemo, useEffect } from "react";
import { useOrders } from "@/hooks/useOrders";
import { StatusBadge } from "@/components/UI/StatusBadge";
import { Modal } from "@/components/common/Modal";
import { Eye, Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export const AdminOrders = () => {
  const { orders, loading, updateOrderStatus } = useOrders();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"id" | "customer" | "payment">(
    "customer",
  );

  // Read initial filters from URL
  useEffect(() => {
    const urlStatus = searchParams.get("status");
    const urlSearchType = searchParams.get("searchType") as
      | "id"
      | "customer"
      | "payment";
    const urlSearchTerm = searchParams.get("searchTerm");

    // Set status filter from URL
    if (
      urlStatus &&
      [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ].includes(urlStatus)
    ) {
      setStatusFilter(urlStatus);
    }

    // Set search filters from URL
    if (
      urlSearchType &&
      ["id", "customer", "payment"].includes(urlSearchType)
    ) {
      setSearchType(urlSearchType);
    }

    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (statusFilter) {
      params.set("status", statusFilter);
    }

    if (searchTerm) {
      params.set("searchType", searchType);
      params.set("searchTerm", searchTerm);
    }

    setSearchParams(params, { replace: true });
  }, [statusFilter, searchTerm, searchType, setSearchParams]);

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((order) => {
        switch (searchType) {
          case "id":
            return order.id.toString().includes(searchLower);
          case "customer":
            return (
              order.customer_name.toLowerCase().includes(searchLower) ||
              order.customer_phone.includes(searchTerm)
            );
          case "payment":
            return order.payment_method.toLowerCase().includes(searchLower);
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [orders, statusFilter, searchTerm, searchType]);

  const handleStatusChange = async (id: number, status: string) => {
    await updateOrderStatus(id, status as any);
  };

  const clearFilters = () => {
    setStatusFilter("");
    setSearchTerm("");
    setSearchType("customer");
    setSearchParams({});
  };

  const hasActiveFilters = statusFilter !== "" || searchTerm !== "";

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      {/* Filters Section */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search Type Selector */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search By
            </label>
            <select
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value as any);
                setSearchTerm(""); // Clear search when changing type
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="customer">Customer Name/Phone</option>
              <option value="id">Order ID</option>
              <option value="payment">Payment Method</option>
            </select>
          </div>

          {/* Search Input */}
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {searchType === "id" && "Order ID"}
              {searchType === "customer" && "Customer Name or Phone"}
              {searchType === "payment" && "Payment Method"}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search by ${searchType === "id" ? "Order ID" : searchType === "customer" ? "Customer Name/Phone" : "Payment Method"}...`}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
            {statusFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Status: {statusFilter}
                <button
                  onClick={() => setStatusFilter("")}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {searchType === "id" && `Order ID: ${searchTerm}`}
                {searchType === "customer" && `Customer: ${searchTerm}`}
                {searchType === "payment" && `Payment: ${searchTerm}`}
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {searchTerm || statusFilter ? (
                      <div>
                        <p>No orders match your filters.</p>
                        <button
                          onClick={clearFilters}
                          className="mt-2 text-primary-600 hover:text-primary-800"
                        >
                          Clear all filters
                        </button>
                      </div>
                    ) : (
                      "No orders found."
                    )}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.article_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer_name}
                      <br />
                      <span className="text-xs text-gray-500">
                        {order.customer_phone}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{order.total_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="capitalize">{order.payment_method}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Order Information</h3>
              <p className="text-sm text-gray-600">Order #{selectedOrder.id}</p>
              <p className="text-sm text-gray-600">
                Date: {new Date(selectedOrder.created_at).toLocaleString()}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Article Details</h3>
              <p className="text-sm text-gray-600">
                Title: {selectedOrder.article_title}
              </p>
              {selectedOrder.article_author && (
                <p className="text-sm text-gray-600">
                  Author: {selectedOrder.article_author}
                </p>
              )}
              <p className="text-sm text-gray-600">
                Quantity: {selectedOrder.quantity}
              </p>
              <p className="text-sm text-gray-600">
                Total: ₹{selectedOrder.total_amount}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Customer Details</h3>
              <p className="text-sm text-gray-600">
                Name: {selectedOrder.customer_name}
              </p>
              <p className="text-sm text-gray-600">
                Phone: {selectedOrder.customer_phone}
              </p>
              {selectedOrder.customer_email && (
                <p className="text-sm text-gray-600">
                  Email: {selectedOrder.customer_email}
                </p>
              )}
              <p className="text-sm text-gray-600">
                Address: {selectedOrder.customer_address}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Payment</h3>
              <p className="text-sm text-gray-600">
                Method: {selectedOrder.payment_method}
              </p>
              <p className="text-sm text-gray-600">
                Status: <StatusBadge status={selectedOrder.status} />
              </p>
            </div>

            {selectedOrder.notes && (
              <div>
                <h3 className="font-semibold text-gray-900">Notes</h3>
                <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
