import React from "react";

/**
 * Loading state component with spinner and message
 */
export function LoadingState({ message = "Loading...", fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-navy-200 border-t-navy-900 rounded-full animate-spin"></div>
      <p className="text-gray-600 text-center">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="py-12 flex items-center justify-center">
      {content}
    </div>
  );
}

/**
 * Inline loading spinner (just the spinner)
 */
export function LoadingSpinner({ size = "md" }) {
  const sizeMap = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className={`${sizeMap[size]} border-navy-200 border-t-navy-900 rounded-full animate-spin`}></div>
  );
}

/**
 * Skeleton loader for content placeholders
 */
export function SkeletonLoader({ count = 3, variant = "card" }) {
  const variants = {
    card: "h-24 bg-gray-200 rounded-lg mb-4",
    text: "h-4 bg-gray-200 rounded mb-2",
    header: "h-8 bg-gray-200 rounded mb-4",
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${variants[variant]} animate-pulse`}></div>
      ))}
    </div>
  );
}
