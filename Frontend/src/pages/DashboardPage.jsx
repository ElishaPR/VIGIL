import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Placeholder data for UI shell
const sampleReminders = [
  { id: 1, title: "Passport", category: "Identity", expiryDate: "2026-03-15", priority: "HIGH", status: "expired" },
  { id: 2, title: "Car Insurance", category: "Insurance", expiryDate: "2026-04-02", priority: "HIGH", status: "expiring" },
  { id: 3, title: "Driving License", category: "License", expiryDate: "2026-05-20", priority: "MEDIUM", status: "expiring" },
  { id: 4, title: "Health Insurance", category: "Insurance", expiryDate: "2028-01-10", priority: "LOW", status: "active" },
  { id: 5, title: "Rent Agreement", category: "Legal", expiryDate: "2027-06-30", priority: "MEDIUM", status: "active" },
];

const statusConfig = {
  expired: { label: "Expired", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
  expiring: { label: "Expiring Soon", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  active: { label: "Active", bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500" },
};

const priorityConfig = {
  HIGH: { label: "High", classes: "bg-red-100 text-red-700" },
  MEDIUM: { label: "Medium", classes: "bg-amber-100 text-amber-700" },
  LOW: { label: "Low", classes: "bg-green-100 text-green-700" },
};

function StatCard({ label, count, icon, colorClasses }) {
  return (
    <div className={`rounded-xl border p-5 ${colorClasses}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-80 md:text-base">{label}</span>
        {icon}
      </div>
      <p className="text-3xl font-bold md:text-4xl lg:text-5xl">{count}</p>
    </div>
  );
}

function ReminderRow({ reminder }) {
  const status = statusConfig[reminder.status];
  const priority = priorityConfig[reminder.priority];

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border ${status.border} ${status.bg} transition-all hover:shadow-sm`}>
      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${status.dot}`}></div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{reminder.title}</p>
        <p className="text-xs text-gray-500">{reminder.category}</p>
      </div>
      <div className="hidden sm:block text-right">
        <p className="text-sm text-gray-700 font-medium">{new Date(reminder.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
      </div>
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${priority.classes}`}>
        {priority.label}
      </span>
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${status.text} bg-white border ${status.border}`}>
        {status.label}
      </span>
    </div>
  );
}

export function DashboardPage({ setIsAuthenticated }) {
  const navigate = useNavigate();
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const expiredCount = sampleReminders.filter((r) => r.status === "expired").length;
  const expiringCount = sampleReminders.filter((r) => r.status === "expiring").length;
  const activeCount = sampleReminders.filter((r) => r.status === "active").length;

  const filtered = activeFilter === "all" ? sampleReminders : sampleReminders.filter((r) => r.status === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-100">
          <img src="/vigil-logo.svg" alt="Vigil" className="h-8 w-8" />
          <span className="text-lg font-bold text-navy-900 tracking-tight">VIGIL</span>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          <button
            onClick={() => setActiveFilter("all")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left w-full ${activeFilter === "all" ? "bg-navy-50 text-navy-900" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" /></svg>
            All Documents
          </button>
          <button
            onClick={() => setActiveFilter("expired")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left w-full ${activeFilter === "expired" ? "bg-red-50 text-red-700" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            Expired
            {expiredCount > 0 && <span className="ml-auto bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">{expiredCount}</span>}
          </button>
          <button
            onClick={() => setActiveFilter("expiring")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left w-full ${activeFilter === "expiring" ? "bg-amber-50 text-amber-700" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Expiring Soon
            {expiringCount > 0 && <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">{expiringCount}</span>}
          </button>
          <button
            onClick={() => setActiveFilter("active")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left w-full ${activeFilter === "active" ? "bg-green-50 text-green-700" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Active
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link
            to="/addreminder"
            className="flex items-center justify-center gap-2 w-full bg-navy-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-navy-950 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Reminder
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900 hidden lg:block md:text-2xl">Dashboard</h1>
          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-9 h-9 bg-navy-100 text-navy-700 rounded-full flex items-center justify-center font-semibold text-sm hover:bg-navy-200 transition-colors"
            >
              U
            </button>

            {profileMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)}></div>
                <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-200 w-48 z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100 text-sm md:text-base"
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-red-700 hover:bg-red-50 transition-colors text-sm md:text-base font-medium"
                  >
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
          </div>

          {/* Document list */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 md:text-2xl lg:text-3xl">
                {activeFilter === "all" ? "All Documents" : statusConfig[activeFilter]?.label || "Documents"}
              </h2>
              <span className="text-sm text-gray-500 md:text-base">{filtered.length} document{filtered.length !== 1 ? "s" : ""}</span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="text-gray-500 font-medium">No documents found</p>
                <p className="text-sm text-gray-400 mt-1">Add a reminder to start tracking your documents.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((reminder) => (
                  <ReminderRow key={reminder.id} reminder={reminder} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
