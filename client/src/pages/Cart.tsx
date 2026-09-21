// client/src/pages/Cart.tsx
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { Button } from "@/components/common/Button";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export const Cart = () => {
  const navigate = useNavigate();
  const { showError } = useToast();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount,
  } = useCart();

  const getImageUrl = (url: string | null | undefined): string => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
    return `${baseUrl}${url}`;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-sm border border-gray-200 justify-items-center">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Add some items to your cart to get started
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700"
            >
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
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            Shopping Cart ({getCartCount()} items)
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {getImageUrl(item.cover_image_url) ? (
                        <img
                          src={getImageUrl(item.cover_image_url)}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                            const parent = (e.target as HTMLImageElement)
                              .parentElement;
                            if (parent) {
                              parent.innerHTML =
                                '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>';
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        by {item.author}
                      </p>
                      <div className="flex flex-wrap items-center justify-between mt-2">
                        <p className="text-lg font-bold text-blue-600">
                          {item.currency === "INR"
                            ? "₹"
                            : item.currency === "USD"
                              ? "$"
                              : "€"}
                          {(item.price * item.quantity).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.currency === "INR"
                            ? "₹"
                            : item.currency === "USD"
                              ? "$"
                              : "€"}
                          {item.price.toLocaleString()} each
                        </p>
                      </div>

                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => {
                              if (item.quantity - 1 >= 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              } else {
                                showError("Quantity cannot be less than 1");
                              }
                            }}
                            className="p-1.5 hover:bg-gray-100 transition disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-10 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              if (item.quantity + 1 <= item.stock_quantity) {
                                updateQuantity(item.id, item.quantity + 1);
                              } else {
                                showError(
                                  `Only ${item.stock_quantity} items available in stock`,
                                );
                              }
                            }}
                            className="p-1.5 hover:bg-gray-100 transition disabled:opacity-50"
                            disabled={item.quantity >= item.stock_quantity}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>

                      {item.stock_quantity <= 5 && item.stock_quantity > 0 && (
                        <p className="text-xs text-orange-600 mt-2">
                          Only {item.stock_quantity} left in stock
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({getCartCount()} items)</span>
                    <span className="text-gray-900">
                      ₹{getCartTotal().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="text-gray-900">Included</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">
                        Total
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        ₹{getCartTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    if (cartItems.length > 0) {
                      navigate("/checkout");
                    } else {
                      showError("Your cart is empty");
                    }
                  }}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <button
                  onClick={() => navigate("/")}
                  className="w-full mt-3 text-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
