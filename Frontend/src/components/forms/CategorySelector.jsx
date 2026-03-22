import React, { useState } from "react";
import { PREDEFINED_CATEGORIES } from "../../utils/constants.js";
import { FormInput } from "../common/FormInput.jsx";

/**
 * Category selector component with custom category support
 */
export function CategorySelector({
  value,
  onChange,
  error,
  onBlur,
  required = false,
  customValue = "",
  onCustomChange,
}) {
  const [showCustom, setShowCustom] = useState(false);

  const handleCategoryChange = (categoryId) => {
    onChange({ target: { value: categoryId } });
    setShowCustom(false);
    if (onCustomChange) {
      onCustomChange("");
    }
  };

  const handleCustomChange = (e) => {
    if (onCustomChange) {
      onCustomChange(e.target.value);
    }
  };

  const selectedCategory = PREDEFINED_CATEGORIES.find((cat) => cat.id === value);

  return (
    <div className="w-full">
      <label className="text-sm font-medium text-gray-700 md:text-base lg:text-lg mb-2 block">
        Category
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {/* Predefined Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        {PREDEFINED_CATEGORIES.filter((cat) => cat.id !== "all").map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleCategoryChange(category.id)}
            onBlur={onBlur}
            className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
              value === category.id
                ? "border-navy-900 bg-navy-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={category.icon} />
            </svg>
            <span className="text-sm font-medium text-gray-700">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Custom Category Toggle */}
      <button
        type="button"
        onClick={() => setShowCustom(!showCustom)}
        className="text-navy-900 text-sm font-medium hover:underline mb-3"
      >
        {showCustom ? "Hide" : "Add custom category"}
      </button>

      {/* Custom Category Input */}
      {showCustom && (
        <FormInput
          label="Custom Category Name"
          id="custom-category"
          placeholder="e.g., Home Maintenance"
          value={customValue || ""}
          onChangeValue={handleCustomChange}
          maxLength={50}
          helperText="Create a custom category for this reminder"
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-1.5 mt-3">
          <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 text-sm md:text-base">{error}</p>
        </div>
      )}

      {/* Selected Category Display */}
      {value && !showCustom && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            Selected:{" "}
            <span className="font-semibold capitalize">
              {customValue || (selectedCategory ? selectedCategory.label : "Custom")}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
