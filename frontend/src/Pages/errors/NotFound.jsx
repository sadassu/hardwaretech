import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        Page Not Found
      </h2>
      <p className="text-gray-600 mb-6">
        The page you are looking for does not exist.
      </p>
      <Link to="/" className="text-blue-600 hover:underline font-medium">
        Go to Home
      </Link>
    </div>
  );
}

export default NotFound;
