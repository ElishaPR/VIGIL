import React from "react";

export function AuthHeader({ title, subtitle }) {
  return (
    <div className="text-center space-y-2">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <img src="/vigil-logo.svg" alt="Vigil" className="h-12 w-12" />
        <h1 className="text-3xl font-bold text-gradient">VIGIL</h1>
      </div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </div>
  );
}
