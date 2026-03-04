import React from "react";

export function FormInput({
  label,
  id,
  type = "text",
  placeholder,
  helperText,
  error,
  value,
  onChangeValue,
  onBlur,
  required = false,
}) {
  return (
    <div className="flex flex-col space-y-2 w-full">
      <label htmlFor={id} className="text-gray-700 text-sm font-semibold">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        className={`input-primary ${error ? "error" : ""}`}
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        onBlur={onBlur}
        required={required}
      />
      {error && <p className="text-error text-sm">{error}</p>}
      {helperText && !error && (
        <p className="text-gray-500 text-sm">{helperText}</p>
      )}
    </div>
  );
}