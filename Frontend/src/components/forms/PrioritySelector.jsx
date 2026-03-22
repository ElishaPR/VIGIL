import React from "react";
import { PRIORITY_LEVELS } from "../../utils/constants.js";

/**
 * Priority selector component with visual indicators
 */
export function PrioritySelector({ value, onChange, onBlur, error, required = false }) {
  return (
    <div className="w-full">
      <label className="text-sm font-medium text-gray-700 md:text-base lg:text-lg mb-3 block">
        Priority
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      <div className="flex gap-3 mb-3">
        {PRIORITY_LEVELS.map((priority) => (
          <button
            key={priority.id}
            type="button"
            onClick={() => onChange({ target: { value: priority.id } })}
            onBlur={onBlur}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all flex-1 ${
              value === priority.id
                ? `border-navy-900 ${priority.bgColor} text-gray-900 font-semibold`
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            {/* Priority Flag Icon */}
            <svg className={`w-4 h-4 ${value === priority.id ? priority.color : "text-gray-400"}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className="text-sm md:text-base">{priority.label}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-1.5">
          <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 text-sm md:text-base">{error}</p>
        </div>
      )}
    </div>
  );
}
