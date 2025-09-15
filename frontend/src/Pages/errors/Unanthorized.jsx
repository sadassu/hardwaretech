import React from "react";
import { Link } from "react-router";

function Unauthorized() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-error"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-base-content mb-2">401</h1>

          {/* Subtitle */}
          <h2 className="text-xl font-semibold text-base-content mb-4">
            Unauthorized Access
          </h2>

          {/* Description */}
          <p className="text-base-content/70 mb-6">
            You don't have permission to access this resource. Please contact
            your administrator or try logging in again.
          </p>

          {/* Alert */}
          <div className="alert alert-error mb-6">
            <svg
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Access denied. Please verify your credentials.</span>
          </div>

          {/* Action buttons */}
          <div className="card-actions justify-center gap-3">
            <Link className="btn btn-ghost" to="/">
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
