import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { messaging } from "../firebase";
import { getToken } from "firebase/messaging";
import { FormInput } from "../components/Auth/FormInput";
import { PrimaryButton } from "../components/Auth/PrimaryButton";
import { validateEmail } from "../utils/validators";

export function AddReminderPage() {
  const navigate = useNavigate();
  const [docCategory, setDocCategory] = useState("");
  const [reminderTitle, setReminderTitle] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [scheduleType, setScheduleType] = useState("DEFAULT");
  const [reminderAt, setReminderAt] = useState("");
  const [repeatType, setRepeatType] = useState("NONE");
  const [pushNotification, setPushNotification] = useState(false);
  const [priority, setPriority] = useState("MEDIUM");
  const [notes, setNotes] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    api: "",
    docCategory: "",
    title: "",
    expiryDate: "",
    reminderAt: "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  const updateError = (field, value) => {
    setErrors((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!docCategory.trim()) {
      newErrors.docCategory = "Document category is required.";
    }
    if (!reminderTitle.trim()) {
      newErrors.title = "Reminder title is required.";
    }
    if (!expiryDate) {
      newErrors.expiryDate = "Expiry date is required.";
    }
    if (scheduleType === "CUSTOM" && !reminderAt) {
      newErrors.reminderAt = "Reminder date is required for custom reminders.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      return false;
    }
    return true;
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    updateError("api", "");
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append(
        "reminder_data",
        JSON.stringify({
          reminder: {
            reminder_title: reminderTitle.trim(),
            schedule_type: scheduleType,
            reminder_at: reminderAt || null,
            repeat_type: repeatType,
            push_notification: pushNotification,
            priority: priority,
            notes: notes.trim(),
          },
          document: {
            doc_category: docCategory.trim(),
            expiry_date: expiryDate,
          },
        })
      );

      if (uploadedFile) {
        formData.append("uploaded_doc", uploadedFile);
      }

      if (pushNotification) {
        let permission = Notification.permission;

        if (permission !== "granted") {
          permission = await Notification.requestPermission();
        }

        if (permission === "granted") {
          let registration = await navigator.serviceWorker.getRegistration();

          if (!registration) {
            registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
          }

          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_PUBLIC_VAPID_KEY,
            serviceWorkerRegistration: registration,
          });

          if (token) {
            await fetch("http://localhost:8000/users/save-fcm-token", {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ fcm_token: token }),
            });
          }
        } else {
          updateError("api", "Push notification permission denied.");
          setPushNotification(false);
          setLoading(false);
          return;
        }
      }

      const response = await fetch("http://localhost:8000/reminders/addreminder", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage("Reminder added successfully!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        updateError("api", result.detail || result.message || "Failed to add reminder.");
      }
    } catch {
      updateError("api", "Server not connected. Try again...");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-navy-700 hover:text-navy-900 transition-colors text-sm font-medium mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 md:text-4xl lg:text-4xl">Add Reminder</h1>
            <p className="text-lg text-gray-600 md:text-xl">Create a new reminder for your documents</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-start gap-2.5">
              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-700 md:text-base">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {errors.api && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2.5">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700 md:text-base">{errors.api}</p>
            </div>
          )}

          <form onSubmit={handleAddReminder} className="space-y-6">
            {/* Document Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 md:text-2xl">Document Information</h2>

              <div className="space-y-5">
                <div>
                  <label htmlFor="docCategory" className="block text-sm font-medium text-gray-700 mb-1.5 md:text-base lg:text-lg">
                    Document Category <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="docCategory"
                    placeholder="e.g., Passport, Insurance, License"
                    className={`input-field text-base md:text-lg ${errors.docCategory ? "input-error" : ""}`}
                    value={docCategory}
                    onChange={(e) => {
                      setDocCategory(e.target.value);
                      if (errors.docCategory) updateError("docCategory", "");
                    }}
                    required
                  />
                  {errors.docCategory && (
                    <p className="text-red-600 text-sm md:text-base mt-1">{errors.docCategory}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="reminderTitle" className="block text-sm font-medium text-gray-700 mb-1.5 md:text-base lg:text-lg">
                    Reminder Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="reminderTitle"
                    placeholder="e.g., Passport Renewal"
                    className={`input-field text-base md:text-lg ${errors.title ? "input-error" : ""}`}
                    value={reminderTitle}
                    onChange={(e) => {
                      setReminderTitle(e.target.value);
                      if (errors.title) updateError("title", "");
                    }}
                    required
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm md:text-base mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1.5 md:text-base lg:text-lg">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="expiryDate"
                    className={`input-field text-base md:text-lg ${errors.expiryDate ? "input-error" : ""}`}
                    value={expiryDate}
                    onChange={(e) => {
                      setExpiryDate(e.target.value);
                      if (errors.expiryDate) updateError("expiryDate", "");
                    }}
                    required
                  />
                  {errors.expiryDate && (
                    <p className="text-red-600 text-sm md:text-base mt-1">{errors.expiryDate}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="uploadedFile" className="block text-sm font-medium text-gray-700 mb-1.5 md:text-base lg:text-lg">
                    Upload Document (Optional)
                  </label>
                  <input
                    type="file"
                    id="uploadedFile"
                    placeholder="Choose a file"
                    className="input-field text-base md:text-lg"
                    onChange={(e) => setUploadedFile(e.target.files[0])}
                  />
                  {uploadedFile && (
                    <p className="text-sm text-gray-500 mt-1 md:text-base">Selected: {uploadedFile.name}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Reminder Section */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 md:text-2xl">Reminder Settings</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 md:text-base lg:text-lg">
                    Reminder Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="scheduleType"
                        value="DEFAULT"
                        checked={scheduleType === "DEFAULT"}
                        onChange={(e) => setScheduleType(e.target.value)}
                        className="w-4 h-4 text-navy-900"
                      />
                      <span className="text-sm text-gray-700 md:text-base">Default</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="scheduleType"
                        value="CUSTOM"
                        checked={scheduleType === "CUSTOM"}
                        onChange={(e) => setScheduleType(e.target.value)}
                        className="w-4 h-4 text-navy-900"
                      />
                      <span className="text-sm text-gray-700 md:text-base">Custom</span>
                    </label>
                  </div>
                </div>

                {scheduleType === "CUSTOM" && (
                  <div>
                    <label htmlFor="reminderAt" className="block text-sm font-medium text-gray-700 mb-1.5 md:text-base lg:text-lg">
                      Reminder Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="reminderAt"
                      className={`input-field text-base md:text-lg ${errors.reminderAt ? "input-error" : ""}`}
                      value={reminderAt}
                      onChange={(e) => {
                        setReminderAt(e.target.value);
                        if (errors.reminderAt) updateError("reminderAt", "");
                      }}
                    />
                    {errors.reminderAt && (
                      <p className="text-red-600 text-sm md:text-base mt-1">{errors.reminderAt}</p>
                    )}
                  </div>
                )}

                <div>
                  <label htmlFor="repeatType" className="block text-sm font-medium text-gray-700 mb-1.5 md:text-base lg:text-lg">
                    Repeat <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="repeatType"
                    className="input-field text-base md:text-lg"
                    value={repeatType}
                    onChange={(e) => setRepeatType(e.target.value)}
                  >
                    <option value="NONE">None</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1.5 md:text-base lg:text-lg">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="priority"
                    className="input-field text-base md:text-lg"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="pushNotification"
                    checked={pushNotification}
                    onChange={(e) => setPushNotification(e.target.checked)}
                    className="w-4 h-4 text-navy-900 rounded"
                  />
                  <span className="text-sm text-gray-700 md:text-base">Enable push notifications</span>
                </label>
              </div>
            </div>

            {/* Notes Section */}
            <div className="pb-6">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1.5 md:text-base lg:text-lg">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                placeholder="Add any additional notes..."
                className="input-field text-base md:text-lg resize-none"
                rows="4"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <PrimaryButton
                text={loading ? "Adding..." : "Add Reminder"}
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
                fullWidth
              />
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 px-6 py-3 bg-white text-navy-900 border-2 border-navy-900 rounded-lg font-semibold text-sm hover:bg-navy-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed md:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
