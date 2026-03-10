import React from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../components/Auth/PrimaryButton";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="text-6xl font-bold text-navy-900 mb-2">404</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-lg text-gray-600">The page you're looking for doesn't exist or has been moved.</p>
        </div>

        <div className="mt-8">
          <svg className="w-32 h-32 mx-auto mb-6 text-navy-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <PrimaryButton
            text="Go to Dashboard"
            onClick={() => navigate("/dashboard")}
            variant="primary"
            fullWidth
          />
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-white text-navy-900 border-2 border-navy-900 rounded-lg font-semibold text-sm hover:bg-navy-50 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
