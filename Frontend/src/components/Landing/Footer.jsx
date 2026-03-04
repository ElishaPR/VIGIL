import React from "react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-12">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/vigil-logo.svg" alt="Vigil" className="h-8 w-8" />
              <span className="text-lg font-bold text-white tracking-tight">VIGIL</span>
            </div>
            <p className="text-sm leading-relaxed">
              A simple tool to help you stay on top of your document expiry dates.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Product</h4>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <a href="#features" className="text-sm hover:text-white transition-colors">Features</a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-sm hover:text-white transition-colors">How It Works</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Account</h4>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <Link to="/signup" className="text-sm hover:text-white transition-colors">Sign Up</Link>
                </li>
                <li>
                  <Link to="/login" className="text-sm hover:text-white transition-colors">Log in</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Legal</h4>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <Link to="/terms" className="text-sm hover:text-white transition-colors">Terms & Conditions</Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-sm hover:text-white transition-colors">Privacy Policy</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <p className="text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Vigil. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
