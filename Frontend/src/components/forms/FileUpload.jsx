import React, { useState, useRef } from "react";
import { MAX_FILE_SIZE } from "../../utils/constants.js";

/**
 * File upload component with preview and drag-and-drop support
 */
export function FileUpload({
  onFileSelect,
  error,
  required = false,
  label = "Upload Document",
  accept = "image/*,.pdf,.doc,.docx,.xls,.xlsx",
  maxSize = MAX_FILE_SIZE,
  showPreview = true,
  file = null,
  onFileRemove,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    // Validate file size
    if (selectedFile.size > maxSize) {
      onFileSelect(null, `File size exceeds ${(maxSize / 1024 / 1024).toFixed(1)}MB limit`);
      return;
    }

    // Create preview
    if (showPreview && selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }

    onFileSelect(selectedFile, null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onFileRemove) {
      onFileRemove();
    }
  };

  const displayFile = file || (fileInputRef.current?.files?.[0] || null);

  return (
    <div className="w-full">
      {label && (
        <label className="text-sm font-medium text-gray-700 md:text-base lg:text-lg mb-3 block">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {!displayFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
            ${isDragging ? "border-navy-900 bg-navy-50" : "border-gray-300 bg-gray-50 hover:border-gray-400"}
            ${error ? "border-red-300 bg-red-50" : ""}
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-4m0 0V8m0 4h4m-4 0H8m4-12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium text-gray-700 mb-1">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-500">{accept}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <svg className="w-8 h-8 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{displayFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(displayFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700 flex-shrink-0"
              aria-label="Remove file"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {preview && (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-600 mb-2">Preview</p>
          <img src={preview} alt="Preview" className="max-h-32 rounded-lg border border-gray-300" />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-1.5 mt-3">
          <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 text-sm md:text-base">{error}</p>
        </div>
      )}
    </div>
  );
}
