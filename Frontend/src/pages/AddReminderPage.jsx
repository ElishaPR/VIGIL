import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { messaging } from "../firebase";
import { getToken, deleteToken } from "firebase/messaging";
import { PrimaryButton } from "../components/Auth/PrimaryButton";

// Category options
const CATEGORY_OPTIONS = [
  { id: "travel", label: "Travel", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { id: "medical", label: "Medical", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
  { id: "vehicle", label: "Vehicle", icon: "M8 17h8M8 17v4h8v-4M8 17H6a2 2 0 01-2-2V9a2 2 0 012-2h1l1.5-3h7L17 7h1a2 2 0 012 2v6a2 2 0 01-2 2h-2M7 13h.01M17 13h.01" },
  { id: "bills", label: "Bills & Subscriptions", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
  { id: "housing", label: "Housing & Property", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "insurance", label: "Insurance", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
];

// Priority options with flag colors
const PRIORITY_OPTIONS = [
  { id: "high", label: "High", color: "text-red-500", bgColor: "bg-red-50", borderColor: "border-red-200", selectedBg: "bg-red-100" },
  { id: "medium", label: "Medium", color: "text-amber-500", bgColor: "bg-amber-50", borderColor: "border-amber-200", selectedBg: "bg-amber-100" },
  { id: "low", label: "Low", color: "text-green-500", bgColor: "bg-green-50", borderColor: "border-green-200", selectedBg: "bg-green-100" },
];

// Repeat type options
const REPEAT_OPTIONS = [
  { id: "none", label: "None" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

const MAX_FILE_SIZE_MB = 10;

// Convert date (yyyy-mm-dd) to UTC ISO
const toUTCISOString = (dateStr, time = "09:00:00") => {
  const local = new Date(`${dateStr}T${time}`);
  return local.toISOString().replace("Z", "+00:00"); // Fix for Python 3.10 fromisoformat
};

export function AddReminderPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
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
  const [pushNotification, setPushNotification] = useState(false);
  const [priority, setPriority] = useState("medium");
  const [notes, setNotes] = useState("");

  // File state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [cropSettings, setCropSettings] = useState({ x: 0, y: 0, width: 100, height: 100 });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showUploadOptions, setShowUploadOptions] = useState(false);

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

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get selected category label
  const getSelectedCategoryLabel = () => {
    if (isCustomCategory) return customCategory || "Select category";
    const found = CATEGORY_OPTIONS.find((c) => c.id === docCategory);
    return found ? found.label : "Select category";
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
    setShowUploadOptions(false);
  };

  // Handle camera capture
  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file, true);
    }
    setShowUploadOptions(false);
  };

  // Process the selected file
  const processFile = (file, openCrop = false) => {
    // Validate file type
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
      updateError("file", "Unsupported file type. Please upload an image, PDF, or document.");
      return;
    }

    // Check file size (10MB max)
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      updateError("file", "File size exceeds 10MB limit.");
      return;
    }

    clearError("file");
    setUploadedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
        if (openCrop) {
          setCropImage(e.target.result);
          setShowCropModal(true);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  // Remove uploaded file
  const removeFile = () => {
    setUploadedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // Apply crop
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
          const croppedFile = new File([blob], uploadedFile?.name || "cropped-image.jpg", {
            type: "image/jpeg",
          });
          setUploadedFile(croppedFile);
          setFilePreview(canvas.toDataURL("image/jpeg"));
        }
        setShowCropModal(false);
        setCropImage(null);
      }, "image/jpeg");
    };
    img.src = cropImage;
  }, [cropImage, cropSettings, uploadedFile]);

  // Convert image to PDF
  const convertToPDF = async () => {
    if (!filePreview || !uploadedFile?.type.startsWith("image/")) return;

    // This is a simple approach - for production, use a proper PDF library
    updateError("api", "PDF conversion is processing...");
    setTimeout(() => {
      clearError("api");
      setSuccessMessage("Note: For full PDF conversion, the server will process the image.");
    }, 1000);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Category validation
    const finalCategory = isCustomCategory ? customCategory.trim() : docCategory;
    if (!finalCategory) {
      newErrors.category = "Document category is required.";
    } else if (finalCategory.length > 25) {
      newErrors.category = "Category must be 25 characters or less.";
    }

    // Title validation
    if (!reminderTitle.trim()) {
      newErrors.title = "Reminder title is required.";
    } else if (reminderTitle.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters.";
    } else if (reminderTitle.trim().length > 100) {
      newErrors.title = "Title must be 100 characters or less.";
    }



    // Expiry Date validation
    if (!expiryDate) {
      newErrors.expiryDate = "Expiry date is required.";
    } else {
      const expiry = new Date(`${expiryDate}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiry < today) {
        newErrors.expiryDate = "Expiry date cannot be in the past.";
      }
    }

    // Custom reminder date validation
    if (scheduleType === "custom") {
      if (!reminderAt) {
        newErrors.reminderAt = "Reminder date is required.";
      } else {
        const selectedDate = new Date(`${reminderAt}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
          newErrors.reminderAt = "Reminder date cannot be in the past.";
        }
        
        if (expiryDate) {
          const expiry = new Date(`${expiryDate}T00:00:00`);
          if (selectedDate > expiry) {
            newErrors.reminderAt = "Reminder must be before or on expiry date.";
          }
        }
      }
    }


    // Notes validation
    if (notes.trim().length > 500) {
      newErrors.notes = "Notes must be 500 characters or less.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      updateError("api", "Please fill in all required fields correctly.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    clearError("api");
    setSuccessMessage("");

    try {
      const formData = new FormData();

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      formData.append("timezone", timezone);

      const finalCategory = isCustomCategory ? customCategory.trim() : docCategory;

      formData.append("category", finalCategory);
      formData.append("title", reminderTitle.trim());

      formData.append("repeat_type", repeatType);
      formData.append("priority", priority);
      formData.append("expiry_date", expiryDate);
      formData.append("schedule_type", scheduleType.toUpperCase());

      // Only send custom date if selected
      if (scheduleType === "custom" && reminderAt) {
        const reminderUtc = toUTCISOString(reminderAt);
        formData.append("reminder_at", reminderUtc);
      }
      
      formData.append("enable_push", pushNotification ? "true" : "false");

      if (notes.trim()) {
        formData.append("notes", notes.trim());
      }

      if (uploadedFile) {
        formData.append("document", uploadedFile);
      }

      // ---------------- PUSH NOTIFICATIONS ----------------
      if (pushNotification) {

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
          setLoading(false);
          return;
        }
      }

      // ---------------- API CALL ----------------
      const response = await fetch("http://localhost:8000/reminders/create", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage("Reminder created successfully!");
        setTimeout(() => {
          setLoading(true);
          navigate("/dashboard");
        }, 1500);
      } else {
        updateError("api", result.detail || result.message || "Failed to create reminder.");
      }

    } catch {
      updateError("api", "Server not connected. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // Reset form
  const handleReset = () => {
    setDocCategory("");
    setCustomCategory("");
    setIsCustomCategory(false);
    setReminderTitle("");
    setExpiryDate("");
    setScheduleType("default");
    setReminderAt("");
    setRepeatType("none");
    setPushNotification(false);
    setPriority("medium");
    setNotes("");
    removeFile();
    setErrors({});
    setSuccessMessage("");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Page Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full border-4 border-navy-200 border-t-navy-600 animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700 font-semibold">Saving reminder...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => {
                setLoading(true);
                navigate("/dashboard");
              }}
              disabled={loading}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Add Reminder</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errors.api && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{errors.api}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {/* Document Category Section */}
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

          {/* Reminder Details Section */}
          <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Reminder Details
            </h2>

            <div className="space-y-5">
              {/* Reminder Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Reminder Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reminderTitle}
                  onChange={(e) => {
                    setReminderTitle(e.target.value);
                    const value = e.target.value.trim();
                    if (value.length > 0 && value.length < 3) {
                      updateError("title", "Title must be at least 3 characters.");
                    } else if (value.length > 100) {
                      updateError("title", "Title must be 100 characters or less.");
                    } else {
                      clearError("title");
                    }
                  }}
                  onBlur={() => {
                    const value = reminderTitle.trim();
                    if (!value) {
                      updateError("title", "Reminder title is required.");
                    } else if (value.length < 3) {
                      updateError("title", "Title must be at least 3 characters.");
                    } else if (value.length > 100) {
                      updateError("title", "Title must be 100 characters or less.");
                    } else {
                      clearError("title");
                    }
                  }}
                  placeholder="e.g., Passport Renewal"
                  maxLength={100}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.title ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-navy-500 focus:ring-navy-500/20"
                  } focus:ring-2 outline-none transition-all text-gray-900 placeholder-gray-400`}
                />
                <div className="flex justify-between mt-1">
                  {errors.title ? (
                    <p className="text-red-600 text-sm flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                      </svg>
                      {errors.title}
                    </p>
                  ) : (
                    <span></span>
                  )}
                  <p className="text-xs text-gray-500">{reminderTitle.length}/100</p>
                </div>
              </div>
1:            </div>
            {/* End Reminder Title */}
            
            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                min={getMinDate()}
                onChange={(e) => {
                  setExpiryDate(e.target.value);
                  if (!e.target.value) {
                    clearError("expiryDate");
                    return;
                  }
                  const expiry = new Date(e.target.value + "T00:00:00");
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (expiry < today) {
                    updateError("expiryDate", "Expiry date cannot be in the past.");
                  } else {
                    clearError("expiryDate");
                    // Validate custom reminder vs expiry
                    if (scheduleType === "custom" && reminderAt) {
                      const reminder = new Date(reminderAt + "T00:00:00");
                      if (reminder > expiry) {
                        updateError("reminderAt", "Reminder must be before or on expiry date.");
                      } else {
                        clearError("reminderAt");
                      }
                    }
                  }
                }}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.expiryDate ? "border-red-300" : "border-gray-300"
                } focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 outline-none transition-all text-gray-900 bg-white`}
              />
              {errors.expiryDate && (
                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                  </svg>
                  {errors.expiryDate}
                </p>
              )}
            </div>
            
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Reminder Schedule
            </h2>
            
            <div className="flex bg-gray-100 p-1 rounded-xl w-full mb-6">
              <button
                type="button"
                onClick={() => setScheduleType("default")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  scheduleType === "default" ? "bg-white text-navy-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Default Schedule
              </button>
              <button
                type="button"
                onClick={() => setScheduleType("custom")}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  scheduleType === "custom" ? "bg-white text-navy-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Custom Schedule
              </button>
            </div>

            {scheduleType === "default" && (
              <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Default Schedule Active</h4>
                    <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                      Reminders will be sent <span className="font-semibold">1 day prior</span> to the expiry date at 9:00 AM.
                    </p>
                    <p className="text-xs text-blue-600/80 mt-2 italic">
                      Note: If expiry is today, you'll be notified shortly.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {scheduleType === "custom" && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Custom Reminder Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={reminderAt}
                  min={getMinDate()}
                  max={expiryDate || undefined}
                  onChange={(e) => {
                    setReminderAt(e.target.value);
                    if (!e.target.value) {
                      clearError("reminderAt");
                      return;
                    }
                    const reminder = new Date(e.target.value + "T00:00:00");
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    if (reminder < now) {
                      updateError("reminderAt", "Reminder date cannot be in the past.");
                    } else if (expiryDate && reminder > new Date(expiryDate + "T00:00:00")) {
                      updateError("reminderAt", "Reminder must be before or on expiry date.");
                    } else {
                      clearError("reminderAt");
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.reminderAt ? "border-red-300" : "border-gray-300"
                  } focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 outline-none transition-all text-gray-900 bg-white`}
                />
                {errors.reminderAt && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                    </svg>
                      {errors.reminderAt}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Repeat Type Section */}
            <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Repeat Type
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {REPEAT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setRepeatType(option.id)}
                    className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                      repeatType === option.id
                        ? "border-navy-500 bg-navy-50 text-navy-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </section>

          {/* Priority & Notifications Section */}
          <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
              Priority & Notifications
            </h2>

            {/* Priority Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Priority Level</label>
              <div className="flex gap-3">
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPriority(option.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                      priority === option.id
                        ? `${option.borderColor} ${option.selectedBg} ${option.color}`
                        : `border-gray-200 text-gray-600 hover:border-gray-300`
                    }`}
                  >
                    <svg className={`w-5 h-5 ${priority === option.id ? option.color : "text-gray-400"}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                      <line x1="4" y1="22" x2="4" y2="15" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Push Notification Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-500">Get notified on your device</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPushNotification(!pushNotification)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  pushNotification ? "bg-navy-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    pushNotification ? "translate-x-5" : ""
                  }`}
                ></div>
              </button>
            </div>
          </section>

          {/* Notes Section */}
          <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Notes (Optional)
            </h2>

            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (e.target.value.length > 500) {
                  updateError("notes", "Notes must be 500 characters or less.");
                } else {
                  clearError("notes");
                }
              }}
              onBlur={() => {
                if (notes.trim().length > 500) {
                  updateError("notes", "Notes must be 500 characters or less.");
                } else {
                  clearError("notes");
                }
              }}
              placeholder="Add any additional notes or details..."
              rows={4}
              maxLength={500}
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.notes ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:border-navy-500 focus:ring-navy-500/20"
              } focus:ring-2 outline-none transition-all text-gray-900 placeholder-gray-400 resize-none`}
            />
            <div className="flex justify-between mt-1">
              {errors.notes ? (
                <p className="text-red-600 text-sm">{errors.notes}</p>
              ) : (
                <span></span>
              )}
              <p className="text-xs text-gray-500">{notes.length}/500</p>
            </div>
          </section>

          {/* File Upload Section */}
          <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Document <span className="text-red-500">(Optional)</span>
            </h2>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCameraCapture}
              className="hidden"
            />
            
            {/* File naming input - shown when file is selected */}
            {uploadedFile && (
              <div className="mb-4 p-4 bg-navy-50 rounded-xl border border-navy-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={uploadedFile.displayName || uploadedFile.name.split('.')[0]}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setUploadedFile({
                        ...uploadedFile,
                        displayName: newName,
                      });
                    }}
                    placeholder="Enter file name"
                    className="flex-1 px-3 py-2 rounded-lg border border-navy-300 focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 outline-none transition-all text-gray-900 text-sm"
                  />
                  <span className="text-xs text-gray-500 pt-2.5">.{uploadedFile.name.split('.').pop()}</span>
                </div>
              </div>
            )}

            {!uploadedFile ? (
              <div className="relative space-y-4">
                {/* Mobile/Tablet Upload Options */}
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    errors.file ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-navy-400 hover:bg-navy-50/50"
                  }`}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium mb-1">Upload your document</p>
                  <p className="text-sm text-gray-500 mb-6 font-medium">
                    Allowed: Images, PDF, Word, Excel (Max 10MB)
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-950 transition-colors min-h-[44px]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Choose From Device
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white border-2 border-navy-900 text-navy-900 rounded-lg font-medium hover:bg-navy-50 transition-colors min-h-[44px]"
              >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Open Camera
                    </button>
                  </div>
                </div>

                {/* Desktop QR Code Option */}
                {typeof window !== 'undefined' && window.innerWidth >= 768 && (
                  <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center bg-blue-50/50">
                    <p className="text-sm text-blue-700 font-medium mb-3">Mobile Device?</p>
                    <p className="text-xs text-blue-600 mb-4">
                      Scan this QR code with your phone to upload directly from mobile
                    </p>
                    <div className="w-32 h-32 mx-auto bg-white border-2 border-blue-300 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-8 h-8 mx-auto text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="text-xs text-blue-600">QR Code</span>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-3">
                      (QR code feature coming soon)
                    </p>
                  </div>
                )}

                {errors.file && uploadedFile === null && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                    </svg>
                    {errors.file}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-navy-50 to-blue-50 rounded-xl p-6 border border-navy-200">
                <div className="flex items-start gap-4">
                  {/* File Preview */}
                  {filePreview ? (
                    <div className="relative w-28 h-28 rounded-lg overflow-hidden border-2 border-navy-300 flex-shrink-0 shadow-md">
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-28 h-28 rounded-lg bg-gradient-to-br from-navy-100 to-navy-50 flex items-center justify-center flex-shrink-0 border-2 border-navy-200">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-navy-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-xs text-navy-600 font-medium">{uploadedFile.name.split('.').pop().toUpperCase()}</span>
                      </div>
                    </div>
                  )}

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{uploadedFile.displayName || uploadedFile.name.split('.')[0]}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {uploadedFile.type || 'File'}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5 font-medium">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>

                    {/* File Actions */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {filePreview && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setCropImage(filePreview);
                              setShowCropModal(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-navy-700 bg-navy-100 rounded-lg hover:bg-navy-200 transition-colors min-h-[40px]"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 10h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Crop
                          </button>
                          <button
                            type="button"
                            onClick={convertToPDF}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors min-h-[40px]"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Convert to PDF
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors min-h-[40px]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={removeFile}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors min-h-[40px]"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Action Buttons - Fixed at bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:p-6 z-20">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
              <PrimaryButton
                text={loading ? "Saving..." : "Save Reminder"}
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
                fullWidth
              />
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  navigate("/dashboard");
                }}
                disabled={loading}
                className="flex-1 px-6 py-3 sm:py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 min-h-[44px] sm:min-h-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="flex-1 px-6 py-3 sm:py-3 bg-white text-red-600 border-2 border-red-200 rounded-lg font-semibold text-sm hover:bg-red-50 transition-colors disabled:opacity-50 min-h-[44px] sm:min-h-auto"
              >
                Reset
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Crop Modal */}
      {showCropModal && cropImage && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Crop Image</h3>
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setCropImage(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4">
              <div className="relative bg-gray-100 rounded-xl overflow-hidden mb-4" style={{ maxHeight: "400px" }}>
                <img
                  src={cropImage}
                  alt="Crop preview"
                  className="max-w-full max-h-[400px] mx-auto object-contain"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Position X: {cropSettings.x}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={100 - cropSettings.width}
                    value={cropSettings.x}
                    onChange={(e) => setCropSettings((prev) => ({ ...prev, x: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Position Y: {cropSettings.y}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={100 - cropSettings.height}
                    value={cropSettings.y}
                    onChange={(e) => setCropSettings((prev) => ({ ...prev, y: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Width: {cropSettings.width}%
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={cropSettings.width}
                    onChange={(e) => setCropSettings((prev) => ({ ...prev, width: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height: {cropSettings.height}%
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={cropSettings.height}
                    onChange={(e) => setCropSettings((prev) => ({ ...prev, height: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setCropImage(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={applyCrop}
                className="flex-1 px-4 py-3 bg-navy-900 text-white rounded-lg font-medium hover:bg-navy-950 transition-colors min-h-[44px]"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
