import React from "react";

/**
 * Reusable select input component
 */
export function FormSelect({
  label,
  id,
  name,
  options = [],
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder = "Select an option",
  disabled = false,
  helperText,
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id || name} className="text-sm font-medium text-gray-700 md:text-base lg:text-lg">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={id || name}
        name={name}
        value={value || ""}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`input-field text-base md:text-lg ${error ? "input-error" : ""}`}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value || option.id} value={option.value || option.id}>
            {option.label || option.name}
          </option>
        ))}
      </select>

      {error && (
        <div className="flex items-start gap-1.5">
          <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 text-sm md:text-base">{error}</p>
        </div>
      )}

      {helperText && !error && <p className="text-gray-400 text-xs md:text-sm">{helperText}</p>}
    </div>
  );
}
