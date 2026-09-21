// client/src/context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";

export interface CartItem {
  id: number;
  title: string;
  author: string;
  price: number;
  currency: string;
  quantity: number;
  cover_image_url: string | null;
  stock_quantity: number;
  in_stock: boolean;
  type?: string;
  isbn?: string;
  published_year?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    item: Omit<CartItem, "quantity"> & { quantity?: number },
    quantity?: number,
  ) => boolean;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => boolean;
  updateCartItemQuantity: (id: number, quantity: number) => boolean;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  isInCart: (id: number) => boolean;
  getCartItem: (id: number) => CartItem | undefined;
  syncCartWithStock: (articles: any[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { showSuccess, showError } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("shoppingCart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        const validCart = Array.isArray(parsed) ? parsed : [];
        setCartItems(validCart);
      } catch (e) {
        console.error("Failed to load cart:", e);
        setCartItems([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("shoppingCart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (
    item: Omit<CartItem, "quantity"> & { quantity?: number },
    quantity?: number,
  ): boolean => {
    const finalQuantity = quantity || item.quantity || 1;

    if (finalQuantity <= 0) {
      showError("Quantity must be at least 1");
      return false;
    }

    if (item.stock_quantity < finalQuantity) {
      showError(`Only ${item.stock_quantity} items available in stock`);
      return false;
    }

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);

      if (existingItem) {
        const newQuantity = finalQuantity;

        if (newQuantity > item.stock_quantity) {
          showError(
            `Cannot set quantity to ${newQuantity}. Only ${item.stock_quantity} available`,
          );
          return prevItems;
        }

        const updatedItems = prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: newQuantity } : i,
        );
        showSuccess(`Updated ${item.title} quantity to ${newQuantity}`);
        return updatedItems;
      } else {
        const newItem: CartItem = {
          ...item,
          quantity: finalQuantity,
        };
        showSuccess(`Added ${finalQuantity} x ${item.title} to cart`);
        return [...prevItems, newItem];
      }
    });
    return true;
  };

  const removeFromCart = (id: number) => {
    const item = cartItems.find((i) => i.id === id);
    setCartItems((prev) => prev.filter((i) => i.id !== id));
    if (item) {
      showSuccess(`Removed ${item.title} from cart`);
    }
  };

  const updateQuantity = (id: number, quantity: number): boolean => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) {
      showError("Item not found in cart");
      return false;
    }

    if (quantity < 1) {
      showError("Quantity cannot be less than 1");
      return false;
    }

    if (quantity > item.stock_quantity) {
      showError(`Only ${item.stock_quantity} items available in stock`);
      return false;
    }

    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
    );
    showSuccess(`Updated ${item.title} quantity to ${quantity}`);
    return true;
  };

  const updateCartItemQuantity = (id: number, quantity: number): boolean => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) {
      showError("Item not found in cart");
      return false;
    }

    if (quantity < 1) {
      showError("Quantity cannot be less than 1");
      return false;
    }

    if (quantity > item.stock_quantity) {
      showError(`Only ${item.stock_quantity} items available in stock`);
      return false;
    }

    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i)),
    );
    showSuccess(`Updated ${item.title} quantity to ${quantity}`);
    return true;
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("shoppingCart");
    showSuccess("Cart cleared");
  };

  const getCartTotal = (): number => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const getCartCount = (): number => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const isInCart = (id: number): boolean => {
    return cartItems.some((item) => item.id === id);
  };

  const getCartItem = (id: number): CartItem | undefined => {
    return cartItems.find((item) => item.id === id);
  };

  const syncCartWithStock = (articles: any[]): void => {
    if (!articles || articles.length === 0) return;

    const updatedCart = cartItems
      .map((cartItem) => {
        const article = articles.find((a) => a.id === cartItem.id);
        if (article) {
          const newQuantity = Math.min(
            cartItem.quantity,
            article.stock_quantity,
          );

          if (newQuantity > 0 && article.in_stock) {
            return {
              ...cartItem,
              stock_quantity: article.stock_quantity,
              in_stock: article.in_stock,
              quantity: newQuantity,
              price: article.price || cartItem.price,
              currency: article.currency || cartItem.currency,
            };
          }
          return null;
        }
        return cartItem;
      })
      .filter((item): item is CartItem => item !== null && item.quantity > 0);

    if (updatedCart.length !== cartItems.length) {
      showSuccess("Cart updated with latest stock information");
    }

    setCartItems(updatedCart);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateCartItemQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isInCart,
        getCartItem,
        syncCartWithStock,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
