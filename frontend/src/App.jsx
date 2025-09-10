import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./Pages/HomePage";
import Product from "./Pages/Products/Product";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import { useAuthContext } from "./hooks/useAuthContext";

const App = () => {
  const { user } = useAuthContext();
  return (
    <div>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to="/products" />}
          />
          <Route
            path="/register"
            element={!user ? <Register /> : <Navigate to="/products" />}
          />
        </Route>
        <Route element={<AdminLayout />}>
          <Route
            className="text-gray-500"
            path="/products"
            element={user ? <Product /> : <Navigate to="/login" />}
          />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
