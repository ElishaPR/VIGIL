import React from "react";

/**
 * Confirmation modal component for delete and other confirmations
 */
export function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
  isLoading = false,
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onCancel}></div>

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-sm w-full">
          {/* Header */}
          <div className="border-b border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600">{message}</p>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 p-4 flex gap-3 justify-end">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2
                ${
                  isDestructive
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-navy-900 text-white hover:bg-navy-800"
                }
              `}
            >
              {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
