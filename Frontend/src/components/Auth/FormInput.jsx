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
  maxLength,
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        className={`input-field ${error ? "input-error" : ""}`}
        value={value}
        onChange={(e) => onChangeValue(e.target.value)}
        onBlur={onBlur}
        required={required}
        maxLength={maxLength}
        autoComplete={type === "password" ? "new-password" : "off"}
      />
      {error && (
        <div className="flex items-start gap-1.5">
          <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      {helperText && !error && (
        <p className="text-gray-400 text-xs">{helperText}</p>
      )}
    </div>
  );
}
