import React, { lazy, Suspense, useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";
import { useLiveUpdates } from "./hooks/useLiveUpdates";

import HomePage from "./Pages/HomePage";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import LoginSuccess from "./Pages/LoginSuccess";

import RoleRoute from "./routes/RoleRoute";
import Unauthorized from "./Pages/errors/Unanthorized";
import NotFound from "./Pages/errors/NotFound";

import ProductList from "./Pages/UserPages/ProductList";
import UserReservations from "./Pages/UserPages/UserReservations";
import Profile from "./Pages/UserPages/Profile";
import SettingList from "./Pages/Settings/SettingList";
import Dashboard from "./Pages/Dashboard/Dashboard";
import EditUserData from "./Pages/Auth/EditUserData";
import SupplyHistories from "./Pages/SupplyHistories/SupplyHistories";
import CategoryList from "./Pages/Settings/CategoryList";
import Verification from "./Pages/Verification";
import ProtectedRoute from "./routes/ProtectedRoutes";
import VerificationUrl from "./Pages/verificationUrl";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import ResetPassword from "./Pages/Auth/PasswordReset";

const Product = lazy(() => import("./Pages/Products/Product"));
const Sales = lazy(() => import("./Pages/Sales/Sales"));
const Pos = lazy(() => import("./Pages/Pos/Pos"));
const Reservation = lazy(() => import("./Pages/Reservations/Reservation"));

const App = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  useLiveUpdates();

  useEffect(() => {
    // Only redirect regular users (not admin/cashier) who are not verified
    const isAdminOrCashier = user?.roles?.includes("admin") || user?.roles?.includes("cashier");
    
    if (
      user &&
      user.isVerified === false &&
      !isAdminOrCashier && // Don't redirect admin/cashier users
      location.pathname !== "/verification" &&
      location.pathname !== "/logout" &&
      location.pathname !== "/login/success" && // Don't redirect during Google OAuth callback
      location.pathname !== "/dashboard" && // Don't redirect admin users away from dashboard
      location.pathname !== "/pos" // Don't redirect cashier users away from POS
    ) {
      navigate("/verification", { replace: true });
    }
  }, [user, location, navigate]);

  return (
    <div>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/verification" element={<Verification />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/verify-account" element={<VerificationUrl />} />
          <Route
            path="/"
            element={
              !user ? (
                <HomePage />
              ) : user.roles?.includes("admin") ? (
                <Navigate to="/dashboard" replace />
              ) : user.roles?.includes("cashier") ? (
                <Navigate to="/pos" replace />
              ) : (
                <HomePage />
              )
            }
          />

          <Route
            path="/login"
            element={
              !user ? (
                <Login />
              ) : user.roles?.includes("admin") ? (
                <Navigate to="/dashboard" replace />
              ) : user.roles?.includes("cashier") ? (
                <Navigate to="/pos" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/forgot-password"
            element={
              !user ? (
                <ForgotPassword />
              ) : user.roles?.includes("admin") ? (
                <Navigate to="/dashboard" replace />
              ) : user.roles?.includes("cashier") ? (
                <Navigate to="/pos" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              !user ? (
                <ResetPassword />
              ) : user.roles?.includes("admin") ? (
                <Navigate to="/dashboard" replace />
              ) : user.roles?.includes("cashier") ? (
                <Navigate to="/pos" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/register"
            element={
              !user ? (
                <Register />
              ) : user.roles?.includes("admin") ? (
                <Navigate to="/dashboard" replace />
              ) : user.roles?.includes("cashier") ? (
                <Navigate to="/pos" replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="/login/success" element={<LoginSuccess />} />
          <Route path="/user/product-list" element={<ProductList />} />
          <Route
            path="/reservations/user/:userId"
            element={
              <ProtectedRoute requireVerification={true}>
                <UserReservations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute requireVerification={true}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route element={<AdminLayout />}>
          <Route
            path="/products"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <RoleRoute allowedRoles={["admin"]}>
                  <Product />
                </RoleRoute>
              </Suspense>
            }
          />
          <Route
            path="/reservations"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <RoleRoute allowedRoles={["admin", "cashier"]}>
                  <Reservation />
                </RoleRoute>
              </Suspense>
            }
          />
          <Route
            path="/pos"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <RoleRoute allowedRoles={["admin", "cashier"]}>
                  <Pos />
                </RoleRoute>
              </Suspense>
            }
          />
          <Route
            path="/sales"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <RoleRoute allowedRoles={["admin", "cashier"]}>
                  <Sales />
                </RoleRoute>
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <RoleRoute allowedRoles={["admin"]}>
                  <SettingList />
                </RoleRoute>
              </Suspense>
            }
          />
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <RoleRoute allowedRoles={["admin"]}>
                  <Dashboard />
                </RoleRoute>
              </Suspense>
            }
          />
          <Route
            path="/user/edit"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <RoleRoute allowedRoles={["admin"]}>
                  <EditUserData />
                </RoleRoute>
              </Suspense>
            }
          />
          <Route
            path="/supply-histories"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <RoleRoute allowedRoles={["admin"]}>
                  <SupplyHistories />
                </RoleRoute>
              </Suspense>
            }
          />
          <Route
            path="/categories"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <RoleRoute allowedRoles={["admin"]}>
                  <CategoryList />
                </RoleRoute>
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
