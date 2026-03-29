import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function FeedbackPage() {
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const minSubject = 3;
    const maxSubject = 100;
    const minMessage = 10;
    const maxMessage = 1000;

    const newErrors = {};

    if (!subject.trim()) {
      newErrors.subject = "Subject is required.";
    } else if (subject.trim().length < minSubject || subject.trim().length > maxSubject) {
      newErrors.subject = `Subject must be between ${minSubject} and ${maxSubject} characters.`;
    }

    if (!message.trim()) {
      newErrors.message = "Message is required.";
    } else if (message.trim().length < minMessage || message.trim().length > maxMessage) {
      newErrors.message = `Message must be between ${minMessage} and ${maxMessage} characters.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;
    setLoading(true);
    setErrors({});
    setSuccess(false);

    try {
      const response = await fetch("http://localhost:8000/feedback/submit", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setSubject("");
        setMessage("");
      } else {
        setErrors({ api: data.detail || "Failed to submit feedback." });
      }
    } catch {
      setErrors({ api: "Server not connected. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Header Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="font-medium">Back to Dashboard</span>
      </button>

      <main className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transform transition-all">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-navy-200">
            <svg className="w-7 h-7 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Send Feedback</h1>
          <p className="text-gray-500 text-sm">We'd love to hear your thoughts or bug reports!</p>
        </div>

        {errors.api && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-700 font-medium">{errors.api}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="text-sm text-green-800 font-medium">Feedback sent successfully!</p>
              <p className="text-xs text-green-600 mt-1">Thank you for helping us improve.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Subject Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
              Subject
              <span className="text-xs text-gray-400 font-normal">{subject.length}/100</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setErrors({ ...errors, subject: "" });
              }}
              placeholder="e.g. Bug Report, Feature Request"
              maxLength={100}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.subject ? "border-red-300 ring-4 ring-red-50" : "border-gray-200 focus:border-navy-500 focus:ring-4 focus:ring-navy-50"
              } outline-none transition-all text-sm placeholder-gray-400`}
            />
            {errors.subject && (
              <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full" /> {errors.subject}
              </p>
            )}
          </div>

          {/* Message Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex justify-between">
              Message
              <span className="text-xs text-gray-400 font-normal">{message.length}/1000</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setErrors({ ...errors, message: "" });
              }}
              placeholder="How can we improve your experience?"
              rows={5}
              maxLength={1000}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.message ? "border-red-300 ring-4 ring-red-50" : "border-gray-200 focus:border-navy-500 focus:ring-4 focus:ring-navy-50"
              } outline-none transition-all resize-none text-sm placeholder-gray-400`}
            />
            {errors.message && (
              <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full" /> {errors.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full relative flex items-center justify-center py-3.5 px-4 rounded-xl text-white outline-none font-semibold transition-all shadow-lg hover:shadow-xl transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-navy-900 to-navy-800"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span className="flex items-center gap-2">
                Send Feedback
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </span>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
