// client/src/pages/customer/CustomerOrderDetails.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { customerOrderAPI } from "@/lib/customerApi";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  CreditCard,
  Calendar,
  User,
  Phone,
  Mail,
  MessageCircle,
  ArrowLeft,
  Download,
  Printer,
  PackagePlus,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import toast from "react-hot-toast";

interface OrderDetails {
  id: number;
  article_id: number;
  article_title: string;
  article_author: string;
  quantity: number;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  customer_address: string;
  payment_method: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  total_amount: number;
  currency: string;
  notes?: string;
  created_at: string;
  tracking_number?: string;
  estimated_delivery?: string;
}

export const CustomerOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useCustomerAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      fetchOrderDetails();
    }
  }, [user, id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await customerOrderAPI.getOrderDetails(Number(id));
      setOrder(response.data.order);
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      toast.error("Failed to load order details");
      navigate("/customer/orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case "shipped":
        return <Truck className="h-8 w-8 text-purple-600" />;
      case "processing":
        return <Package className="h-8 w-8 text-blue-600" />;
      case "cancelled":
        return <XCircle className="h-8 w-8 text-red-600" />;
      case "confirmed":
        return <PackagePlus className="h-4 w-4" />;
      default:
        return <Clock className="h-8 w-8 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "Pending Confirmation",
      processing: "Processing",
      confirmed: "Confirmed",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "confirmed":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusStep = (status: string) => {
    const steps = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
    ];
    const currentIndex = steps.indexOf(status);
    return currentIndex;
  };

  const handleDownloadInvoice = () => {
    // Generate invoice HTML
    const invoiceHtml = generateInvoiceHtml(order!);
    const blob = new Blob([invoiceHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice-${order!.id}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Invoice downloaded!");
  };

  const generateInvoiceHtml = (order: OrderDetails): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .order-info { margin-bottom: 20px; background: #f5f5f5; padding: 15px; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <p>Order #${order.id}</p>
          <p>Date: ${new Date(order.created_at).toLocaleDateString()}</p>
        </div>
        <div class="order-info">
          <h3>Order Information</h3>
          <p><strong>Status:</strong> ${getStatusText(order.status)}</p>
          <p><strong>Payment Method:</strong> ${order.payment_method}</p>
        </div>
        <div>
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${order.customer_name}</p>
          <p><strong>Phone:</strong> ${order.customer_phone}</p>
          ${order.customer_email ? `<p><strong>Email:</strong> ${order.customer_email}</p>` : ""}
          <p><strong>Address:</strong> ${order.customer_address}</p>
        </div>
        <h3>Order Items</h3>
        <table>
          <thead>
            <tr><th>Product</th><th>Author</th><th>Quantity</th><th>Price</th><th>Total</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>${order.article_title}</td>
              <td>${order.article_author}</td>
              <td>${order.quantity}</td>
              <td>₹${order.total_amount / order.quantity}</td>
              <td>₹${order.total_amount}</td>
            </tr>
          </tbody>
        </table>
        <div class="total">
          <p>Total Amount: ₹${order.total_amount.toLocaleString()}</p>
        </div>
        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p>For any queries, please contact support.</p>
        </div>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Order Not Found
        </h2>
        <p className="text-gray-500 mb-6">
          The order you're looking for doesn't exist.
        </p>
        <Link
          to="/customer/orders"
          className="text-blue-600 hover:text-blue-700"
        >
          Back to Orders →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/customer/orders")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>
        <button
          onClick={() => navigate("/customer/orders")}
          className="inline-flex items-center gap-2  text-gray-500 hover:text-gray-700 transition-colors duration-200 group mb-6"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Orders
        </button>
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.id}
            </h1>
            <p className="text-gray-500 mt-1">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleDownloadInvoice}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Download className="h-4 w-4" />
              Invoice
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          {getStatusIcon(order.status)}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {getStatusText(order.status)}
            </h2>
            <p className="text-gray-500 text-sm">
              {order.status === "delivered"
                ? "Your order has been delivered successfully!"
                : order.status === "shipped"
                  ? "Your order is on the way!"
                  : order.status === "confirmed"
                    ? "Your order has been confirmed and will be processed soon!"
                    : order.status === "pending"
                      ? "We're processing your order"
                      : "Order is being processed"}
            </p>
          </div>
        </div>

        {/* Order Progress Tracker */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200"></div>
            <div
              className="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all duration-500"
              style={{ width: `${(getStatusStep(order.status) / 4) * 100}%` }}
            ></div>
            <div className="relative flex justify-between">
              {[
                { label: "Order Placed", status: "pending", icon: Clock },
                { label: "Confirmed", status: "confirmed", icon: PackagePlus },
                { label: "Processing", status: "processing", icon: Package },
                { label: "Shipped", status: "shipped", icon: Truck },
                { label: "Delivered", status: "delivered", icon: CheckCircle },
              ].map((step, index) => {
                const stepIndex = [
                  "pending",
                  "confirmed",
                  "processing",
                  "shipped",
                  "delivered",
                ].indexOf(order.status);
                const isCompleted = index <= stepIndex;
                const Icon = step.icon;
                return (
                  <div key={step.label} className="text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        isCompleted
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p
                      className={`text-xs font-medium ${isCompleted ? "text-blue-600" : "text-gray-500"}`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Information
          </h3>
          <div className="space-y-3">
            <p className="text-gray-700">
              <span className="font-medium">Name:</span> {order.customer_name}
            </p>
            <p className="text-gray-700 flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              {order.customer_phone}
            </p>
            {order.customer_email && (
              <p className="text-gray-700 flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                {order.customer_email}
              </p>
            )}
            <p className="text-gray-700 flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
              {order.customer_address}
            </p>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
          </h3>
          <div className="space-y-3">
            <p className="text-gray-700">
              <span className="font-medium">Method:</span>{" "}
              {order.payment_method}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Status:</span>
              <span
                className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full ${getStatusColor(order.status)}`}
              >
                {getStatusIcon(order.status)}
                {getStatusText(order.status)}
              </span>
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Total Amount:</span>
              <span className="ml-2 text-lg font-bold text-blue-600">
                ₹{order.total_amount.toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Items
          </h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Author
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-gray-900">
                    {order.article_title}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.article_author}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">
                    {order.quantity}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    ₹{order.total_amount / order.quantity}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    ₹{order.total_amount}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-3 text-right font-semibold text-gray-900"
                  >
                    Total:
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600">
                    ₹{order.total_amount.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div className="md:col-span-2 bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Order Notes
            </h3>
            <p className="text-gray-600">{order.notes}</p>
          </div>
        )}

        {/* Tracking Information (if shipped) */}
        {order.tracking_number && order.status === "shipped" && (
          <div className="md:col-span-2 bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Tracking Information
            </h3>
            <p className="text-gray-700">
              <span className="font-medium">Tracking Number:</span>{" "}
              {order.tracking_number}
            </p>
            {order.estimated_delivery && (
              <p className="text-gray-700 mt-1">
                <span className="font-medium">Estimated Delivery:</span>{" "}
                {new Date(order.estimated_delivery).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-4 mt-8">
        <Link to="/catalogue">
          <Button
            variant="secondary"
            className="transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Continue Shopping
          </Button>
        </Link>
        {order.status !== "delivered" && order.status !== "cancelled" && (
          <button className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition">
            Need Help?
          </button>
        )}
      </div>
    </div>
  );
};
