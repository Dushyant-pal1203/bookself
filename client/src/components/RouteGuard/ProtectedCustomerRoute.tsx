import { Navigate } from "react-router-dom";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { LoadingSpinner } from "@/components/UI/LoadingSpinner";
import { ROUTES } from "@/config/routes";

interface ProtectedCustomerRouteProps {
  children: React.ReactNode;
}

export const ProtectedCustomerRoute = ({
  children,
}: ProtectedCustomerRouteProps) => {
  const { user, loading } = useCustomerAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to={ROUTES.CUSTOMER_LOGIN} replace />;
  }

  return <>{children}</>;
};
