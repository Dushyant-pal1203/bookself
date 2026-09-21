import { lazy } from "react";
import { Navigate } from "react-router-dom";

// Lazy load pages for better performance
const Home = lazy(() =>
  import("@/pages/Home").then((module) => ({ default: module.Home })),
);
const Catalogue = lazy(() =>
  import("@/pages/Catalogue").then((module) => ({ default: module.Catalogue })),
);
const About = lazy(() =>
  import("@/pages/About").then((module) => ({ default: module.About })),
);
const ContactUs = lazy(() =>
  import("@/pages/ContactUs").then((module) => ({ default: module.ContactUs })),
);
const PrivacyPolicy = lazy(() =>
  import("@/pages/PrivacyPolicy").then((module) => ({
    default: module.PrivacyPolicy,
  })),
);
const TermsOfService = lazy(() =>
  import("@/pages/TermsOfService").then((module) => ({
    default: module.TermsOfService,
  })),
);
const PaymentMethods = lazy(() =>
  import("@/pages/PaymentMethods").then((module) => ({
    default: module.PaymentMethods,
  })),
);
const ProductDetail = lazy(() =>
  import("@/pages/products/ProductDetail").then((module) => ({
    default: module.ProductDetail,
  })),
);
const Checkout = lazy(() =>
  import("@/pages/payment/Checkout").then((module) => ({
    default: module.Checkout,
  })),
);
const Cart = lazy(() =>
  import("@/pages/Cart").then((module) => ({ default: module.Cart })),
);
const Orders = lazy(() =>
  import("@/pages/orders/Orders").then((module) => ({
    default: module.Orders,
  })),
);
const OrderConfirmation = lazy(() =>
  import("@/pages/orders/OrderConfirmation").then((module) => ({
    default: module.OrderConfirmation,
  })),
);

// Admin pages
const AdminLogin = lazy(() =>
  import("@/pages/admin/Login").then((module) => ({
    default: module.AdminLogin,
  })),
);
const AdminDashboard = lazy(() =>
  import("@/pages/admin/Dashboard").then((module) => ({
    default: module.AdminDashboard,
  })),
);
const AdminArticles = lazy(() =>
  import("@/pages/admin/Articles").then((module) => ({
    default: module.AdminArticles,
  })),
);
const AdminOrders = lazy(() =>
  import("@/pages/admin/Orders").then((module) => ({
    default: module.AdminOrders,
  })),
);
const AdminSettings = lazy(() =>
  import("@/pages/admin/Settings").then((module) => ({
    default: module.AdminSettings,
  })),
);

// Customer pages
const CustomerLogin = lazy(() =>
  import("@/pages/customer/Login").then((module) => ({
    default: module.CustomerLogin,
  })),
);
const CustomerSignup = lazy(() =>
  import("@/pages/customer/Signup").then((module) => ({
    default: module.CustomerSignup,
  })),
);
const CustomerDashboard = lazy(() =>
  import("@/pages/customer/CustomerDashboard").then((module) => ({
    default: module.CustomerDashboard,
  })),
);
const CustomerProfile = lazy(() =>
  import("@/pages/customer/Profile").then((module) => ({
    default: module.CustomerProfile,
  })),
);
const CustomerOrders = lazy(() =>
  import("@/pages/customer/CustomerOrders").then((module) => ({
    default: module.CustomerOrders,
  })),
);
const CustomerOrderTracking = lazy(() =>
  import("@/pages/customer/CustomerOrderTracking").then((module) => ({
    default: module.CustomerOrderTracking,
  })),
);
const BillDetail = lazy(() =>
  import("@/pages/customer/BillDetail").then((module) => ({
    default: module.BillDetail,
  })),
);

export const publicRoutes = [
  { path: "/", element: Home, name: "Home" },
  { path: "/product/:id", element: ProductDetail, name: "ProductDetail" },
  { path: "/catalogue", element: Catalogue, name: "Catalogue" },
  { path: "/about", element: About, name: "About" },
  { path: "/contact", element: ContactUs, name: "Contact" },
  { path: "/privacy", element: PrivacyPolicy, name: "Privacy" },
  { path: "/terms", element: TermsOfService, name: "Terms" },
  { path: "/payment-methods", element: PaymentMethods, name: "PaymentMethods" },
  { path: "/checkout", element: Checkout, name: "Checkout" },
  { path: "/cart", element: Cart, name: "Cart" },
  {
    path: "/order-confirmation",
    element: OrderConfirmation,
    name: "OrderConfirmation",
  },
  { path: "/orders", element: Orders, name: "Orders" },
];

export const authRoutes = [
  { path: "/customer/login", element: CustomerLogin, name: "CustomerLogin" },
  { path: "/customer/signup", element: CustomerSignup, name: "CustomerSignup" },
  { path: "/admin/login", element: AdminLogin, name: "AdminLogin" },
];

export const customerRoutes = {
  layout: null, // CustomerLayout will be imported separately
  routes: [
    {
      path: "dashboard",
      element: CustomerDashboard,
      name: "CustomerDashboard",
    },
    { path: "profile", element: CustomerProfile, name: "CustomerProfile" },
    { path: "orders", element: CustomerOrders, name: "CustomerOrders" },
    {
      path: "orders/:id",
      element: CustomerOrderTracking,
      name: "CustomerOrderTracking",
    },
    {
      path: "/customer/orders/bill/:id",
      element: BillDetail,
      name: "BillDetail",
    },
  ],
};

export const adminRoutes = {
  layout: null, // AdminLayout will be imported separately
  routes: [
    { path: "dashboard", element: AdminDashboard, name: "AdminDashboard" },
    { path: "articles", element: AdminArticles, name: "AdminArticles" },
    { path: "orders", element: AdminOrders, name: "AdminOrders" },
    { path: "settings", element: AdminSettings, name: "AdminSettings" },
  ],
};

export const ROUTES = {
  HOME: "/",
  PRODUCT_DETAIL: "/product/:id",
  CATALOGUE: "/catalogue",
  ABOUT: "/about",
  CONTACT: "/contact",
  PRIVACY: "/privacy",
  TERMS: "/terms",
  PAYMENT_METHODS: "/payment-methods",
  CHECKOUT: "/checkout",
  CART: "/cart",
  ORDER_CONFIRMATION: "/order-confirmation",
  ORDERS: "/orders",

  CUSTOMER_LOGIN: "/customer/login",
  CUSTOMER_SIGNUP: "/customer/signup",
  CUSTOMER_DASHBOARD: "/customer/dashboard",
  CUSTOMER_PROFILE: "/customer/profile",
  CUSTOMER_ORDERS: "/customer/orders",
  CUSTOMER_ORDER_TRACKING: "/customer/orders/:id",
  CUSTOMER_BILL: "/customer/orders/bill/:id",

  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_ARTICLES: "/admin/articles",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_SETTINGS: "/admin/settings",
} as const;
