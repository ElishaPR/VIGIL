import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { STATUS_CONFIG, PRIORITY_LEVELS, PREDEFINED_CATEGORIES } from "../../utils/constants.js";
import { formatDate, getRelativeTime, daysUntil } from "../../utils/date-utils.js";

/**
 * Reminder card component for dashboard display
 */
export function ReminderCard({ reminder, onEdit, onDelete, showMenuButton = true }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const status = STATUS_CONFIG[reminder.status] || STATUS_CONFIG.active;
  const priority = PRIORITY_LEVELS.find((p) => p.id === reminder.priority) || PRIORITY_LEVELS[1];
  const categoryInfo = PREDEFINED_CATEGORIES.find((c) => c.id === reminder.category);

  const handleEdit = () => {
    setShowMenu(false);
    navigate(`/reminder/${reminder.reminder_uuid}`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this reminder? This action cannot be undone.")) {
      setShowMenu(false);
      if (onDelete) {
        onDelete(reminder.reminder_uuid);
      }
    }
  };

  const daysLeft = daysUntil(reminder.expiryDate);

  return (
    <div className={`p-4 rounded-xl border ${status.border} ${status.bg} transition-all hover:shadow-md`}>
      <div className="flex items-start gap-3">
        {/* Status Indicator */}
        <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${status.dot}`}></div>

        <div className="flex-1 min-w-0">
          {/* Title & Category */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 break-words">{reminder.title}</h3>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {categoryInfo && (
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={categoryInfo.icon} />
                  </svg>
                )}
                <span className="text-xs text-gray-600 font-medium capitalize bg-white bg-opacity-60 px-2 py-1 rounded">
                  {reminder.category?.replace(/_/g, " ") || "Other"}
                </span>
              </div>
            </div>

            {/* Menu Button */}
            {showMenuButton && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors flex-shrink-0"
                  aria-label="More options"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)}></div>
                    <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 w-40 z-40 overflow-hidden">
                      <button
                        onClick={handleEdit}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left border-t border-gray-100"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Priority Flag */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${priority.bgColor} w-fit mb-3`}>
            <svg className={`w-3.5 h-3.5 ${priority.color}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className={`text-xs font-semibold ${priority.color}`}>{priority.label}</span>
          </div>

          {/* Date & Status with relative time */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-gray-600">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div>
                <span className="text-sm font-medium">{formatDate(reminder.expiryDate, "short")}</span>
                {daysLeft !== null && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({getRelativeTime(reminder.expiryDate)})
                  </span>
                )}
              </div>
            </div>

            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.text} bg-white bg-opacity-60 border ${status.border} flex-shrink-0`}>
              {status.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
