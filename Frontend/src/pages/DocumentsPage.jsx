import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DocumentPreview from "../components/DocumentPreview";

const CATEGORY_OPTIONS = [
  { id: "travel", label: "Travel" },
  { id: "medical", label: "Medical" },
  { id: "vehicle", label: "Vehicle" },
  { id: "bills", label: "Bills & Subscriptions" },
  { id: "housing", label: "Housing & Property" },
  { id: "insurance", label: "Insurance" },
];

export function DocumentsPage() {
  const navigate = useNavigate();
  
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/documents/list", {
          credentials: "include"
        });

        if (response.ok) {
          const data = await response.json();
          setDocuments(data);
        } else if (response.status === 401) {
          setError("Authentication required. Please login again.");
        } else {
          setError("Failed to load documents.");
        }
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const handleDeleteDocument = async (docUuid) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/documents/${docUuid}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (response.ok) {
        // Remove document from list
        setDocuments(documents.filter(doc => doc.doc_uuid !== docUuid));
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to delete document.");
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      setError("Network error. Please try again.");
    }
  };

  const getCategoryLabel = (categoryId) => {
    const category = CATEGORY_OPTIONS.find(c => c.id === categoryId);
    return category ? category.label : categoryId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Documents</h1>
            <button
              onClick={() => navigate("/documents/upload")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Upload Document
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
            <p className="text-gray-500 mb-6">Upload your first document to get started</p>
            <button
              onClick={() => navigate("/documents/upload")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Upload Document
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <div key={doc.doc_uuid} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 truncate mb-1">{doc.doc_title}</h3>
                      <p className="text-sm text-gray-500">{getCategoryLabel(doc.doc_category)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/documents/${doc.doc_uuid}/edit`)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.doc_uuid)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <DocumentPreview 
                    documentUuid={doc.doc_uuid}
                    showExpiry={false}  // Never show expiry in document management context
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
