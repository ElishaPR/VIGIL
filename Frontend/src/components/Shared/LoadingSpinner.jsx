import React from "react";

export function LoadingSpinner({ size = "md", text = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <div
        className={`${sizeClasses[size]} border-gray-200 border-t-navy-700 rounded-full animate-spin`}
      ></div>
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  );
}
