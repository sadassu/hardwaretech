import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./Pages/HomePage";
import Product from "./Pages/Products/Product";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import { useAuthContext } from "./hooks/useAuthContext";
import Reservation from "./Pages/Reservations/Reservation";
import LoginSuccess from "./Pages/LoginSuccess";
import RoleRoute from "./routes/RoleRoute";
import Unauthorized from "./Pages/errors/Unanthorized";
import ProductList from "./Pages/UserPages/ProductList";
import UserReservations from "./Pages/UserPages/UserReservations";
import Profile from "./Pages/UserPages/Profile";
import Pos from "./Pages/Pos/Pos";

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
        </Route>
        <Route element={<AdminLayout />}>
          <Route
            path="/products"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <Product />
              </RoleRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <Reservation />
              </RoleRoute>
            }
          />
          <Route
            path="/pos"
            element={
              <RoleRoute allowedRoles={["admin"]}>
                <Pos />
              </RoleRoute>
            }
          />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
