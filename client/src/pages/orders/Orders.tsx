// client/src/pages/Orders.tsx

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Button } from "@/components/common/Button";
import { orderAPI } from "@/lib/api";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  ArrowLeft,
  Calendar,
  MapPin,
  CreditCard,
  MessageCircle,
  ShoppingBag,
  Download,
  LogIn,
} from "lucide-react";
import toast from "react-hot-toast";

type OrderItem = {
  id: number;
  title: string;
  author: string;
  price: number;
  currency: string;
  quantity: number;
  cover_image_url: string | null;
};

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type LocalOrder = {
  orderId: string;
  items: OrderItem[];
  total: number;
  currency: string;
  customer: {
    name: string;
    phone: string;
    email: string | null;
    address: string;
  };
  notes: string;
  paymentMethod: "whatsapp" | "bank_transfer";
  orderDate: string;
  status: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: string;
  databaseId?: number;
};

type DatabaseOrder = {
  id: number;
  article_title: string;
  article_author: string;
  quantity: number;
  total_amount: number;
  status: OrderStatus;
  payment_method: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  notes: string;
  created_at: string;
};

type CombinedOrder = LocalOrder | DatabaseOrder;

const isLocalOrder = (order: CombinedOrder): order is LocalOrder => {
  return "orderId" in order;
};

export const Orders = () => {
  const navigate = useNavigate();

  const { user: customerUser, loading: authLoading } = useCustomerAuth();

  const [localOrders, setLocalOrders] = useState<LocalOrder[]>([]);

  const [databaseOrders, setDatabaseOrders] = useState<DatabaseOrder[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<CombinedOrder | null>(
    null,
  );

  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    loadOrders();
  }, [customerUser]);

  const loadOrders = async () => {
    setLoading(true);

    const savedOrders = localStorage.getItem("userOrders");

    if (savedOrders) {
      const parsedOrders: LocalOrder[] = JSON.parse(savedOrders);

      parsedOrders.sort(
        (a, b) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
      );

      setLocalOrders(parsedOrders);
    }

    if (customerUser) {
      try {
        const response = await orderAPI.getAll();

        const orders: DatabaseOrder[] = response.data.orders || [];

        const customerOrders = orders.filter(
          (order) =>
            order.customer_phone === customerUser.phone_number ||
            order.customer_email === customerUser.email ||
            order.customer_name ===
              `${customerUser.first_name} ${customerUser.last_name}`.trim(),
        );

        setDatabaseOrders(customerOrders);
      } catch (error) {
        console.error("Failed to fetch database orders:", error);
      }
    }

    setLoading(false);
  };

  const allOrders = (): LocalOrder[] => {
    const dbOrdersAsLocal: LocalOrder[] = databaseOrders.map((order) => ({
      orderId: `DB-${order.id}`,
      items: [
        {
          id: order.id,
          title: order.article_title,
          author: order.article_author || "",
          price: order.total_amount / order.quantity,
          currency: "INR",
          quantity: order.quantity,
          cover_image_url: null,
        },
      ],
      total: order.total_amount,
      currency: "INR",
      customer: {
        name: order.customer_name,
        phone: order.customer_phone,
        email: order.customer_email,
        address: order.customer_address,
      },
      notes: order.notes,
      paymentMethod: order.payment_method as "whatsapp" | "bank_transfer",
      orderDate: order.created_at,
      status: order.status,
      databaseId: order.id,
    }));

    return [...dbOrdersAsLocal, ...localOrders].sort(
      (a, b) =>
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
    );
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;

      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />;

      case "shipped":
        return <Truck className="h-5 w-5 text-purple-500" />;

      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;

      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;

      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";

      case "processing":
        return "bg-blue-100 text-blue-800";

      case "shipped":
        return "bg-purple-100 text-purple-800";

      case "delivered":
        return "bg-green-100 text-green-800";

      case "cancelled":
        return "bg-red-100 text-red-800";

      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: OrderStatus) => {
    const statusMap: Record<string, string> = {
      pending: "Pending",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    return statusMap[status] || status;
  };

  const getPaymentMethodIcon = (method: string) => {
    if (method === "whatsapp") {
      return <MessageCircle className="h-4 w-4 text-green-600" />;
    }

    return <CreditCard className="h-4 w-4 text-blue-600" />;
  };

  const getPaymentMethodText = (method: string) => {
    return method === "whatsapp" ? "WhatsApp Order" : "Bank Transfer / UPI";
  };

  const handleViewOrder = (order: CombinedOrder) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  const handleCancelOrder = async (order: LocalOrder) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      const updatedOrders = localOrders.map((o) =>
        o.orderId === order.orderId
          ? {
              ...o,
              status: "cancelled" as OrderStatus,
            }
          : o,
      );

      setLocalOrders(updatedOrders);

      localStorage.setItem("userOrders", JSON.stringify(updatedOrders));

      toast.success("Order cancelled successfully!");

      if (
        selectedOrder &&
        isLocalOrder(selectedOrder) &&
        selectedOrder.orderId === order.orderId
      ) {
        setSelectedOrder({
          ...selectedOrder,
          status: "cancelled",
        });
      }
    }
  };

  const handleReorder = (order: LocalOrder) => {
    const cartItems = order.items.map((item) => ({
      ...item,
      cover_image_url: item.cover_image_url,
    }));

    localStorage.setItem("checkoutCart", JSON.stringify(cartItems));

    toast.success("Items added to cart!");

    navigate("/checkout", {
      state: { cartItems },
    });
  };

  const handleDownloadInvoice = (order: LocalOrder) => {
    const invoiceHtml = generateInvoiceHtml(order);

    const blob = new Blob([invoiceHtml], {
      type: "text/html",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = `Invoice-${order.orderId}.html`;

    a.click();

    URL.revokeObjectURL(url);

    toast.success("Invoice downloaded!");
  };

  const generateInvoiceHtml = (order: LocalOrder): string => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${order.orderId}</title>
      </head>
      <body>
        <h1>Invoice</h1>
        <p>Order ID: ${order.orderId}</p>
      </body>
      </html>
    `;
  };

  const orders = allOrders();

  const filteredOrders =
    filterStatus === "all"
      ? orders
      : orders.filter((order) => order.status === filterStatus);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />

        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2  text-gray-500 hover:text-gray-700 transition-colors duration-200 group mb-6"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>

            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          </div>

          <div className="text-sm text-gray-500">
            <Package className="h-4 w-4 inline mr-1" />
            {orders.length} {orders.length === 1 ? "Order" : "Orders"}
          </div>
        </div>

        {!customerUser && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <LogIn className="h-5 w-5 text-blue-600" />

              <div>
                <p className="text-sm font-medium text-blue-800">
                  You are viewing guest orders
                </p>

                <p className="text-xs text-blue-600">
                  <Link
                    to="/customer/login"
                    className="underline hover:text-blue-800"
                  >
                    Login
                  </Link>{" "}
                  to save orders to your account
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex flex-wrap justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {order.orderId}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        {getStatusIcon(order.status)}

                        {getStatusText(order.status)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />

                        {new Date(order.orderDate).toLocaleDateString()}
                      </span>

                      <span className="flex items-center gap-1">
                        {getPaymentMethodIcon(order.paymentMethod)}

                        {getPaymentMethodText(order.paymentMethod)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{order.total.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mb-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity}x {item.title}
                      </span>

                      <span className="text-gray-900 font-medium">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 mb-4">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />

                    <span className="text-gray-600 line-clamp-1">
                      {order.customer.address}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button onClick={() => handleViewOrder(order)}>
                    <Eye className="h-4 w-4" />
                    View Details
                  </Button>

                  {order.status !== "cancelled" &&
                    order.status !== "delivered" && (
                      <Button onClick={() => handleCancelOrder(order)}>
                        <XCircle className="h-4 w-4" />
                        Cancel Order
                      </Button>
                    )}

                  <Button onClick={() => handleReorder(order)}>
                    <ShoppingBag className="h-4 w-4" />
                    Buy Again
                  </Button>

                  {order.status === "delivered" && (
                    <Button onClick={() => handleDownloadInvoice(order)}>
                      <Download className="h-4 w-4" />
                      Invoice
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};
