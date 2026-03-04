import React from "react";
import { Link, useNavigate } from "react-router-dom";

export function Navbar({ isAuthenticated = false }) {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/vigil-logo.svg" alt="Vigil" className="h-10 w-10" />
            <span className="text-2xl font-bold text-gradient">VIGIL</span>
          </Link>

          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
