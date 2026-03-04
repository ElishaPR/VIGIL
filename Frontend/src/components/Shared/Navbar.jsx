import React, { useState } from "react";
import { Link } from "react-router-dom";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/vigil-logo.svg" alt="Vigil" className="h-9 w-9" />
            <span className="text-xl font-bold text-navy-900 tracking-tight">VIGIL</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            <a
              href="#features"
              className="text-gray-600 hover:text-navy-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-600 hover:text-navy-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              How It Works
            </a>
            <div className="w-px h-6 bg-gray-200 mx-2" aria-hidden="true"></div>
            <Link
              to="/login"
              className="text-gray-700 hover:text-navy-900 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="btn-primary text-sm px-5 py-2.5 rounded-lg"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 flex flex-col gap-1">
            <a
              href="#features"
              onClick={() => setMobileOpen(false)}
              className="text-gray-600 hover:text-navy-900 font-medium px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="text-gray-600 hover:text-navy-900 font-medium px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              How It Works
            </a>
            <hr className="my-2 border-gray-100" />
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="text-gray-700 hover:text-navy-900 font-medium px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              onClick={() => setMobileOpen(false)}
              className="btn-primary text-center text-sm px-5 py-3 rounded-lg mt-1"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
