import React from "react";

export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-5xl">
        {children}
      </div>
    </div>
  );
}
