import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthContext } from "./hooks/useAuthContext";

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

const Product = lazy(() => import("./Pages/Products/Product"));
const Sales = lazy(() => import("./Pages/Sales/Sales"));
const Pos = lazy(() => import("./Pages/Pos/Pos"));
const Reservation = lazy(() => import("./Pages/Reservations/Reservation"));

const App = () => {
  const { user } = useAuthContext();
  return (
    <div>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/" />}
          />
          <Route path="/login/success" element={<LoginSuccess />} />
          <Route path="/user/product-list" element={<ProductList />} />
          <Route
            path="/reservations/user/:userId"
            element={user ? <UserReservations /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile/:userId"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route element={<AdminLayout />}>
          <Route
            path="/products"
            element={
              <Suspense fallback={<div>Loading...</div>}>
                <RoleRoute allowedRoles={["admin", "cashier"]}>
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
                <RoleRoute allowedRoles={["admin", "cashier"]}>
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
