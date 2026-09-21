import { useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Button } from "@/components/common/Button";
import {
  CheckCircle,
  ShoppingBag,
  Home,
  FileText,
  UserCheck,
  LogIn,
  Package,
  Clock,
} from "lucide-react";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useToast } from "@/context/ToastContext";

export const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: customerUser } = useCustomerAuth();
  const { showError } = useToast();
  const { orderData, savedOrders } = location.state || {};

  useEffect(() => {
    // If no order data in state, try to get from localStorage
    if (!orderData) {
      const lastOrder = localStorage.getItem("lastPlacedOrder");
      if (lastOrder) {
        try {
          const parsedOrder = JSON.parse(lastOrder);
          // We have order data, but we can't update state directly
          // Just don't redirect
          console.log("Found last order in localStorage:", parsedOrder);
        } catch (e) {
          console.error("Failed to parse last order:", e);
          showError("No order data found");
          navigate("/");
        }
      } else {
        showError("No order data found");
        navigate("/");
      }
    }
  }, [orderData, navigate, showError]);

  // Get order data from state or localStorage
  const getOrderData = () => {
    if (orderData) return orderData;

    const lastOrder = localStorage.getItem("lastPlacedOrder");
    if (lastOrder) {
      try {
        return JSON.parse(lastOrder);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const getOrderId = () => {
    if (savedOrders?.[0]?.id) {
      return `#${savedOrders[0].id}`;
    }
    if (location.state?.orderId) {
      return `#${location.state.orderId}`;
    }
    const lastOrder = localStorage.getItem("lastPlacedOrder");
    if (lastOrder) {
      try {
        const parsed = JSON.parse(lastOrder);
        return parsed.orderId || "Processing...";
      } catch (e) {
        return "Processing...";
      }
    }
    return "Processing...";
  };

  const getPaymentStatus = () => {
    const order = getOrderData();
    if (order?.paymentMethod === "bank_transfer") {
      return {
        status: "Pending Payment",
        color: "bg-yellow-100 text-yellow-800",
        message: "Your order will be confirmed after payment verification",
      };
    }
    return {
      status: "Pending Confirmation",
      color: "bg-yellow-100 text-yellow-800",
      message: "Our team will contact you shortly to confirm your order",
    };
  };

  const handleMyOrdersClick = () => {
    if (customerUser) {
      navigate("/customer/orders");
    } else {
      navigate("/orders");
    }
  };

  const finalOrderData = getOrderData();
  const paymentStatus = getPaymentStatus();

  if (!finalOrderData) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Order Placed Successfully!
            </h1>

            <p className="text-gray-600 mb-6">
              Thank you for your order. We'll process it shortly.
            </p>
          </div>

          {/* Order ID Display */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500">Order Reference</p>
            <p className="text-xl font-mono font-bold text-blue-600">
              {getOrderId()}
            </p>
            {!customerUser && (
              <p className="text-xs text-gray-400 mt-1">
                Please save this order ID for reference
              </p>
            )}
          </div>

          {/* Payment Status Banner */}
          <div className={`mb-6 ${paymentStatus.color} border rounded-lg p-4`}>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Order Status: {paymentStatus.status}
                </p>
                <p className="text-xs opacity-75">{paymentStatus.message}</p>
              </div>
            </div>
          </div>

          {/* Customer Info Banner - Logged In Customer */}
          {customerUser && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    Order saved to your account
                  </p>
                  <p className="text-xs text-green-600">
                    You can track this order in your orders page
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Guest User Banner - Not Logged In */}
          {!customerUser && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <LogIn className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">
                    Want to track your order?
                  </p>
                  <p className="text-xs text-blue-600">
                    <Link
                      to="/customer/login"
                      className="underline font-medium"
                    >
                      Login or Create an account
                    </Link>{" "}
                    to save your order history and get real-time updates
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Order Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Status:</span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${paymentStatus.color}`}
                >
                  {paymentStatus.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method:</span>
                <span className="text-gray-900">
                  {finalOrderData.paymentMethod === "whatsapp"
                    ? "WhatsApp Order"
                    : "Bank Transfer/UPI"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Amount:</span>
                <span className="font-bold text-gray-900">
                  ₹{finalOrderData.total?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Address:</span>
                <span className="text-gray-900 text-right max-w-[60%]">
                  {finalOrderData.customer?.address}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items Summary */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Items Ordered
            </h3>
            <div className="space-y-2">
              {finalOrderData.items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.quantity}x {item.title}
                  </span>
                  <span className="text-gray-900">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps - Different for each payment method */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-amber-800 text-sm mb-2">
              📋 Next Steps
            </h4>
            <ul className="text-xs text-amber-700 space-y-1">
              {finalOrderData.paymentMethod === "whatsapp" ? (
                <>
                  <li>
                    • You will receive a confirmation message on WhatsApp
                    shortly
                  </li>
                  <li>• Our team will contact you within 24 hours</li>
                  <li>• Order will be processed after payment confirmation</li>
                  <li>• Check WhatsApp for payment details and updates</li>
                </>
              ) : (
                <>
                  <li>• Complete the payment using the details shown</li>
                  <li>• Send payment screenshot to our WhatsApp number</li>
                  <li>• Include your Order ID in the message</li>
                  <li>• Order will be confirmed after payment verification</li>
                  <li>• You will receive confirmation within 2-4 hours</li>
                </>
              )}
            </ul>
          </div>

          {/* Payment Reminder for Bank Transfer */}
          {finalOrderData.paymentMethod === "bank_transfer" && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-blue-800 text-sm mb-2">
                💰 Payment Required
              </h4>
              <p className="text-xs text-blue-700 mb-2">
                Please complete your payment of{" "}
                <strong>₹{finalOrderData.total?.toLocaleString()}</strong> to
                confirm your order.
              </p>
              <p className="text-xs text-blue-700">
                If you haven't saved the payment details, please check the{" "}
                <a href="/payment-methods" className="text-green-600">
                  payment method
                </a>{" "}
                or{" "}
                <a href="/contact" className="text-green-600">
                  contact
                </a>{" "}
                page for support.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate("/")}
              className="gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Home className="h-4 w-4" />
              Continue Shopping
            </Button>
            <Button
              onClick={handleMyOrdersClick}
              variant="secondary"
              className="gap-2 px-4 py-2 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <ShoppingBag className="h-4 w-4" />
              {customerUser ? "My Orders" : "Guest Orders"}
            </Button>
          </div>

          {/* Guest Info Note */}
          {!customerUser && (
            <p className="text-center text-xs text-gray-400 mt-4">
              Note: Guest orders are saved in your browser. For permanent
              access, please create an account.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
