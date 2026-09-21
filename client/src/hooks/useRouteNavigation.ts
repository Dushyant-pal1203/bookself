import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";

export const useRouteNavigation = () => {
  const navigate = useNavigate();

  return {
    navigateToHome: () => navigate(ROUTES.HOME),
    navigateToProduct: (id: string | number) => navigate(`/product/${id}`),
    navigateToCatalogue: () => navigate(ROUTES.CATALOGUE),
    navigateToCart: () => navigate(ROUTES.CART),
    navigateToCheckout: () => navigate(ROUTES.CHECKOUT),
    navigateToOrders: () => navigate(ROUTES.ORDERS),
    navigateToCustomerLogin: () => navigate(ROUTES.CUSTOMER_LOGIN),
    navigateToCustomerSignup: () => navigate(ROUTES.CUSTOMER_SIGNUP),
    navigateToCustomerDashboard: () => navigate(ROUTES.CUSTOMER_DASHBOARD),
    navigateToCustomerOrders: () => navigate(ROUTES.CUSTOMER_ORDERS),
    navigateToCustomerProfile: () => navigate(ROUTES.CUSTOMER_PROFILE),
    navigateToAdminLogin: () => navigate(ROUTES.ADMIN_LOGIN),
    navigateToAdminDashboard: () => navigate(ROUTES.ADMIN_DASHBOARD),
    navigate: (path: string) => navigate(path),
  };
};
