import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Button } from "@/components/common/Button";
import { orderAPI, articleAPI } from "@/lib/api";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useSettings } from "@/hooks/useSettings";
import {
  ArrowLeft,
  CreditCard,
  MessageCircle,
  Phone,
  MapPin,
  Mail,
  User,
  AlertCircle,
  UserCheck,
  LogIn,
  Minus,
  Plus,
  Trash2,
  Copy,
  Check,
  X,
  Smartphone,
  Building2,
} from "lucide-react";

type OrderFormData = {
  fullName: string;
  phoneNumber: string;
  email: string;
  deliveryAddress: string;
  orderNotes: string;
  paymentMethod: "whatsapp" | "bank_transfer";
};

export const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: customerUser, loading: authLoading } = useCustomerAuth();
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { showSuccess, showError } = useToast();
  const { settings, loading: settingsLoading } = useSettings();
  const [loading, setLoading] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [completedOrderData, setCompletedOrderData] = useState<any>(null);
  const [savedOrderTotal, setSavedOrderTotal] = useState(0);
  const [savedOrderItems, setSavedOrderItems] = useState<any[]>([]);
  const [qrError, setQrError] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    fullName: "",
    phoneNumber: "",
    email: "",
    deliveryAddress: "",
    orderNotes: "",
    paymentMethod: "whatsapp",
  });
  const [errors, setErrors] = useState<Partial<OrderFormData>>({});

  // Auto-fill form if customer is logged in
  useEffect(() => {
    if (customerUser && !formData.fullName) {
      setFormData((prev) => ({
        ...prev,
        fullName:
          `${customerUser.first_name || ""} ${customerUser.last_name || ""}`.trim(),
        email: customerUser.email || "",
        phoneNumber: customerUser.phone_number || "",
      }));
    }
  }, [customerUser]);

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<OrderFormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Name is required";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?[0-9\s\-\(\)]{10,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    if (!formData.deliveryAddress.trim()) {
      newErrors.deliveryAddress = "Complete delivery address is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof OrderFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePaymentMethodChange = (method: "whatsapp" | "bank_transfer") => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
  };

  const formatWhatsAppMessage = (order: any): string => {
    let message = `*NEW ORDER*\n\n`;
    message += `*Customer Details:*\n`;
    message += `Name: ${order.customer.name}\n`;
    message += `Phone: ${order.customer.phone}\n`;
    message += `Email: ${order.customer.email || "Not provided"}\n`;
    message += `Address: ${order.customer.address}\n\n`;
    message += `*Order Items:*\n`;
    order.items.forEach((item: any, index: number) => {
      message += `${index + 1}. ${item.title} - ${item.quantity} x ₹${item.price}\n`;
    });
    message += `\n*Total Amount:* ₹${order.total}\n`;
    if (order.notes) {
      message += `\n*Notes:* ${order.notes}\n`;
    }
    message += `\n*Payment Method:* ${order.paymentMethod === "whatsapp" ? "WhatsApp Order" : "Bank Transfer/UPI"}\n`;
    return message;
  };

  const saveOrderToStorage = async (orderData: any, orderId: string) => {
    const newOrder = {
      ...orderData,
      orderId,
      status: "pending_payment",
      orderDate: new Date().toISOString(),
    };

    const savedOrdersLocal = localStorage.getItem("userOrders");
    const orders = savedOrdersLocal ? JSON.parse(savedOrdersLocal) : [];
    orders.unshift(newOrder);
    localStorage.setItem("userOrders", JSON.stringify(orders));

    if (customerUser) {
      const userOrdersKey = `user_orders_${customerUser.id}`;
      const existingUserOrders = localStorage.getItem(userOrdersKey);
      const userOrders = existingUserOrders
        ? JSON.parse(existingUserOrders)
        : [];
      userOrders.unshift(newOrder);
      localStorage.setItem(userOrdersKey, JSON.stringify(userOrders));
    }

    localStorage.setItem("lastPlacedOrder", JSON.stringify(newOrder));

    return newOrder;
  };

  const handleSubmitOrder = async () => {
    if (!validateForm()) {
      showError("Please fill in all required fields");
      return;
    }

    for (const item of cartItems) {
      if (item.quantity > item.stock_quantity) {
        showError(
          `${item.title} is only available in quantity ${item.stock_quantity}`,
        );
        return;
      }
    }

    setLoading(true);

    const total = calculateTotal();
    const orderData = {
      items: cartItems,
      total: total,
      customer: {
        name: formData.fullName,
        phone: formData.phoneNumber,
        email: formData.email || null,
        address: formData.deliveryAddress,
      },
      notes: formData.orderNotes,
      paymentMethod: formData.paymentMethod,
      orderDate: new Date().toISOString(),
      customerId: customerUser?.id || null,
    };

    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    try {
      try {
        const stockUpdates = cartItems.map(async (item) => {
          const newStockQuantity = Math.max(
            0,
            item.stock_quantity - item.quantity,
          );
          await articleAPI.update(item.id, {
            stock_quantity: newStockQuantity,
            in_stock: newStockQuantity > 0,
          });
        });
        await Promise.all(stockUpdates);
      } catch (stockError) {
        console.error("Failed to update stock:", stockError);
      }

      let savedOrders = null;
      try {
        const orderPromises = cartItems.map(async (item) => {
          const orderPayload = {
            article_id: item.id,
            article_title: item.title,
            article_author: item.author,
            quantity: item.quantity,
            customer_name: orderData.customer.name,
            customer_email: orderData.customer.email,
            customer_phone: orderData.customer.phone,
            customer_address: orderData.customer.address,
            payment_method: orderData.paymentMethod,
            total_amount: item.price * item.quantity,
            currency: item.currency || "INR",
            notes: orderData.notes,
            status: "pending_payment",
          };
          const response = await orderAPI.create(orderPayload);
          return response.data?.order || response.data;
        });
        savedOrders = await Promise.all(orderPromises);
      } catch (dbError) {
        console.error("Database save failed:", dbError);
      }

      setSavedOrderTotal(total);
      setSavedOrderItems([...cartItems]);
      await saveOrderToStorage(orderData, orderId);
      clearCart();

      if (formData.paymentMethod === "whatsapp") {
        const message = formatWhatsAppMessage(orderData);
        const whatsappNumber = settings?.whatsapp_number;
        if (whatsappNumber) {
          const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, "_blank");
        }
        showSuccess("Redirecting to WhatsApp to complete your order!");

        setTimeout(() => {
          navigate("/order-confirmation", {
            state: {
              orderData,
              savedOrders,
              orderId: savedOrders?.[0]?.id || orderId,
            },
            replace: true,
          });
        }, 1500);
      } else {
        setCompletedOrderData({
          orderData,
          savedOrders,
          orderId: savedOrders?.[0]?.id || orderId,
        });
        setShowPaymentDetails(true);
        setLoading(false);
        showSuccess("Order created! Please complete the payment.");
      }
    } catch (error) {
      console.error("Order submission failed:", error);
      showError("Failed to place order. Please try again.");
      setLoading(false);
    }
  };

  const total = calculateTotal();

  // Payment Details Modal Component
  const PaymentDetailsModal = () => {
    const [copiedField, setCopiedField] = useState<string>("");
    const [showQR, setShowQR] = useState(true);
    const [localQrError, setLocalQrError] = useState(false);

    const copyToClipboard = (text: string, field: string) => {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 2000);
    };

    const handleProceedToConfirmation = () => {
      setShowPaymentDetails(false);
      if (completedOrderData) {
        navigate("/order-confirmation", {
          state: {
            orderData: completedOrderData.orderData,
            savedOrders: completedOrderData.savedOrders,
            orderId: completedOrderData.orderId,
          },
          replace: true,
        });
      } else {
        const lastOrder = localStorage.getItem("lastPlacedOrder");
        if (lastOrder) {
          const parsedOrder = JSON.parse(lastOrder);
          navigate("/order-confirmation", {
            state: {
              orderData: parsedOrder,
              orderId: parsedOrder.orderId,
            },
            replace: true,
          });
        } else {
          navigate("/");
        }
      }
    };

    const getOrderId = () => {
      if (completedOrderData?.orderId) {
        return completedOrderData.orderId;
      }
      const lastOrder = localStorage.getItem("lastPlacedOrder");
      if (lastOrder) {
        try {
          const parsed = JSON.parse(lastOrder);
          return parsed.orderId;
        } catch (e) {
          return "Processing...";
        }
      }
      return "Processing...";
    };

    const orderId = getOrderId();

    // Get all payment details from settings
    const upiId = settings?.upi_id || "";
    const whatsappNumber = settings?.whatsapp_number || "";
    const paymentInstructions = settings?.payment_instructions || "";
    const accountHolderName = settings?.account_holder_name || "";
    const bankName = settings?.bank_name || "";
    const accountNumber = settings?.account_number || "";
    const ifscCode = settings?.ifsc_code || "";
    const qrCodeUrl = settings?.qr_code_url || "";

    // Check if any payment details are available
    const hasUPI = upiId && upiId.trim() !== "";
    const hasBankDetails =
      accountHolderName && bankName && accountNumber && ifscCode;
    const hasQRCode = qrCodeUrl && qrCodeUrl.trim() !== "";

    if (!showPaymentDetails) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={() => setShowPaymentDetails(false)}
      >
        <div
          className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Payment Details</h2>
            <button
              onClick={() => setShowPaymentDetails(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-gray-600 text-sm mt-1">
                Please complete your payment using the details below
              </p>
            </div>

            {/* Order ID */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Order ID:</span>
                <span className="text-sm font-mono font-bold text-blue-600">
                  {orderId}
                </span>
              </div>
            </div>

            {/* Order Items Summary */}
            {savedOrderItems.length > 0 && (
              <div className="mb-4 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Order Summary
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {savedOrderItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.quantity}x {item.title}
                      </span>
                      <span className="text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span className="text-blue-600">
                      ₹{savedOrderTotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Total Amount */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Amount to Pay:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{savedOrderTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* UPI Payment Section with QR Code */}
            {(hasUPI || hasQRCode) && (
              <div className="mb-4 border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">
                    Scan & Pay with UPI
                  </h3>
                </div>

                {/* QR Code Image */}
                {hasQRCode && (
                  <div className="flex flex-col items-center mb-4 p-4 bg-white rounded-lg">
                    <img
                      src={
                        qrCodeUrl.startsWith("http")
                          ? qrCodeUrl
                          : `${import.meta.env.VITE_API_URL || "http://localhost:4000"}${qrCodeUrl}`
                      }
                      alt="UPI QR Code - Scan to Pay"
                      className="w-48 h-48 mb-2 object-contain"
                      onError={(e) => {
                        console.error("QR Code failed to load:", qrCodeUrl);
                        setLocalQrError(true);
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    {!localQrError && (
                      <>
                        <p className="text-sm font-medium text-gray-700 mt-2">
                          Scan this QR code to pay ₹
                          {savedOrderTotal.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Using any UPI app: Google Pay, PhonePe, Paytm, etc.
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* UPI ID */}
                {hasUPI && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">
                          UPI ID (Manual Entry)
                        </p>
                        <code className="text-sm font-mono break-all">
                          {upiId}
                        </code>
                      </div>
                      <button
                        onClick={() => copyToClipboard(upiId, "UPI ID")}
                        className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition flex-shrink-0"
                      >
                        {copiedField === "UPI ID" ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Or copy UPI ID to pay manually from your banking app
                    </p>
                  </div>
                )}

                {!hasUPI && !hasQRCode && (
                  <p className="text-sm text-yellow-600 text-center py-2">
                    No UPI payment details configured. Please use bank transfer.
                  </p>
                )}
              </div>
            )}

            {/* Bank Transfer Section */}
            {hasBankDetails && (
              <div className="mb-4 border-2 border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">
                    Bank Transfer (NEFT/RTGS/IMPS)
                  </h3>
                </div>

                <div className="space-y-3">
                  {accountHolderName && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">
                        Account Holder Name
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {accountHolderName}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(accountHolderName, "Account Name")
                          }
                          className="ml-2 p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          {copiedField === "Account Name" ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {bankName && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Bank Name</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{bankName}</span>
                        <button
                          onClick={() => copyToClipboard(bankName, "Bank Name")}
                          className="ml-2 p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          {copiedField === "Bank Name" ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {accountNumber && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">
                        Account Number
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono">
                          {accountNumber}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(accountNumber, "Account Number")
                          }
                          className="ml-2 p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          {copiedField === "Account Number" ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {ifscCode && (
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">IFSC Code</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono uppercase">
                          {ifscCode}
                        </span>
                        <button
                          onClick={() => copyToClipboard(ifscCode, "IFSC Code")}
                          className="ml-2 p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          {copiedField === "IFSC Code" ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Instructions */}
            {paymentInstructions && (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  📝 Payment Instructions
                </h3>
                <p className="text-sm text-yellow-700 whitespace-pre-wrap">
                  {paymentInstructions}
                </p>
                {whatsappNumber && (
                  <ul className="text-xs text-yellow-700 mt-2 space-y-1 list-disc list-inside">
                    <li>After successful payment, please take a screenshot</li>
                    <li>
                      Send the screenshot to WhatsApp number:{" "}
                      <strong className="font-mono">{whatsappNumber}</strong>
                    </li>
                    <li>
                      Include your Order ID:{" "}
                      <strong className="font-mono">{orderId}</strong> in the
                      message
                    </li>
                    <li>
                      Your order will be confirmed within 2-4 hours after
                      payment verification
                    </li>
                  </ul>
                )}
              </div>
            )}

            {!hasUPI && !hasQRCode && !hasBankDetails && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-600 text-center">
                  No payment methods configured. Please contact support.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentDetails(false);
                  navigate("/");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleProceedToConfirmation}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                View Order
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
              Your order will be confirmed after payment verification
            </p>
          </div>
        </div>
      </div>
    );
  };

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (cartItems.length === 0 && !showPaymentDetails) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add some items to your cart before checking out
            </p>
            <Button onClick={() => navigate("/")} size="md" className="mx-auto">
              Continue Shopping
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2  text-gray-500 hover:text-gray-700 transition-colors duration-200 group mb-6"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Customer Info Banner */}
        {customerUser && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  You are ordering as {customerUser.first_name}{" "}
                  {customerUser.last_name}
                </p>
                <p className="text-xs text-green-600">
                  Your order will be saved to your account
                </p>
              </div>
            </div>
          </div>
        )}

        {!customerUser && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <LogIn className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Checking out as a guest
                </p>
                <p className="text-xs text-blue-600">
                  <Link
                    to="/customer/login"
                    className="underline hover:text-blue-800"
                  >
                    Login
                  </Link>{" "}
                  to save your order history and track easily
                </p>
              </div>
            </div>
            <Link
              to="/customer/login"
              state={{ from: "/checkout" }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Login
            </Link>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items - Left Column */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Your Cart ({cartItems.length}{" "}
                  {cartItems.length === 1 ? "item" : "items"})
                </h2>
              </div>

              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 pb-4 border-b border-gray-100 last:border-0"
                  >
                    <div className="w-16 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.cover_image_url ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL || "http://localhost:4000"}${item.cover_image_url}`}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        by {item.author}
                      </p>
                      <p className="text-sm font-semibold text-blue-600 mt-1">
                        ₹{item.price}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1 rounded-full hover:bg-gray-100 transition"
                          >
                            <Minus className="h-3 w-3 text-gray-500" />
                          </button>
                          <span className="text-sm font-medium text-gray-700 w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              if (item.quantity + 1 <= item.stock_quantity) {
                                updateQuantity(item.id, item.quantity + 1);
                              } else {
                                showError(
                                  `Only ${item.stock_quantity} items available`,
                                );
                              }
                            }}
                            className="p-1 rounded-full hover:bg-gray-100 transition"
                            disabled={item.quantity >= item.stock_quantity}
                          >
                            <Plus className="h-3 w-3 text-gray-500" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            ₹{item.price * item.quantity}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-full transition"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      {item.stock_quantity <= 5 && (
                        <p className="text-xs text-orange-600 mt-1">
                          Only {item.stock_quantity} left in stock
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₹{total}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total amount
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Form - Right Column */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">
                  Place your order
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Complete your purchase
                </p>
              </div>

              <div className="p-6 space-y-8">
                {/* Payment Method Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Payment method
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="whatsapp"
                        checked={formData.paymentMethod === "whatsapp"}
                        onChange={() => handlePaymentMethodChange("whatsapp")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-gray-900">
                            WhatsApp order
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Confirm order details and arrange payment via
                          WhatsApp.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={formData.paymentMethod === "bank_transfer"}
                        onChange={() =>
                          handlePaymentMethodChange("bank_transfer")
                        }
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            Bank Transfer / UPI
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Receive payment details instantly to transfer
                          manually.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Customer Information Form */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Customer Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.fullName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Full name"
                        />
                      </div>
                      {errors.fullName && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.phoneNumber
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Phone number"
                        />
                      </div>
                      {errors.phoneNumber && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.phoneNumber}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email{" "}
                        <span className="text-gray-400 text-xs">
                          (optional)
                        </span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.email ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Email address"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <textarea
                          name="deliveryAddress"
                          value={formData.deliveryAddress}
                          onChange={handleInputChange}
                          rows={3}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.deliveryAddress
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Full street address, city, state, pin code"
                        />
                      </div>
                      {errors.deliveryAddress && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.deliveryAddress}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order notes{" "}
                        <span className="text-gray-400 text-xs">
                          (optional)
                        </span>
                      </label>
                      <textarea
                        name="orderNotes"
                        value={formData.orderNotes}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Any special instructions for delivery"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => navigate("/")}
                    variant="secondary"
                    className=" transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Continue Shopping
                  </Button>
                  <Button
                    onClick={handleSubmitOrder}
                    disabled={loading || cartItems.length === 0}
                    className="disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? "Processing..." : `Confirm Order (₹${total})`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Payment Details Modal */}
      <PaymentDetailsModal />
    </div>
  );
};
