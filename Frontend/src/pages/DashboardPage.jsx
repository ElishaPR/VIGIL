import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { reminderApi, documentApi, userApi } from "../services/api.js";
import { getStatus } from "../utils/date-utils.js";
import { PREDEFINED_CATEGORIES } from "../utils/constants.js";
import { LoadingState, SkeletonLoader } from "../components/common/LoadingState.jsx";
import { ErrorAlert } from "../components/common/ErrorAlert.jsx";
import { SuccessAlert } from "../components/common/SuccessAlert.jsx";
import { Button } from "../components/common/Button.jsx";
import { SearchBar } from "../components/dashboard/SearchBar.jsx";
import { Sidebar } from "../components/dashboard/Sidebar.jsx";
import { ReminderCard } from "../components/dashboard/ReminderCard.jsx";
import { DocumentCard } from "../components/dashboard/DocumentCard.jsx";

/**
 * Refactored Dashboard combining reminders and documents
 */
export function DashboardPage({ setIsAuthenticated }) {
  const navigate = useNavigate();
  
  // State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Data
  const [reminders, setReminders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [userData, setUserData] = useState({ display_name: "User" });
  const [customCategories, setCustomCategories] = useState([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [viewMode, setViewMode] = useState("all"); // 'all', 'reminders', 'documents'

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user data
      try {
        const user = await userApi.getCurrentUser();
        setUserData(user);
      } catch (err) {
        console.error("[v0] Failed to fetch user data:", err);
      }

      // Fetch reminders
      try {
        const remindersData = await reminderApi.getDashboard();
        const remindersArray = remindersData.reminders || [];
        setReminders(remindersArray);

        // Extract custom categories
        const allCategories = new Set(remindersArray.map((r) => r.category).filter(Boolean));
        const customCats = Array.from(allCategories).filter(
          (cat) => !PREDEFINED_CATEGORIES.find((c) => c.id === cat)
        );
        setCustomCategories(customCats);
      } catch (err) {
        console.error("[v0] Failed to fetch reminders:", err);
        setError("Unable to load reminders. Please try again.");
      }

      // Fetch documents
      try {
        const docsData = await documentApi.list();
        const docsArray = Array.isArray(docsData) ? docsData : docsData.documents || [];
        setDocuments(docsArray);
      } catch (err) {
        console.error("[v0] Failed to fetch documents:", err);
        // Don't show error if documents fail, it's optional
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle delete reminder
  const handleDeleteReminder = async (reminderId) => {
    try {
      await reminderApi.delete(reminderId);
      setReminders((prev) => prev.filter((r) => r.reminder_uuid !== reminderId));
      setSuccess("Reminder deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to delete reminder. Please try again.");
    }
  };

  // Handle delete document
  const handleDeleteDocument = async (docId) => {
    try {
      await documentApi.delete(docId);
      setDocuments((prev) => prev.filter((d) => d.doc_uuid !== docId));
      setSuccess("Document deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to delete document. Please try again.");
    }
  };

  // Handle download document
  const handleDownloadDocument = async (docId) => {
    try {
      const blob = await documentApi.download(docId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `document-${docId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to download document. Please try again.");
    }
  };

  // Filter and search combined data
  const allItems = useMemo(() => {
    let items = [];

    if (viewMode === "all" || viewMode === "reminders") {
      items = items.concat(
        reminders.map((r) => ({
          ...r,
          type: "reminder",
          id: r.reminder_uuid,
          title: r.title,
          category: r.category,
          status: r.status,
        }))
      );
    }

    if (viewMode === "all" || viewMode === "documents") {
      items = items.concat(
        documents.map((d) => ({
          ...d,
          type: "document",
          id: d.doc_uuid,
          title: d.doc_title,
          category: d.doc_category,
          status: d.expiry_date ? getStatus(d.expiry_date) : "active",
        }))
      );
    }

    // Apply status filter
    if (activeStatusFilter !== "all") {
      items = items.filter((item) => item.status === activeStatusFilter);
    }

    // Apply category filter
    if (activeCategoryFilter !== "all") {
      items = items.filter((item) => item.category === activeCategoryFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter((item) => {
        const title = (item.title || "").toLowerCase();
        const category = (item.category || "").toLowerCase();
        return title.includes(query) || category.includes(query);
      });
    }

    return items;
  }, [reminders, documents, viewMode, activeStatusFilter, activeCategoryFilter, searchQuery]);

  // Calculate counts
  const counts = useMemo(() => {
    const allData = reminders.concat(documents.map((d) => ({ ...d, status: d.expiry_date ? getStatus(d.expiry_date) : "active" })));
    return {
      expired: allData.filter((item) => item.status === "expired").length,
      expiring: allData.filter((item) => item.status === "expiring").length,
      active: allData.filter((item) => item.status === "active").length,
    };
  }, [reminders, documents]);

  const handleLogout = async () => {
    try {
      await userApi.logout();
    } catch (err) {
      console.error("[v0] Logout error:", err);
    }
    setIsAuthenticated(false);
    navigate("/login");
  };

  const hasActiveFilters = activeStatusFilter !== "all" || activeCategoryFilter !== "all" || searchQuery.trim() !== "";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar - Filters */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-200">
          <img src="/vigil-logo.svg" alt="Vigil" className="h-8 w-8" />
          <span className="text-lg font-bold text-navy-900">VIGIL</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Add buttons */}
        <div className="p-4 space-y-3 border-b border-gray-200">
          <Link
            to="/reminder/add"
            className="flex items-center justify-center gap-2 w-full bg-navy-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-navy-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Reminder
          </Link>
          <Link
            to="/document/add"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Document
          </Link>
        </div>

        {/* Sidebar filters */}
        <Sidebar
          activeStatus={activeStatusFilter}
          onStatusChange={setActiveStatusFilter}
          activeCategory={activeCategoryFilter}
          onCategoryChange={setActiveCategoryFilter}
          customCategories={customCategories}
          itemCounts={counts}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
              Welcome back, {userData.display_name}
            </h1>
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-10 h-10 bg-navy-100 text-navy-700 rounded-full flex items-center justify-center font-semibold text-sm hover:bg-navy-200 transition-colors"
            >
              {userData.display_name?.charAt(0).toUpperCase() || "U"}
            </button>

            {profileMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)}></div>
                <div className="absolute right-0 top-12 bg-white rounded-lg shadow-xl border border-gray-200 w-48 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">{userData.display_name}</p>
                    <p className="text-xs text-gray-500">{userData.email_address}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors font-medium text-sm border-t border-gray-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Alerts */}
          {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
          {success && <SuccessAlert message={success} onDismiss={() => setSuccess(null)} />}

          {loading ? (
            <SkeletonLoader count={3} variant="card" />
          ) : (
            <>
              {/* Search and filters header */}
              <div className="mb-6">
                <div className="flex flex-col gap-4">
                  <SearchBar value={searchQuery} onChange={setSearchQuery} resultCount={allItems.length} />

                  {/* View mode tabs */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode("all")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === "all"
                          ? "bg-navy-900 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      All Items
                    </button>
                    <button
                      onClick={() => setViewMode("reminders")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === "reminders"
                          ? "bg-navy-900 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Reminders
                    </button>
                    <button
                      onClick={() => setViewMode("documents")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === "documents"
                          ? "bg-navy-900 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Documents
                    </button>
                  </div>
                </div>
              </div>

              {/* Clear filters button */}
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setActiveStatusFilter("all");
                    setActiveCategoryFilter("all");
                    setSearchQuery("");
                  }}
                  className="mb-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filters
                </button>
              )}

              {/* Items grid or empty state */}
              {allItems.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-900 font-semibold mb-2">
                    {hasActiveFilters ? "No items match your filters" : "No items yet"}
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    {hasActiveFilters
                      ? "Try adjusting your search or filters"
                      : "Start by creating your first reminder or uploading a document"}
                  </p>
                  {hasActiveFilters ? (
                    <button
                      onClick={() => {
                        setActiveStatusFilter("all");
                        setActiveCategoryFilter("all");
                        setSearchQuery("");
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      Clear Filters
                    </button>
                  ) : (
                    <Link
                      to="/reminder/add"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-800 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Reminder
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {allItems.map((item) =>
                    item.type === "reminder" ? (
                      <ReminderCard
                        key={item.id}
                        reminder={item}
                        onDelete={handleDeleteReminder}
                      />
                    ) : (
                      <DocumentCard
                        key={item.id}
                        document={item}
                        onDelete={handleDeleteDocument}
                        onDownload={handleDownloadDocument}
                      />
                    )
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
