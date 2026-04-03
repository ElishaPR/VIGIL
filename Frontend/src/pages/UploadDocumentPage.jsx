import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const CATEGORY_OPTIONS = [
  { id: "travel", label: "Travel", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0110.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "medical", label: "Medical", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { id: "vehicle", label: "Vehicle", icon: "M8 17h8M8 17v4h8v-4M8 17H6a2 2 0 01-2-2V9a2 2 0 012-2h1l1.5-3h7L17 7h1a2 2 0 012 2v6a2 2 0 01-2 2h-2M7 13h.01M17 13h.01" },
  { id: "bills", label: "Bills & Subscriptions", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
  { id: "housing", label: "Housing & Property", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "insurance", label: "Insurance", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
];

const MAX_FILE_SIZE_MB = 10;

export function UploadDocumentPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Form state
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [notes, setNotes] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const updateError = (field, value) => {
    setErrors((prev) => ({ ...prev, [field]: value }));
  };

  const clearError = (field) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!allowedTypes.includes(file.type)) {
        updateError("file", "Unsupported file type. Please upload an image, PDF, or document.");
        return;
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        updateError("file", `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
        return;
      }

      setUploadedFile(file);
      clearError("file");

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = () => {
    const newErrors = {};

    const finalCategory = isCustomCategory ? customCategory.trim() : docCategory;
    if (!finalCategory) {
      newErrors.category = "Document category is required.";
    } else if (finalCategory.length > 25) {
      newErrors.category = "Category must be 25 characters or less.";
    }

    if (!docTitle.trim()) {
      newErrors.title = "Document title is required.";
    } else if (docTitle.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters.";
    } else if (docTitle.trim().length > 100) {
      newErrors.title = "Title must be 100 characters or less.";
    }

    if (!uploadedFile) {
      newErrors.file = "Please upload a document.";
    }

    if (notes.trim().length > 500) {
      newErrors.notes = "Notes must be 500 characters or less.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      updateError("api", "Please fill in all required fields correctly.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    clearError("api");
    setSuccessMessage("");

    try {
      const formData = new FormData();
      const finalCategory = isCustomCategory ? customCategory.trim() : docCategory;

      formData.append("category", finalCategory);
      formData.append("title", docTitle.trim());

      if (notes.trim()) {
        formData.append("notes", notes.trim());
      }

      if (uploadedFile) {
        formData.append("file", uploadedFile);
        console.log("Uploading file:", uploadedFile.name, "size:", uploadedFile.size, "type:", uploadedFile.type);
      } else {
        console.warn("No file selected for upload");
      }

      console.log("Sending upload request to /documents/upload");

      const response = await fetch("http://localhost:8000/documents/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      console.log("Upload response status:", response.status);

      const result = await response.json();
      console.log("Upload response:", result);

      if (response.ok) {
        setSuccessMessage("Document uploaded successfully!");
        setTimeout(() => {
          setLoading(true);
          navigate("/dashboard");
        }, 1500);
      } else {
        console.error("Upload failed:", result);
        updateError("api", result.detail || result.message || "Failed to upload document.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      updateError("api", "Server not connected. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDocCategory("");
    setCustomCategory("");
    setIsCustomCategory(false);
    setDocTitle("");
    setNotes("");
    removeFile();
    setErrors({});
    setSuccessMessage("");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Page Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full border-4 border-navy-200 border-t-navy-600 animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 font-semibold">Uploading document...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => {
                setLoading(true);
                navigate("/dashboard");
              }}
              disabled={loading}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Upload Document</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errors.api && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{errors.api}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Document Category Section */}
          <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Document Category
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {CATEGORY_OPTIONS.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setDocCategory(category.id);
                    setIsCustomCategory(false);
                    clearError("category");
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    docCategory === category.id && !isCustomCategory
                      ? "border-navy-500 bg-navy-50 text-navy-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={category.icon} />
                  </svg>
                  <span className="text-sm font-medium text-center">{category.label}</span>
                </button>
              ))}

              {/* Custom Category Button */}
              <button
                type="button"
                onClick={() => {
                  setIsCustomCategory(true);
                  setDocCategory("");
                  clearError("category");
                }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  isCustomCategory
                    ? "border-navy-500 bg-navy-50 text-navy-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">Custom</span>
              </button>
            </div>

            {/* Custom Category Input */}
            {isCustomCategory && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter Custom Category</label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                    if (e.target.value.trim() && e.target.value.trim().length <= 25) clearError("category");
                  }}
                  placeholder="e.g., Personal Files"
                  maxLength="25"
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none ${errors.category ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-navy-500"}`}
                />
                {errors.category && <p className="text-red-600 text-sm mt-2">{errors.category}</p>}
              </div>
            )}
          </section>

          {/* Document Title */}
          <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <label htmlFor="docTitle" className="block text-lg font-semibold text-gray-900 mb-3">
              Document Title
            </label>
            <input
              type="text"
              id="docTitle"
              placeholder="e.g., Passport Scan"
              value={docTitle}
              onChange={(e) => {
                setDocTitle(e.target.value);
                if (errors.title) clearError("title");
              }}
              maxLength="100"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none ${errors.title ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-navy-500"}`}
            />
            {errors.title && <p className="text-red-600 text-sm mt-2">{errors.title}</p>}
          </section>

          {/* File Upload */}
          <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h2>

            {uploadedFile ? (
              <div className="space-y-4">
                {filePreview && (
                  <div className="relative inline-block w-full">
                    <img src={filePreview} alt="Preview" className="max-w-full h-auto rounded-lg" />
                  </div>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-blue-700 font-medium">{uploadedFile.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-navy-500 hover:bg-navy-50 transition-colors"
              >
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h3 className="text-gray-900 font-semibold mb-1">Click to upload or drag and drop</h3>
                <p className="text-sm text-gray-500">PNG, JPG, PDF, DOC up to 10MB</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx"
            />

            {errors.file && <p className="text-red-600 text-sm mt-3">{errors.file}</p>}
          </section>

          {/* Notes */}
          <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <label htmlFor="notes" className="block text-lg font-semibold text-gray-900 mb-3">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              placeholder="Add any additional information about this document..."
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (errors.notes) clearError("notes");
              }}
              maxLength="500"
              rows="4"
              className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none resize-none ${errors.notes ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-navy-500"}`}
            />
            <p className="text-xs text-gray-500 mt-2">{notes.length}/500</p>
            {errors.notes && <p className="text-red-600 text-sm mt-2">{errors.notes}</p>}
          </section>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-navy-900 text-white rounded-xl font-semibold hover:bg-navy-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Uploading..." : "Upload Document"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-white text-navy-900 border-2 border-navy-900 rounded-xl font-semibold hover:bg-navy-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
