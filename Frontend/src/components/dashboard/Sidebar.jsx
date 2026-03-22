import React from "react";
import { STATUS_FILTERS, PREDEFINED_CATEGORIES } from "../../utils/constants.js";

/**
 * Dashboard sidebar with status and category filters
 */
export function Sidebar({
  activeStatus,
  onStatusChange,
  activeCategory,
  onCategoryChange,
  customCategories = [],
  itemCounts = {},
}) {
  const allCategories = [...PREDEFINED_CATEGORIES.filter((c) => c.id !== "all"), ...customCategories.map((c) => ({ id: c, label: c, icon: null }))];

  return (
    <div className="w-full lg:w-64 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200">
      {/* Status Filter Section */}
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
        <div className="space-y-2">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status.id}
              onClick={() => onStatusChange(status.id)}
              className={`
                w-full text-left px-3 py-2 rounded-lg transition-colors
                ${
                  activeStatus === status.id
                    ? "bg-navy-900 text-white font-medium"
                    : "text-gray-700 hover:bg-gray-200"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{status.label}</span>
                {itemCounts[status.id] !== undefined && (
                  <span
                    className={`
                      text-xs px-2 py-0.5 rounded-full
                      ${
                        activeStatus === status.id
                          ? "bg-white text-navy-900"
                          : "bg-gray-300 text-gray-700"
                      }
                    `}
                  >
                    {itemCounts[status.id]}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Section */}
      {allCategories.length > 0 && (
        <div className="p-4 lg:p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategoryChange(activeCategory === category.id ? "all" : category.id)}
                className={`
                  w-full text-left px-3 py-2 rounded-lg transition-colors
                  ${
                    activeCategory === category.id
                      ? "bg-navy-900 text-white font-medium"
                      : "text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  {category.icon && (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={category.icon} />
                    </svg>
                  )}
                  <span className="text-sm truncate">{category.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
