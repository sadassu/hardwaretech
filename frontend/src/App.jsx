import React from "react";
import { Route, Routes } from "react-router-dom";

import HomePage from "./Pages/HomePage";
import Product from "./Pages/Products/Product";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import Login from "./Pages/Auth/Login";
import GuestRoute from "./components/GuestRoutes";

const App = () => {
  return (
    <div>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            {/* <Route path="/register" element={<Register />} /> */}
          </Route>
        </Route>
        <Route element={<AdminLayout />}>
          <Route
            className="text-gray-500"
            path="/products"
            element={<Product />}
          />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
