import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getToken, deleteToken } from "firebase/messaging";
import { messaging } from "../firebase"; // wherever you defined it

const CATEGORY_OPTIONS = [
  { id: "travel", label: "Travel", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0110.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "medical", label: "Medical", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { id: "vehicle", label: "Vehicle", icon: "M8 17h8M8 17v4h8v-4M8 17H6a2 2 0 01-2-2V9a2 2 0 012-2h1l1.5-3h7L17 7h1a2 2 0 012 2v6a2 2 0 01-2 2h-2M7 13h.01M17 13h.01" },
  { id: "bills", label: "Bills & Subscriptions", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
  { id: "housing", label: "Housing & Property", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "insurance", label: "Insurance", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
];

const PRIORITY_OPTIONS = [
  { id: "high", label: "High", color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-200", selectedBg: "bg-red-100" },
  { id: "medium", label: "Medium", color: "text-amber-500", bgColor: "bg-amber-50", borderColor: "border-amber-200", selectedBg: "bg-amber-100" },
  { id: "low", label: "Low", color: "text-green-500", bgColor: "bg-green-50", borderColor: "border-green-200", selectedBg: "bg-green-100" },
];

const REPEAT_OPTIONS = [
  { id: "none", label: "None" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

// Convert date (yyyy-mm-dd) to LOCAL ISO (no Z)
const toUTCISOString = (dateStr, time = "09:00:00") => {
  const local = new Date(`${dateStr}T${time}`);
  return local.toISOString().replace("Z", "+00:00"); // Fix for Python 3.10 fromisoformat
};

// Convert UTC → local date (yyyy-mm-dd) for input fields
const toLocalDateInput = (utcString) => {
  const date = new Date(utcString);
  const pad = (n) => String(n).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export function EditReminderPage() {
  const navigate = useNavigate();
  const { id: reminderUuid } = useParams();
  const canvasRef = useRef(null);

  // Form state
  const [docCategory, setDocCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [reminderTitle, setReminderTitle] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [scheduleType, setScheduleType] = useState("default");
  const [reminderAt, setReminderAt] = useState("");
  const [repeatType, setRepeatType] = useState("none");
  const [priority, setPriority] = useState("medium");
  const [initialPushNotification, setInitialPushNotification] = useState(false);
  const [pushNotification, setPushNotification] = useState(false);
  const [emailNotification, setEmailNotification] = useState(true);
  const [notes, setNotes] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [cropSettings, setCropSettings] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [removeExistingFile, setRemoveExistingFile] = useState(false);
  const [fileType, setFileType] = useState(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  // Fetch reminder data on mount
  useEffect(() => {
    const fetchReminder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/reminders/${reminderUuid}`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          // B2 fix: use correct field names from backend
          setReminderTitle(data.reminder_title || "");
          setExpiryDate(data.expiry_date ? data.expiry_date.split("T")[0] : "");
          setDocCategory(data.category || "");
          setPriority(data.priority || "medium");
          setPushNotification(data.push_notification ?? false);
          setInitialPushNotification(data.push_notification ?? false);
          setEmailNotification(data.email_notification ?? true);
          setNotes(data.notes || "");
          setScheduleType(data.schedule_type || "default");
          setRepeatType(data.repeat_type || "none");

          if (data.reminder_at) {
            setReminderAt(toLocalDateInput(data.reminder_at));
          }

          if (!CATEGORY_OPTIONS.find((c) => c.id === data.category)) {
            setIsCustomCategory(true);
            setCustomCategory(data.category || "");
          }

          // Set file preview if document exists
          if (data.document_url) {
            setFilePreview(data.document_url);

            if (data.document_url.endsWith(".pdf")) {
              setFileType("pdf");
            } else {
              setFileType("image");
            }
          }
        } else {
          updateError("api", "Failed to load reminder");
        }
      } catch (err) {
        console.error("Error fetching reminder:", err);
        updateError("api", "Server not connected");
      } finally {
        setLoading(false);
      }
    };

    fetchReminder();
  }, [reminderUuid]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (!allowedTypes.includes(file.type)) {
        updateError("file", "Unsupported file type.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        updateError("file", "File size exceeds 10MB.");
        return;
      }

      setUploadedFile(file);
      setRemoveExistingFile(false);
      if (file.type.startsWith("image/")) {
        setFileType("image");

        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);

      } else if (file.type === "application/pdf") {
        setFileType("pdf");
        setFilePreview(URL.createObjectURL(file));
      }
      clearError("file");
    }
  };

  const applyCrop = useCallback(() => {
    if (!cropImage || !canvasRef.current) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const scaleX = img.width / 100;
      const scaleY = img.height / 100;

      const cropX = cropSettings.x * scaleX;
      const cropY = cropSettings.y * scaleY;
      const cropWidth = cropSettings.width * scaleX;
      const cropHeight = cropSettings.height * scaleY;

      canvas.width = cropWidth;
      canvas.height = cropHeight;

      ctx.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], "cropped-image.jpg", { type: "image/jpeg" });
          setUploadedFile(croppedFile);
          setFilePreview(canvas.toDataURL("image/jpeg"));
        }
        setShowCropModal(false);
        setCropImage(null);
      }, "image/jpeg");
    };
    img.src = cropImage;
  }, [cropImage, cropSettings]);

  const validateForm = () => {
    const newErrors = {};

    const finalCategory = isCustomCategory ? customCategory.trim() : docCategory;
    if (!finalCategory) {
      newErrors.category = "Document category is required.";
    } else if (finalCategory.length > 25) {
      newErrors.category = "Category must be 25 characters or less.";
    }

    if (!reminderTitle.trim()) {
      newErrors.title = "Reminder title is required.";
    } else if (reminderTitle.trim().length < 3 || reminderTitle.trim().length > 100) {
      newErrors.title = "Title must be between 3 and 100 characters.";
    }

    if (!expiryDate) {
      newErrors.expiryDate = "Expiry date is required.";
    } else {
      const expiry = new Date(`${expiryDate}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiry < today) {
        newErrors.expiryDate = "Expiry date must be in the future.";
      }
    }

    if (scheduleType === "custom") {
      if (!reminderAt) {
        newErrors.reminderAt = "Reminder date is required.";
      } else {
        const reminder = new Date(`${reminderAt}T00:00:00`);
        const expiry = new Date(`${expiryDate}T00:00:00`);
        const now = new Date();
        now.setHours(0,0,0,0);

        if (reminder < now) {
          newErrors.reminderAt = "Reminder date cannot be in the past.";
        }

        if (reminder > expiry) {
          newErrors.reminderAt = "Reminder must be before or on expiry date.";
        }
      }
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
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    clearError("api");
    setSuccessMessage("");

    try {
      const formData = new FormData();

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      formData.append("timezone", timezone);

      const finalCategory = isCustomCategory ? customCategory.trim() : docCategory;

      formData.append("category", finalCategory);
      // F2 fix: field name must match backend PUT schema
      formData.append("reminder_title", reminderTitle.trim());
      // F3 fix: send date only as YYYY-MM-DD, not ISO with time
      if (expiryDate) formData.append("expiry_date", expiryDate);

      formData.append("schedule_type", scheduleType);
      formData.append("repeat_type", repeatType);
      formData.append("priority", priority);
      formData.append("enable_push", pushNotification ? "true" : "false");
      formData.append("email_notification", emailNotification ? "true" : "false");
      const pushJustEnabled = !initialPushNotification && pushNotification;
      if (pushJustEnabled) {

        let permission = Notification.permission;

        if (permission !== "granted") {
          permission = await Notification.requestPermission();
        }

        if (permission === "granted") {

          const registration = await navigator.serviceWorker.ready;

          try {
            await deleteToken(messaging);
          } catch {
            console.log("No previous token");
          }

          const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FIREBASE_PUBLIC_VAPID_KEY,
            serviceWorkerRegistration: registration
          });

          if (token) {
            await fetch("http://localhost:8000/fcm/register", {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                fcm_token: token
              })
            });
          }

        } else {
          updateError("api", "Push notification permission denied.");
          setPushNotification(false);
          setSaving(false);
          return;
        }
      }

      if (scheduleType === "custom" && reminderAt) {
        formData.append("reminder_at", toUTCISOString(reminderAt, "09:00:00"));
      }

      if (notes.trim()) {
        formData.append("notes", notes.trim());
      }

      if (uploadedFile) {
        formData.append("document", uploadedFile);
      }
      formData.append("remove_document", removeExistingFile ? "true" : "false");

      const response = await fetch(`http://localhost:8000/reminders/${reminderUuid}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage("Reminder updated successfully!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        updateError("api", result.detail || result.message || "Failed to update reminder.");
      }

    } catch {
      updateError("api", "Server not connected. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-200 border-t-navy-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reminder...</p>
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
            <p className="text-gray-700 font-semibold">Updating reminder...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-lg font-semibold text-gray-900">Edit Reminder</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
        {errors.api && (
          <div className="mb-4 text-red-600 text-sm">
            {errors.api}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 text-green-600 text-sm">
            {successMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Category Section */}
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Enter Custom Category
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                    const value = e.target.value.trim();
                    if (value && value.length <= 25) {
                      clearError("category");
                    } else if (value.length > 25) {
                      updateError("category", "Category must be 25 characters or less.");
                    }
                  }}
                  onBlur={() => {
                    const value = customCategory.trim();
                    if (!value) {
                      updateError("category", "Document category is required.");
                    } else if (value.length > 25) {
                      updateError("category", "Category must be 25 characters or less.");
                    } else {
                      clearError("category");
                    }
                  }}
                  placeholder="e.g., Contracts, Certificates"
                  maxLength={25}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.category ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-navy-500 focus:ring-navy-500/20"
                  } focus:ring-2 outline-none transition-all text-gray-900 placeholder-gray-400`}
                />
                <p className="text-xs text-gray-500 mt-1">{customCategory.length}/25 characters</p>
              </div>
            )}

            {errors.category && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                </svg>
                {errors.category}
              </p>
            )}
          </section>

          {/* Reminder Details */}
          <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reminder Details</h2>

            <div className="space-y-4">
              <input
                type="text"
                value={reminderTitle}
                onChange={(e) => {
                  const value = e.target.value;
                  setReminderTitle(value);

                  if (!value.trim()) {
                    updateError("title", "Reminder title is required.");
                  } else if (value.trim().length < 3) {
                    updateError("title", "Title must be at least 3 characters.");
                  } else if (value.trim().length > 100) {
                    updateError("title", "Title must be 100 characters or less.");
                  } else {
                    clearError("title");
                  }
                }}
                placeholder="Reminder title"
                className={`w-full px-4 py-3 rounded-xl border ${errors.title ? "border-red-300" : "border-gray-300"} focus:border-navy-500 outline-none`}
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}

              <input
                type="date"
                value={expiryDate}
                min={getMinDate()}
                onChange={(e) => {
                  const value = e.target.value;
                  setExpiryDate(value);

                  if (reminderAt && new Date(reminderAt) >= new Date(value)) {
                    setReminderAt("");
                  }
                }}
                className={`w-full px-4 py-3 rounded-xl border ${errors.expiryDate ? "border-red-300" : "border-gray-300"} focus:border-navy-500 outline-none`}
              />
              {errors.expiryDate && (
                <p className="text-red-600 text-sm mt-1">{errors.expiryDate}</p>
              )}
            </div>
          </section>

          {/* Schedule */}
          <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>

            <select
              value={scheduleType}
              onChange={(e) => {
                const value = e.target.value;
                setScheduleType(value);

                if (value === "default") {
                  setReminderAt("");
                  setRepeatType("none");
                  clearError("reminderAt");
                }
              }}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-navy-500 outline-none"
            >
              <option value="default">Default</option>
              <option value="custom">Custom</option>
            </select>

            {scheduleType === "custom" && (
              <div className="mt-4">
                <input
                  type="date"
                  value={reminderAt}
                  min={getMinDate()}
                  max={expiryDate || undefined}
                  onChange={(e) => setReminderAt(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.reminderAt ? "border-red-300" : "border-gray-300"} focus:border-navy-500 outline-none`}
                />
                {errors.reminderAt && (
                  <p className="text-red-600 text-sm mt-1">{errors.reminderAt}</p>
                )}
              </div>
            )}
          </section>

          {/* Repeat + Priority */}
          <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Options</h2>

            <select
              value={repeatType}
              onChange={(e) => setRepeatType(e.target.value)}
              className="w-full mb-4 px-4 py-3 rounded-xl border border-gray-300 focus:border-navy-500 outline-none"
            >
              {REPEAT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-navy-500 outline-none"
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </section>

          {/* Notifications */}
          <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-800">Push Notifications</span>
                  <p className="text-xs text-gray-500 mt-0.5">Requires at least one notification method</p>
                </div>
                <button type="button" onClick={() => setPushNotification(!pushNotification)} className={`w-12 h-6 rounded-full transition-colors ${pushNotification ? "bg-navy-600" : "bg-gray-300"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${pushNotification ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-800">Email Notifications</span>
                  <p className="text-xs text-gray-500 mt-0.5">Receive reminder via email</p>
                </div>
                <button type="button" onClick={() => setEmailNotification(!emailNotification)} className={`w-12 h-6 rounded-full transition-colors ${emailNotification ? "bg-navy-600" : "bg-gray-300"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${emailNotification ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              {!pushNotification && !emailNotification && (
                <p className="text-xs text-red-500">At least one notification method must be enabled.</p>
              )}
            </div>
          </section>

          {/* Notes */}
          <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes"
              rows="4"
              className={`w-full px-4 py-3 rounded-xl border ${errors.notes ? "border-red-300" : "border-gray-300"} focus:border-navy-500 outline-none`}
            />
            {errors.notes && (
              <p className="text-red-600 text-sm mt-1">{errors.notes}</p>
            )}
          </section>

          {/* Document */}
          <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Document</h2>

            {filePreview && (
              <div className="mb-4">
                {fileType === "image" && (
                  <img
                    src={filePreview}
                    alt="Document preview"
                    className="max-w-full rounded-lg mb-2"
                  />
                )}

                {fileType === "pdf" && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">PDF Preview</p>
                    <iframe
                      src={filePreview}
                      className="w-full h-64 border rounded-lg"
                      title="PDF Preview"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setFilePreview(null);
                    setUploadedFile(null);
                    setRemoveExistingFile(true);
                    setFileType(null); 
                  }}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove file
                </button>
              </div>
            )}

            <input type="file" onChange={handleFileSelect} />
          </section>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-navy-900 text-white rounded-xl font-semibold hover:bg-navy-950"
            >
              Update Reminder
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex-1 px-6 py-3 bg-white text-navy-900 border-2 border-navy-900 rounded-xl font-semibold hover:bg-navy-50"
            >
              Cancel
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}