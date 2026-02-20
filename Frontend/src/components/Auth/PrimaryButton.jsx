import React from "react";

export function PrimaryButton({ text, type = "button", onClick, variant = "primary" }) {
  const styles = {
    primary: "bg-blue-600 hover:bg-blue-700",
    danger: "bg-red-600 hover:bg-red-700",
    secondary: "bg-gray-500 hover:bg-gray-600"
  }
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 text-white text-base font-medium rounded ${styles[variant]}`}
    >
      {text}
    </button>
  );
}
