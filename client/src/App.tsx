import { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { ScrollToTop } from "./components/ScrollToTop";
import { ProtectedAdminRoute } from "./components/RouteGuard/ProtectedAdminRoute";
import { ProtectedCustomerRoute } from "./components/RouteGuard/ProtectedCustomerRoute";
import { LoadingSpinner } from "./components/RouteGuard/LoadingSpinner";
import { AdminLayout } from "@/components/Layout/AdminLayout";
import { CustomerLayout } from "@/components/Layout/CustomerLayout";
import {
  publicRoutes,
  authRoutes,
  customerRoutes,
  adminRoutes,
  ROUTES,
} from "@/config/routes";

function App() {
  const renderRouteElement = (Component: React.ComponentType<any>) => (
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  );

  return (
    <ToastProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public Routes */}
              {publicRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={renderRouteElement(route.element)}
                />
              ))}

              {/* Auth Routes */}
              {authRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={renderRouteElement(route.element)}
                />
              ))}

              {/* Customer Protected Routes */}
              <Route
                path="/customer"
                element={
                  <ProtectedCustomerRoute>
                    <CustomerLayout />
                  </ProtectedCustomerRoute>
                }
              >
                {customerRoutes.routes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={renderRouteElement(route.element)}
                  />
                ))}
              </Route>

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminLayout />
                  </ProtectedAdminRoute>
                }
              >
                <Route
                  index
                  element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />}
                />
                {adminRoutes.routes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={renderRouteElement(route.element)}
                  />
                ))}
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </CartProvider>
    </ToastProvider>
  );
}

export default App;
