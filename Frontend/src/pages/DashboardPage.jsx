import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../contexts/UserContext.jsx";
import { PrimaryButton } from "../components/Auth/PrimaryButton";
import DocumentPreview from "../components/DocumentPreview";
import { generateUserReport, downloadPDF } from "../utils/pdfGenerator.js";

const CATEGORY_FILTERS = [
  { id: "all", label: "All Categories", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
  { id: "travel", label: "Travel", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0110.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "medical", label: "Medical", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { id: "vehicle", label: "Vehicle", icon: "M8 17h8M8 17v4h8v-4M8 17H6a2 2 0 01-2-2V9a2 2 0 012-2h1l1.5-3h7L17 7h1a2 2 0 012 2v6a2 2 0 01-2 2h-2M7 13h.01M17 13h.01" },
  { id: "bills", label: "Bills & Subscriptions", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { id: "housing", label: "Housing & Property", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  // ... rest of the code remains the same ...
  { id: "insurance", label: "Insurance", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
];

const statusConfig = {
  expired: { label: "Expired", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
  expiring: { label: "Expiring Soon", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  active: { label: "Active", bg: "bg-green-50", text: "text-green-700", border: "border-green-200", dot: "bg-green-500" },
  no_expiry: { label: "No Expiry", bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", dot: "bg-gray-400" },
};
const priorityConfig = {
  high: { label: "High", color: "text-red-500", bgColor: "bg-red-100" },
  medium: { label: "Medium", color: "text-amber-500", bgColor: "bg-amber-100" },
  low: { label: "Low", color: "text-green-500", bgColor: "bg-green-100" },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const parsedDate = dateStr.includes("T") ? new Date(dateStr) : new Date(dateStr + "T00:00:00");
  return parsedDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

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

function ReminderCard({ reminder, onDelete }) {
  const navigate = useNavigate();
  const status = statusConfig[reminder.status] || statusConfig.active;
  const priority = priorityConfig[reminder.priority] || priorityConfig.medium;
  const categoryInfo = CATEGORY_FILTERS.find((c) => c.id === reminder.category);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={`p-4 rounded-xl border ${status.border} ${status.bg} transition-all hover:shadow-md`}>
      <div className="flex items-start gap-3">
        <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${status.dot}`}></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 truncate">{reminder.title}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                {categoryInfo && <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={categoryInfo.icon} /></svg>}
                <span className="text-xs text-gray-500 capitalize">{(reminder.category || "general").replace("_", " ")}</span>
              </div>
            </div>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)}></div>
                  <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 w-40 z-40 overflow-hidden">
                    <button onClick={() => { setShowMenu(false); navigate(`/editreminder/${reminder.reminder_uuid}`); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Edit
                    </button>
                    <button onClick={() => { if (confirm("Delete this reminder?")) { setShowMenu(false); onDelete(reminder.reminder_uuid); } }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left border-t border-gray-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${priority.bgColor} w-fit mb-3`}>
            <span className={`text-xs font-semibold ${priority.color}`}>{priority.label} Priority</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{reminder.reminder_at ? formatDate(reminder.reminder_at) : "No specific reminder"}</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.text} bg-white border ${status.border}`}>{status.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentCard({ doc, onDelete }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const fileSizeLabel = doc.doc_size > 1048576 ? `${(doc.doc_size / 1048576).toFixed(1)} MB` : `${Math.round(doc.doc_size / 1024)} KB`;

  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-white transition-all hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{doc.doc_title}</h3>
              <p className="text-xs text-gray-500 capitalize mt-0.5">{(doc.doc_category || "").replace("_", " ")} · {fileSizeLabel}</p>
            </div>
            <div className="relative">
              <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)}></div>
                  <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 w-40 z-40 overflow-hidden">
                    <button onClick={() => { setShowMenu(false); navigate(`/editdocument/${doc.doc_uuid}`); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Edit
                    </button>
                    <button onClick={() => { if (confirm("Delete this document?")) { setShowMenu(false); onDelete(doc.doc_uuid); } }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left border-t border-gray-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export function DashboardPage({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const { isAdmin } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("reminders");
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [reminders, setReminders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({ display_name: "User" });
  const [customCategories, setCustomCategories] = useState([]);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const [userRes, remindersRes, docsRes] = await Promise.all([
          fetch("http://localhost:8000/users/me", { credentials: "include" }),
          fetch("http://localhost:8000/reminders/dashboard", { credentials: "include" }),
          fetch("http://localhost:8000/documents/standalone/list", { credentials: "include" }),
        ]);
        if (userRes.ok) setUserData(await userRes.json());
        if (!remindersRes.ok) throw new Error("Failed to load reminders");
        const rd = await remindersRes.json();
        setReminders(rd.reminders || []);
        const allCats = new Set(rd.reminders?.map((r) => r.category) || []);
        setCustomCategories(Array.from(allCats).filter((c) => !CATEGORY_FILTERS.find((f) => f.id === c)));
        if (docsRes.ok) setDocuments(await docsRes.json());
      } catch {
        setError("Unable to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleLogout = async () => {
    try { await fetch("http://localhost:8000/users/logout", { method: "POST", credentials: "include" }); } catch {}
    setIsAuthenticated(false);
    navigate("/login");
  };

  const handleDeleteReminder = async (uuid) => {
    const res = await fetch(`http://localhost:8000/reminders/${uuid}`, { method: "DELETE", credentials: "include" });
    if (res.ok) setReminders((p) => p.filter((r) => r.reminder_uuid !== uuid));
    else setError("Failed to delete reminder.");
  };

  const handleDeleteDocument = async (uuid) => {
    const res = await fetch(`http://localhost:8000/documents/${uuid}`, { method: "DELETE", credentials: "include" });
    if (res.ok) setDocuments((p) => p.filter((d) => d.doc_uuid !== uuid));
    else setError("Failed to delete document.");
  };

  const handleGeneratePDF = async () => {
    setGeneratingPDF(true);
    try {
      // Fetch all reminders for PDF
      const res = await fetch("http://localhost:8000/reminders/dashboard", { 
        credentials: "include" 
      });
      
      if (res.ok) {
        const data = await res.json();
        const pdfDoc = generateUserReport(data.reminders || []);
        downloadPDF(pdfDoc, `my-reminders-${new Date().toISOString().split('T')[0]}.pdf`);
      } else {
        setError("Failed to fetch data for PDF generation");
      }
    } catch (err) {
      setError("Error generating PDF: " + err.message);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const expiredCount = reminders.filter((r) => r.status === "expired").length;
  const expiringCount = reminders.filter((r) => r.status === "expiring").length;
  const activeCount = reminders.filter((r) => r.status === "active").length;

  const filteredReminders = reminders.filter((r) => {
    if (activeStatusFilter !== "all" && r.status !== activeStatusFilter) return false;
    if (activeCategoryFilter !== "all" && r.category !== activeCategoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (r.title || "").toLowerCase().includes(q) || (r.category || "").toLowerCase().includes(q);
    }
    return true;
  });

  const filteredDocuments = documents.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (d.doc_title || "").toLowerCase().includes(q) || (d.doc_category || "").toLowerCase().includes(q);
  });

  const hasActiveFilters = activeStatusFilter !== "all" || activeCategoryFilter !== "all";

  return (
    <div className="min-h-screen bg-white flex">
      {loading && (
        <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full border-4 border-navy-200 border-t-navy-600 animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 font-semibold">Loading dashboard...</p>
          </div>
        </div>
      )}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-navy-900 to-navy-950 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 flex items-center gap-3 px-5 border-b border-navy-800">
          <img src="/vigil-logo.svg" alt="Vigil" className="h-9 w-9 brightness-0 invert" />
          <span className="text-xl font-bold text-white tracking-tight">VIGIL</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden p-2 hover:bg-navy-800 rounded-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-4 space-y-3">
          <Link to="/addreminder" className="flex items-center justify-center gap-2 w-full bg-white text-navy-900 py-3 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Reminder
          </Link>
          <Link to="/uploaddocument" className="flex items-center justify-center gap-2 w-full bg-navy-800 text-white py-3 rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors border border-navy-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            Upload Document
          </Link>
          <Link to="/feedback" className="flex items-center justify-center gap-2 w-full bg-transparent text-navy-200 border border-navy-700 py-3 rounded-xl text-sm font-medium hover:bg-navy-800 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            Send Feedback
          </Link>
          <Link to="/documents" className="flex items-center justify-center gap-2 w-full bg-transparent text-navy-200 border border-navy-700 py-3 rounded-xl text-sm font-medium hover:bg-navy-800 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            My Documents
          </Link>
        </div>
        <nav className="flex-1 px-4 py-2 overflow-y-auto">
          <p className="text-xs font-semibold text-navy-300 uppercase tracking-wider mb-3 px-3">Status</p>
          <div className="space-y-1 mb-6">
            {[{ id: "all", label: "All Reminders", count: reminders.length }, { id: "expired", label: "Expired", count: expiredCount }, { id: "expiring", label: "Expiring Soon", count: expiringCount }, { id: "active", label: "Active", count: activeCount }].map(({ id, label, count }) => (
              <button key={id} onClick={() => { setActiveStatusFilter(id); setActiveTab("reminders"); }} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${activeStatusFilter === id && activeTab === "reminders" ? "bg-white text-navy-900" : "text-navy-200 hover:bg-navy-800"}`}>
                <span className="truncate">{label}</span>
                {count > 0 && <span className="ml-auto text-xs font-semibold text-navy-300">{count}</span>}
              </button>
            ))}
          </div>
          <p className="text-xs font-semibold text-navy-300 uppercase tracking-wider mb-3 px-3">Categories</p>
          <div className="space-y-1">
            {CATEGORY_FILTERS.map((cat) => {
              const count = cat.id === "all" ? reminders.length : reminders.filter((r) => r.category === cat.id).length;
              return (
                <button key={cat.id} onClick={() => { setActiveCategoryFilter(cat.id); setActiveTab("reminders"); }} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${activeCategoryFilter === cat.id && activeTab === "reminders" ? "bg-white text-navy-900" : "text-navy-200 hover:bg-navy-800"}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={cat.icon} /></svg>
                  <span className="truncate">{cat.label}</span>
                  {count > 0 && <span className="ml-auto text-xs font-semibold text-navy-300">{count}</span>}
                </button>
              );
            })}
            {customCategories.map((cat) => {
              const count = reminders.filter((r) => r.category === cat).length;
              return (
                <button key={`c-${cat}`} onClick={() => { setActiveCategoryFilter(cat); setActiveTab("reminders"); }} className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${activeCategoryFilter === cat ? "bg-white text-navy-900" : "text-navy-200 hover:bg-navy-800"}`}>
                  <span className="truncate capitalize">{cat}</span>
                  {count > 0 && <span className="ml-auto text-xs font-semibold text-navy-300">{count}</span>}
                </button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8 sticky top-0 z-30 gap-3">
          <button className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100" onClick={() => setSidebarOpen(true)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">Welcome back, {userData.display_name}</h1>

          {/* Search */}
          <div className="flex-1 max-w-sm relative ml-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search by title or category…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:border-navy-400 focus:outline-none text-sm bg-gray-50"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>

          <div className="ml-auto relative">
            <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="w-10 h-10 bg-navy-100 text-navy-700 rounded-full flex items-center justify-center font-semibold text-sm hover:bg-navy-200">
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
                  <Link to="/profile" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    My Profile
                  </Link>
                  {isAdmin && (
                    <Link to="/admin/notifications" onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      Notification Logs
                    </Link>
                  )}
                  <button onClick={() => { setProfileMenuOpen(false); handleLogout(); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 font-medium">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {error && !loading && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-xl px-6 py-4 flex items-start gap-4">
              <p className="text-red-700 font-medium flex-1">{error}</p>
              <button onClick={() => window.location.reload()} className="text-sm font-medium text-red-600 underline">Retry</button>
            </div>
          )}

          {!loading && !error && activeTab === "reminders" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StatCard label="Expired" count={expiredCount} icon={null} colorClasses="bg-red-50 border-red-200 text-red-700" />
              <StatCard label="Expiring Soon" count={expiringCount} icon={null} colorClasses="bg-amber-50 border-amber-200 text-amber-700" />
              <StatCard label="Active" count={activeCount} icon={null} colorClasses="bg-green-50 border-green-200 text-green-700" />
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Tabs */}
              <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
                <button onClick={() => setActiveTab("reminders")} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "reminders" ? "bg-white text-navy-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
                  Reminders ({reminders.length})
                </button>
                <button onClick={() => setActiveTab("documents")} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "documents" ? "bg-white text-navy-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
                  Documents ({documents.length})
                </button>
              </div>

              {activeTab === "reminders" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500">{filteredReminders.length} result{filteredReminders.length !== 1 ? "s" : ""}{(hasActiveFilters || searchQuery) && " (filtered)"}</p>
                    <div className="flex items-center gap-2">
                      {(hasActiveFilters || searchQuery) && (
                        <button onClick={() => { setActiveStatusFilter("all"); setActiveCategoryFilter("all"); setSearchQuery(""); }} className="text-sm text-gray-500 hover:text-gray-800 underline">Clear filters</button>
                      )}
                      <button
                        onClick={handleGeneratePDF}
                        disabled={generatingPDF}
                        className="flex items-center gap-2 px-4 py-2 bg-navy-600 text-white rounded-lg text-sm font-medium hover:bg-navy-700 disabled:opacity-50"
                      >
                        <svg className={`w-4 h-4 ${generatingPDF ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {generatingPDF ? "Generating..." : "Generate PDF Report"}
                      </button>
                    </div>
                  </div>
                  {filteredReminders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                      <p className="text-gray-900 font-semibold mb-1">No reminders found</p>
                      <p className="text-sm text-gray-500 mb-6">{hasActiveFilters || searchQuery ? "Try clearing your filters" : "Add a reminder to get started"}</p>
                      {!hasActiveFilters && !searchQuery && <Link to="/addreminder" className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-950">Add Reminder</Link>}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredReminders.map((r) => <ReminderCard key={r.reminder_uuid} reminder={r} onDelete={handleDeleteReminder} />)}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "documents" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500">{filteredDocuments.length} document{filteredDocuments.length !== 1 ? "s" : ""}{searchQuery && " (filtered)"}</p>
                    <Link to="/uploaddocument" className="inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white rounded-lg text-sm font-semibold hover:bg-navy-950">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Upload New
                    </Link>
                  </div>
                  {filteredDocuments.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                      <p className="text-gray-900 font-semibold mb-1">No documents found</p>
                      <p className="text-sm text-gray-500 mb-6">{searchQuery ? "Try a different search" : "Upload your first document"}</p>
                      {!searchQuery && <Link to="/uploaddocument" className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-950">Upload Document</Link>}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredDocuments.map((d) => <DocumentCard key={d.doc_uuid} doc={d} onDelete={handleDeleteDocument} />)}
                    </div>
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
