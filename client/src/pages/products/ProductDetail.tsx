// client/src/pages/products/ProductDetail.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Layout/Header";
import { Footer } from "@/components/Layout/Footer";
import { articleAPI } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/common/Button";
import {
  ArrowLeft,
  BookOpen,
  Star,
  Calendar,
  User,
  Package,
  Hash,
  Globe,
  Printer,
  CreditCard,
  Minus,
  Plus,
  ShoppingCart,
  CheckCircle,
} from "lucide-react";

type Article = {
  id: number;
  title: string;
  author: string;
  type: string;
  description: string;
  price: number;
  currency: string;
  cover_image_url: string | null;
  category: string | null;
  isbn: string | null;
  published_year: number | null;
  page_count: number | null;
  language: string | null;
  publisher: string | null;
  stock_quantity: number;
  in_stock: boolean;
  featured: boolean;
  created_at: string;
};

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart, getCartItem, updateCartItemQuantity } =
    useCart();
  const { showSuccess, showError } = useToast();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await articleAPI.getPublicById(Number(id));
      const responseData = response as any;
      let articleData = null;

      if (responseData.data?.article) {
        articleData = responseData.data.article;
      } else if (responseData.article) {
        articleData = responseData.article;
      } else if (responseData.data && !responseData.data.article) {
        articleData = responseData.data;
      } else if (responseData.success && responseData.article) {
        articleData = responseData.article;
      } else {
        articleData = responseData;
      }

      setArticle(articleData);

      const cartItem = getCartItem(articleData.id);
      if (cartItem) {
        setQuantity(cartItem.quantity);
      } else {
        setQuantity(1);
      }
    } catch (error) {
      console.error("Failed to fetch article:", error);
      showError("Failed to load product details");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, { label: string; color: string; bg: string }> =
      {
        book: { label: "Book", color: "text-purple-700", bg: "bg-purple-100" },
        journal: {
          label: "Journal",
          color: "text-blue-700",
          bg: "bg-blue-100",
        },
        magazine: {
          label: "Magazine",
          color: "text-pink-700",
          bg: "bg-pink-100",
        },
        newspaper: {
          label: "Newspaper",
          color: "text-green-700",
          bg: "bg-green-100",
        },
      };
    return (
      types[type] || { label: type, color: "text-gray-700", bg: "bg-gray-100" }
    );
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (article) {
      if (newQuantity < 1) return;
      if (newQuantity > article.stock_quantity) {
        showError(`Only ${article.stock_quantity} items available`);
        return;
      }
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!article) return;

    setAddingToCart(true);

    const existingCartItem = getCartItem(article.id);

    let success = false;

    if (existingCartItem) {
      success = updateCartItemQuantity(article.id, quantity);
    } else {
      success = addToCart(
        {
          id: article.id,
          title: article.title,
          author: article.author,
          price: article.price,
          currency: article.currency,
          cover_image_url: article.cover_image_url,
          stock_quantity: article.stock_quantity,
          in_stock: article.in_stock,
        },
        quantity,
      );
    }

    setAddingToCart(false);

    if (success) {
      showSuccess(
        <div className="flex items-center justify-between gap-4">
          <span>
            Added {quantity} x {article.title} to cart
          </span>
          <button
            onClick={() => navigate("/checkout")}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            View Cart
          </button>
        </div>,
      );
    }
  };

  const getImageUrl = (url: string | null): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith("http")) return url;
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
    return `${baseUrl}${url}`;
  };

  if (loading) {
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

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Product not found
            </h2>
            <p className="text-gray-500 mb-6">
              The article you're looking for doesn't exist.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Back to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const typeInfo = getTypeBadge(article.type);
  const imageUrl = getImageUrl(article.cover_image_url);
  const isInCartFlag = isInCart(article.id);
  const cartItem = getCartItem(article.id);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2  text-gray-500 hover:text-gray-700 transition-colors duration-200 group mb-6"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="flex flex-col md:flex-row justify-between gap-12 mb-8 h-[500px]">
          <div className="w-full md:w-80">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={article.title}
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "";
                  }}
                />
              ) : (
                <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <BookOpen className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 p-5 w-auto md:w-[70%] overflow-scroll [scrollbar-width:none]">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeInfo.bg} ${typeInfo.color}`}
              >
                {typeInfo.label}
              </span>
              {article.featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                  <Star className="h-4 w-4 fill-yellow-500" />
                  Featured
                </span>
              )}
              {!article.in_stock || article.stock_quantity === 0 ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                  Out of Stock
                </span>
              ) : (
                article.stock_quantity < 10 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                    Only {article.stock_quantity} left
                  </span>
                )
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 font-serif">
              {article.title}
            </h1>

            <p className="text-lg text-gray-600 flex items-center gap-2">
              <User className="h-5 w-5" />
              by {article.author}
            </p>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600">
                {article.currency === "INR"
                  ? "₹"
                  : article.currency === "USD"
                    ? "$"
                    : "€"}
                {article.price.toLocaleString()}
              </span>
              {article.currency === "INR" && (
                <span className="text-gray-500">+ Free Shipping</span>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg py-4">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Availability:</span>
                </div>
                {article.in_stock && article.stock_quantity > 0 ? (
                  <span className="text-green-600 font-medium">
                    In Stock ({article.stock_quantity} units available)
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">Out of Stock</span>
                )}
              </div>
            </div>

            {article.in_stock && article.stock_quantity > 0 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= article.stock_quantity}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <Button
                    onClick={handleAddToCart}
                    disabled={addingToCart || !article.in_stock}
                    className="bg-blue-600 hover:bg-blue-700 gap-2"
                  >
                    {addingToCart ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : isInCartFlag ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Update Cart ({quantity})
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart ({quantity})
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {article.description && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {article.description}
                </p>
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Product Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {article.isbn && (
                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">ISBN:</span>
                    <span className="text-gray-900 font-mono">
                      {article.isbn}
                    </span>
                  </div>
                )}
                {article.published_year && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Published:</span>
                    <span className="text-gray-900">
                      {article.published_year}
                    </span>
                  </div>
                )}
                {article.page_count && (
                  <div className="flex items-center gap-2 text-sm">
                    <Printer className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Pages:</span>
                    <span className="text-gray-900">{article.page_count}</span>
                  </div>
                )}
                {article.language && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Language:</span>
                    <span className="text-gray-900">{article.language}</span>
                  </div>
                )}
                {article.publisher && (
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Publisher:</span>
                    <span className="text-gray-900">{article.publisher}</span>
                  </div>
                )}
                {article.category && (
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Category:</span>
                    <span className="text-gray-900">{article.category}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
