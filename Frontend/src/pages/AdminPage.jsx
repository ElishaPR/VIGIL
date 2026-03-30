import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { generateAdminReport, downloadPDF } from "../utils/pdfGenerator.js";

const STATUS_OPTIONS = ["all", "SUCCESS", "FAILED"];
const CHANNEL_OPTIONS = ["all", "EMAIL", "PUSH"];

export function AdminPage() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalFailed, setTotalFailed] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const fetchLogs = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: p, page_size: 20 });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (channelFilter !== "all") params.set("channel", channelFilter);
      const res = await fetch(`http://localhost:8000/admin/notifications?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load notification logs");
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setTotalFailed(data.total_failed || 0);
      setPages(data.pages || 1);
      setPage(p);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setGeneratingPDF(true);
    try {
      // Fetch all logs for PDF (without pagination)
      const params = new URLSearchParams({ page_size: 10000 });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (channelFilter !== "all") params.set("channel", channelFilter);
      const res = await fetch(`http://localhost:8000/admin/notifications?${params.toString()}`, {
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        const pdfDoc = generateAdminReport(data.logs || []);
        downloadPDF(pdfDoc, `notification-logs-${new Date().toISOString().split('T')[0]}.pdf`);
      } else {
        setError("Failed to fetch data for PDF generation");
      }
    } catch (err) {
      setError("Error generating PDF: " + err.message);
    } finally {
      setGeneratingPDF(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, channelFilter]);

  const formatDate = (isoStr) => {
    if (!isoStr) return "—";
    return new Date(isoStr).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Dashboard</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Notification Logs</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Total Logs</p>
            <p className="text-3xl font-bold text-gray-900">{total}</p>
          </div>
          <div className="bg-red-50 rounded-2xl border border-red-200 p-5">
            <p className="text-sm text-red-600 mb-1">Total Failed</p>
            <p className="text-3xl font-bold text-red-700">{totalFailed}</p>
          </div>
          <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
            <p className="text-sm text-green-600 mb-1">Success (this page)</p>
            <p className="text-3xl font-bold text-green-700">{logs.filter((l) => l.status === "SUCCESS").length}</p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${statusFilter === s ? "bg-navy-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Channel:</label>
              <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white">
                {CHANNEL_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setChannelFilter(c)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${channelFilter === c ? "bg-navy-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    {c === "all" ? "All" : c}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => fetchLogs(page)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={generatingPDF}
              className="flex items-center gap-2 px-4 py-2 bg-navy-600 text-white rounded-xl text-sm font-medium hover:bg-navy-700 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${generatingPDF ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {generatingPDF ? "Generating..." : "Generate PDF Report"}
            </button>
          </div>

          <div className="flex flex-col items-end gap-1">
            <button
              onClick={() => window.open("https://mail.zoho.in", "_blank")}
              className="px-4 py-2 bg-navy-600 text-white rounded-xl text-sm font-semibold hover:bg-navy-700 transition-colors shadow-sm"
            >
              Open Feedback Inbox
            </button>
            <p className="text-[10px] text-gray-400">
              Check admin inbox for feedback messages
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-6 py-4 text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Channel</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reminder</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Error</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Attempted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                      <div className="w-8 h-8 border-4 border-navy-200 border-t-navy-600 rounded-full animate-spin mx-auto mb-2"></div>
                      Loading…
                    </td>
                  </tr>
                )}
                {!loading && logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-500">No logs found for the selected filters.</td>
                  </tr>
                )}
                {!loading && logs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${log.status === "SUCCESS" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${log.status === "SUCCESS" ? "bg-green-500" : "bg-red-500"}`}></span>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${log.channel === "PUSH" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                        {log.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-xs">{log.user_email || "—"}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs max-w-[180px] truncate">{log.reminder_title || "—"}</td>
                    <td className="px-4 py-3 text-red-600 text-xs max-w-[200px] truncate" title={log.error_message}>{log.error_message || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDate(log.attempted_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">Page {page} of {pages} · {total} total</p>
              <div className="flex gap-2">
                <button onClick={() => fetchLogs(page - 1)} disabled={page <= 1 || loading} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40">
                  ← Prev
                </button>
                <button onClick={() => fetchLogs(page + 1)} disabled={page >= pages || loading} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40">
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
