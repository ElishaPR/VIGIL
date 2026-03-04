import React from "react";
import { LoadingSpinner } from "../Shared/LoadingSpinner";

export function PrimaryButton({
  text,
  type = "button",
  onClick,
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = true,
}) {
  const base = "flex items-center justify-center gap-2 font-semibold text-sm rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const styles = {
    primary: `${base} bg-navy-900 text-white hover:bg-navy-950 active:bg-navy-950 px-6 py-3 shadow-md hover:shadow-lg`,
    secondary: `${base} bg-white text-navy-900 border-2 border-navy-900 hover:bg-navy-50 px-6 py-3`,
    danger: `${base} bg-red-600 text-white hover:bg-red-700 px-6 py-3`,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${styles[variant]} ${fullWidth ? "w-full" : ""}`}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" />
          <span>Please wait...</span>
        </>
      ) : (
        <span>{text}</span>
      )}
    </button>
  );
}
