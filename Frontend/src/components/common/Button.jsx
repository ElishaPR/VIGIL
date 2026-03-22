import React from "react";

/**
 * Reusable button component with multiple variants
 */
export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon: Icon = null,
  iconPosition = "left",
  type = "button",
  onClick,
  className = "",
  ...props
}) {
  const variants = {
    primary: "bg-navy-900 text-white hover:bg-navy-800 disabled:bg-gray-300",
    secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 disabled:opacity-50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const baseClasses = `
    inline-flex items-center justify-center gap-2 rounded-lg
    font-medium transition-colors duration-200
    disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-900
  `;

  const buttonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonClasses}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      )}
      {Icon && iconPosition === "left" && !loading && <Icon size={20} />}
      <span>{children}</span>
      {Icon && iconPosition === "right" && !loading && <Icon size={20} />}
    </button>
  );
}
