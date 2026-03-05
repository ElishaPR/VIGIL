import React from "react";

export function AuthCard({ children, wide = false }) {
  return (
    <div
      className={`w-full ${
        wide ? "max-w-5xl" : "max-w-md"
      } bg-white rounded-2xl shadow-2xl overflow-hidden`}
    >
      {children}
    </div>
  );
}