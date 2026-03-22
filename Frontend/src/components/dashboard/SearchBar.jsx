import React from "react";
import { useDebounce } from "../../hooks/useDebounce.js";

/**
 * Search bar component with debounced search
 */
export function SearchBar({ value, onChange, placeholder = "Search reminders...", resultCount }) {
  const debouncedValue = useDebounce(value, 300);

  React.useEffect(() => {
    if (onChange) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        <input
          type="text"
          value={value}
          onChange={(e) => {
            // For immediate visual feedback
          }}
          onInput={(e) => {
            // Update parent state immediately for visual feedback
            const inputElement = e.target;
            // This triggers onChange through event bubble
            const event = new Event("change", { bubbles: true });
            Object.defineProperty(event, "target", { value: inputElement, enumerable: true });
            inputElement.dispatchEvent(event);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent"
        />

        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.target.closest("input")?.previousElementSibling?.click?.();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {resultCount !== undefined && (
        <p className="text-xs text-gray-500 mt-1">
          {resultCount === 0 ? "No results found" : `${resultCount} result${resultCount !== 1 ? "s" : ""}`}
        </p>
      )}
    </div>
  );
}
