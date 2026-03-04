import React from "react";
import { LoadingSpinner } from "../Shared/LoadingSpinner";

export function PrimaryButton({
  text,
  type = "button",
  onClick,
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = false,
}) {
  const styles = {
    primary: "btn-primary",
    danger: "bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all",
    secondary: "btn-secondary",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${styles[variant]} ${
        fullWidth ? "w-full" : ""
      } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" />
          <span>Loading...</span>
        </>
      ) : (
        <span>{text}</span>
      )}
    </button>
  );
}
