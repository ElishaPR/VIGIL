import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// Category filter options (matching Add Reminder)
const CATEGORY_FILTERS = [
  { id: "all", label: "All Categories", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
  { id: "travel", label: "Travel", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0110.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "medical", label: "Medical", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { id: "vehicle", label: "Vehicle", icon: "M8 17h8M8 17v4h8v-4M8 17H6a2 2 0 01-2-2V9a2 2 0 012-2h1l1.5-3h7L17 7h1a2 2 0 012 2v6a2 2 0 01-2 2h-2M7 13h.01M17 13h.01" },
  { id: "bills", label: "Bills & Subscriptions", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
  { id: "housing", label: "Housing & Property", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "insurance", label: "Insurance", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
];

const statusConfig = {
  expired: { label: "Expired", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
  expiring: { label: "Expiring Soon", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  active: { label: "Active", bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500" },
};

const priorityConfig = {
  high: { label: "High", color: "text-red-500", bgColor: "bg-red-100" },
  medium: { label: "Medium", color: "text-amber-500", bgColor: "bg-amber-100" },
  low: { label: "Low", color: "text-green-500", bgColor: "bg-green-100" },
};

function StatCard({ label, count, icon, colorClasses }) {
  return (
    <div className={`rounded-2xl border p-5 ${colorClasses} transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-80">{label}</span>
        {icon}
      </div>
      <p className="text-3xl font-bold">{count}</p>
    </div>
  );
}

function ReminderCard({ reminder, onEdit, onDelete }) {
  const navigate = useNavigate();
  const status = statusConfig[reminder.status];
  const priority = priorityConfig[reminder.priority];
  const categoryInfo = CATEGORY_FILTERS.find((c) => c.id === reminder.category);
  const [showMenu, setShowMenu] = useState(false);

  const handleEdit = () => {
    setShowMenu(false);
    navigate(`/editreminder/${reminder.reminder_uuid}`);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this reminder? This action cannot be undone.")) {
      setShowMenu(false);
      onDelete(reminder.reminder_uuid);
    }
  };
  console.log("STATUS FROM BACKEND:", reminder.status);
  return (
    <div className={`p-4 rounded-xl border ${status.border} ${status.bg} transition-all hover:shadow-md`}>
      <div className="flex items-start gap-3">
        {/* Status Indicator */}
        <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${status.dot}`}></div>

        <div className="flex-1 min-w-0">
          {/* Title & Category */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 truncate">{reminder.title}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                {categoryInfo && (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={categoryInfo.icon} />
                  </svg>
                )}
                <span className="text-xs text-gray-500 capitalize">{reminder.category.replace("_", " ")}</span>
              </div>
            </div>

            {/* Menu Button */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
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
          </div>

          {/* Priority Flag */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${priority.bgColor} w-fit mb-3`}>
            <svg className={`w-3.5 h-3.5 ${priority.color}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span className={`text-xs font-semibold ${priority.color}`}>{priority.label}</span>
          </div>

          {/* Date & Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">
                {new Date(reminder.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>

            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.text} bg-white border ${status.border}`}>
              {status.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardPage({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({ display_name: "User" });
  const [customCategories, setCustomCategories] = useState([]);

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch user data
        const userResponse = await fetch("http://localhost:8000/users/me", {
          method: "GET",
          credentials: "include",
        });
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserData(userData);
        }

        // Fetch reminders
        const response = await fetch("http://localhost:8000/reminders/dashboard", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to load reminders");
        }

        const data = await response.json();
        setReminders(data.reminders || []);

        // Extract custom categories from reminders
        const allCategories = new Set(data.reminders?.map((r) => r.category) || []);
        const customCats = Array.from(allCategories).filter(
          (cat) => !CATEGORY_FILTERS.find((c) => c.id === cat)
        );
        setCustomCategories(customCats);
      } catch (err) {
        console.error("[v0] Dashboard fetch error:", err);
        setError("Unable to load reminders. Please check your connection or try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/users/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      console.error("Logout failed");
    }

    setIsAuthenticated(false);
    navigate("/login");
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      const response = await fetch(`http://localhost:8000/reminders/${reminderId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setReminders((prev) => prev.filter((r) => r.reminder_uuid !== reminderId));
      } else {
        setError("Failed to delete reminder. Please try again.");
      }
    } catch {
      setError("Server not connected. Please try again.");
    }
  };

  const expiredCount = reminders.filter((r) => r.status === "expired").length;
  const expiringCount = reminders.filter((r) => r.status === "expiring").length;
  const activeCount = reminders.filter((r) => r.status === "active").length;

  // Filter reminders
  const filtered = reminders.filter((r) => {
    if (activeStatusFilter !== "all" && r.status !== activeStatusFilter) return false;
    if (activeCategoryFilter !== "all" && r.category !== activeCategoryFilter) return false;
    return true;
  });

  // Check if any filters are active
  const hasActiveFilters = activeStatusFilter !== "all" || activeCategoryFilter !== "all";

  const clearAllFilters = () => {
    setActiveStatusFilter("all");
    setActiveCategoryFilter("all");
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Page Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full border-4 border-navy-200 border-t-navy-600 animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 font-semibold">Loading dashboard...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait</p>
          </div>
        </div>
      )}

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-navy-900 to-navy-950 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-navy-800">
          <img src="/vigil-logo.svg" alt="Vigil" className="h-9 w-9 brightness-0 invert" />
          <span className="text-xl font-bold text-white tracking-tight">VIGIL</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden p-2 hover:bg-navy-800 rounded-lg"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Add Reminder Button */}
        <div className="p-4">
          <Link
            to="/addreminder"
            className="flex items-center justify-center gap-2 w-full bg-white text-navy-900 py-3 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Reminder
          </Link>
        </div>

        {/* Add Upload Document Button */}
        <div className="px-4 pb-4">
          <Link
            to="/uploaddocument"
            className="flex items-center justify-center gap-2 w-full bg-navy-800 text-white py-3 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors border border-navy-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Document
          </Link>
        </div>

        {/* Status Filters */}
        <nav className="flex-1 px-4 py-2 overflow-y-auto">
          <p className="text-xs font-semibold text-navy-300 uppercase tracking-wider mb-3 px-3">Status</p>
          <div className="space-y-1 mb-6">
            <button
              onClick={() => setActiveStatusFilter("all")}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${activeStatusFilter === "all" ? "bg-white text-navy-900" : "text-navy-200 hover:bg-navy-800"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
              All Documents
              <span className="ml-auto text-xs font-semibold text-navy-300">{reminders.length}</span>
            </button>

            <button
              onClick={() => setActiveStatusFilter("expired")}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${activeStatusFilter === "expired" ? "bg-red-100 text-red-700" : "text-navy-200 hover:bg-navy-800"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Expired
              {expiredCount > 0 && <span className="ml-auto bg-red-200 text-red-900 text-xs font-semibold px-2 py-0.5 rounded-full">{expiredCount}</span>}
            </button>

            <button
              onClick={() => setActiveStatusFilter("expiring")}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${activeStatusFilter === "expiring" ? "bg-amber-100 text-amber-700" : "text-navy-200 hover:bg-navy-800"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Expiring Soon
              {expiringCount > 0 && <span className="ml-auto bg-amber-200 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded-full">{expiringCount}</span>}
            </button>

            <button
              onClick={() => setActiveStatusFilter("active")}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${activeStatusFilter === "active" ? "bg-green-100 text-green-700" : "text-navy-200 hover:bg-navy-800"}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Active
              <span className="ml-auto text-xs font-semibold text-navy-300">{activeCount}</span>
            </button>
          </div>

          {/* Category Filters */}
          <p className="text-xs font-semibold text-navy-300 uppercase tracking-wider mb-3 px-3">Categories</p>
          <div className="space-y-1">
            {CATEGORY_FILTERS.map((category) => {
              const count = category.id === "all" ? reminders.length : reminders.filter((r) => r.category === category.id).length;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategoryFilter(category.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${activeCategoryFilter === category.id ? "bg-white text-navy-900" : "text-navy-200 hover:bg-navy-800"}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={category.icon} />
                  </svg>
                  <span className="truncate">{category.label}</span>
                  {count > 0 && <span className="ml-auto text-xs font-semibold text-navy-300">{count}</span>}
                </button>
              );
            })}

            {/* Custom Categories */}
            {customCategories.length > 0 && (
              <>
                <div className="my-3 px-3 border-t border-navy-800"></div>
                {customCategories.map((category) => {
                  const count = reminders.filter((r) => r.category === category).length;
                  return (
                    <button
                      key={`custom-${category}`}
                      onClick={() => setActiveCategoryFilter(category)}
                      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${activeCategoryFilter === category ? "bg-white text-navy-900" : "text-navy-200 hover:bg-navy-800"}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="truncate">{category}</span>
                      {count > 0 && <span className="ml-auto text-xs font-semibold text-navy-300">{count}</span>}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
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
            <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">Welcome back, {userData.display_name}</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Add Button */}
            <Link
              to="/addreminder"
              className="lg:hidden flex items-center justify-center w-10 h-10 bg-navy-900 text-white rounded-full hover:bg-navy-950 transition-colors shadow-lg shadow-navy-900/20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>

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
                  <div className="absolute right-0 top-12 bg-white rounded-xl shadow-xl border border-gray-200 w-52 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">{userData.display_name}</p>
                      <p className="text-sm text-gray-500">{userData.email_address}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 rounded-full border-4 border-navy-200 border-t-navy-600 animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">Loading your reminders...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-xl px-6 py-4 flex items-start gap-4">
              <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-red-700 font-medium">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Stat cards */}
          {!loading && !error && <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Expired"
              count={expiredCount}
              icon={<svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01" /></svg>}
              colorClasses="bg-red-50 border-red-200 text-red-700"
            />
            <StatCard
              label="Expiring Soon"
              count={expiringCount}
              icon={<svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3" /></svg>}
              colorClasses="bg-amber-50 border-amber-200 text-amber-700"
            />
            <StatCard
              label="Active"
              count={activeCount}
              icon={<svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4" /></svg>}
              colorClasses="bg-green-50 border-green-200 text-green-700"
            />
          </div>}

          {/* Document list */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeStatusFilter === "all" ? "All Documents" : statusConfig[activeStatusFilter]?.label || "Documents"}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {filtered.length} document{filtered.length !== 1 ? "s" : ""}
                  {hasActiveFilters && " (filtered)"}
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear Filters
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-900 font-semibold mb-1">No documents found</p>
                <p className="text-sm text-gray-500 mb-6">
                  {hasActiveFilters ? "Try adjusting your filters" : "Add a reminder to start tracking your documents"}
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <Link
                    to="/addreminder"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-950 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Your First Reminder
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((reminder) => (
                  <ReminderCard key={reminder.reminder_uuid || reminder.title} reminder={reminder} onDelete={handleDeleteReminder} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
