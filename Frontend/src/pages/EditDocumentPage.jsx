import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const CATEGORY_OPTIONS = [
  { id: "travel", label: "Travel" },
  { id: "medical", label: "Medical" },
  { id: "vehicle", label: "Vehicle" },
  { id: "bills", label: "Bills & Subscriptions" },
  { id: "housing", label: "Housing & Property" },
  { id: "insurance", label: "Insurance" },
];

export function EditDocumentPage() {
  const navigate = useNavigate();
  const { docUuid } = useParams();

  const [category, setCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [title, setTitle] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [existingFileName, setExistingFileName] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState("");

  const setError = (field, msg) => setErrors((p) => ({ ...p, [field]: msg }));
  const clearError = (field) => setErrors((p) => { const n = { ...p }; delete n[field]; return n; });

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/documents/${docUuid}`, { credentials: "include" });
        if (!res.ok) {
          if (res.status === 401) {
            setError("api", "Authentication required. Please login again.");
          } else if (res.status === 404) {
            setError("api", "Document not found.");
          } else {
            setError("api", `Failed to load document: ${res.status}`);
          }
          return;
        }
        const data = await res.json();
        console.log("Document data:", data); // Debug log
        
        setTitle(data.doc_title || "");
        const cat = (data.doc_category || "").toLowerCase();
        if (CATEGORY_OPTIONS.find((c) => c.id === cat)) {
          setCategory(cat);
        } else {
          setIsCustomCategory(true);
          setCustomCategory(cat);
        }
        
        // Handle virtual documents (no actual file)
        if (data.is_virtual) {
          console.log("Virtual document detected - no file exists");
          setExistingFileName(null);
        } else if (data.storage_key && !data.storage_key.startsWith("virtual/")) {
          // Extract file name from storage key
          const parts = data.storage_key.split("/");
          setExistingFileName(parts[parts.length - 1]);
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setError("api", "Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [docUuid]);

  const validateForm = () => {
    const newErrors = {};
    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) newErrors.category = "Category is required.";
    else if (finalCategory.length > 25) newErrors.category = "Category must be 25 characters or less.";

    if (!title.trim()) newErrors.title = "Title is required.";
    else if (title.trim().length < 3) newErrors.title = "Title must be at least 3 characters.";
    else if (title.trim().length > 100) newErrors.title = "Title must be 100 characters or less.";


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    clearError("api");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      const finalCategory = isCustomCategory ? customCategory.trim() : category;
      formData.append("category", finalCategory);
      formData.append("title", title.trim());
      if (uploadedFile) formData.append("file", uploadedFile);

      const res = await fetch(`http://localhost:8000/documents/${docUuid}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setSuccessMsg("Document updated successfully!");
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setError("api", result.detail || "Failed to update document.");
      }
    } catch {
      setError("api", "Server not connected. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-200 border-t-navy-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {saving && (
        <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full border-4 border-navy-200 border-t-navy-600 animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 font-semibold">Saving...</p>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Edit Document</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        {errors.api && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{errors.api}</div>}
        {successMsg && <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { setCategory(cat.id); setIsCustomCategory(false); clearError("category"); }}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${category === cat.id && !isCustomCategory ? "border-navy-500 bg-navy-50 text-navy-700" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}
                >
                  {cat.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setIsCustomCategory(true); setCategory(""); clearError("category"); }}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${isCustomCategory ? "border-navy-500 bg-navy-50 text-navy-700" : "border-gray-200 hover:border-gray-300 text-gray-600"}`}
              >
                Custom
              </button>
            </div>
            {isCustomCategory && (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => { setCustomCategory(e.target.value); clearError("category"); }}
                placeholder="Enter custom category"
                maxLength={50}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-navy-500 focus:outline-none"
              />
            )}
            {errors.category && <p className="text-red-600 text-sm mt-2">{errors.category}</p>}
          </section>

          {/* Details */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); clearError("title"); }}
                  placeholder="Document title"
                  maxLength={150}
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none ${errors.title ? "border-red-300 focus:border-red-500" : "border-gray-300 focus:border-navy-500"}`}
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
              </div>

            </div>
          </section>

          {/* File */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">File</h2>
            {existingFileName && !uploadedFile && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 mb-4">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-gray-700 flex-1 truncate">{existingFileName}</span>
                <span className="text-xs text-gray-500">Existing file</span>
              </div>
            )}
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-navy-400 transition-colors">
                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-600">
                  {uploadedFile ? uploadedFile.name : "Click to replace file (optional)"}
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, images, Word, Excel · max 10 MB</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  if (file.size > 10 * 1024 * 1024) { setError("file", "File size exceeds 10 MB."); return; }
                  setUploadedFile(file);
                  clearError("file");
                }}
              />
            </label>
            {errors.file && <p className="text-red-600 text-sm mt-2">{errors.file}</p>}
          </section>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="flex-1 px-6 py-3 bg-navy-900 text-white rounded-xl font-semibold hover:bg-navy-950 disabled:opacity-50">
              Save Changes
            </button>
            <button type="button" onClick={() => navigate("/dashboard")} className="flex-1 px-6 py-3 bg-white text-navy-900 border-2 border-navy-900 rounded-xl font-semibold hover:bg-navy-50">
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
