import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { STATUS_CONFIG, PREDEFINED_CATEGORIES } from "../../utils/constants.js";
import { formatDate, daysUntil, getStatus } from "../../utils/date-utils.js";

/**
 * Document card component for dashboard display
 */
export function DocumentCard({ document, onEdit, onDelete, onDownload, showMenuButton = true }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  // Determine status based on expiry date
  const documentStatus = document.expiry_date ? getStatus(document.expiry_date) : "active";
  const status = STATUS_CONFIG[documentStatus] || STATUS_CONFIG.active;
  const daysLeft = document.expiry_date ? daysUntil(document.expiry_date) : null;

  const handleEdit = () => {
    setShowMenu(false);
    navigate(`/document/${document.doc_uuid}`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      setShowMenu(false);
      if (onDelete) {
        onDelete(document.doc_uuid);
      }
    }
  };

  const handleDownload = () => {
    setShowMenu(false);
    if (onDownload) {
      onDownload(document.doc_uuid);
    }
  };

  // Get file icon based on mime type
  const getFileIcon = () => {
    const mimeType = document.mime_type || "";
    if (mimeType.startsWith("image/")) {
      return (
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    }
    if (mimeType === "application/pdf") {
      return (
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  return (
    <div className={`p-4 rounded-xl border ${status.border} ${status.bg} transition-all hover:shadow-md`}>
      <div className="flex items-start gap-3">
        {/* Status Indicator */}
        <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${status.dot}`}></div>

        <div className="flex-1 min-w-0">
          {/* Title & File Type */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="flex-shrink-0">{getFileIcon()}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 break-words">{document.doc_title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {document.mime_type?.split("/")[1]?.toUpperCase() || "Document"}
                </p>
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
                        onClick={handleDownload}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </button>
                      <button
                        onClick={handleEdit}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
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

          {/* Category Badge */}
          {document.doc_category && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-600 font-medium bg-white bg-opacity-60 px-2 py-1 rounded capitalize">
                {document.doc_category.replace(/_/g, " ")}
              </span>
            </div>
          )}

          {/* Date & Status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-gray-600 flex-wrap">
              {document.expiry_date ? (
                <>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">{formatDate(document.expiry_date, "short")}</span>
                  {daysLeft !== null && (
                    <span className="text-xs text-gray-500">
                      ({daysLeft < 0 ? "Expired" : `${daysLeft} days left`})
                    </span>
                  )}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-500">Uploaded {formatDate(document.upload_date, "short")}</span>
                </>
              )}
            </div>

            {document.expiry_date && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.text} bg-white bg-opacity-60 border ${status.border} flex-shrink-0`}>
                {status.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
