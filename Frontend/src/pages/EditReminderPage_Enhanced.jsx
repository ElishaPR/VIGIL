import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getToken, deleteToken } from "firebase/messaging";
import { messaging } from "../firebase";
import { PrimaryButton } from "../components/Auth/PrimaryButton";
import DocumentPreview from "../components/DocumentPreview";

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

const MAX_FILE_SIZE_MB = 10;

// Convert date (yyyy-mm-dd) to UTC ISO using given time string (HH:mm)
const toUTCISOString = (dateStr, time = "09:00:00") => {
  const local = new Date(`${dateStr}T${time}`);
  return local.toISOString().replace("Z", "+00:00");
};

// Convert UTC → local date string (yyyy-mm-dd) for date inputs
const toLocalDateInput = (utcString) => {
  const d = new Date(utcString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function EditReminderPage() {
  const navigate = useNavigate();
  const { id: reminderUuid } = useParams();
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
  const [priority, setPriority] = useState("medium");
  const [initialPushNotification, setInitialPushNotification] = useState(false);
  const [pushNotification, setPushNotification] = useState(false);
  const [notes, setNotes] = useState("");
  const [filePreview, setFilePreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [cropSettings, setCropSettings] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [removeExistingFile, setRemoveExistingFile] = useState(false);
  const [fileType, setFileType] = useState(null);
  const [existingDocumentUuid, setExistingDocumentUuid] = useState(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
          setDocCategory(data.category || "");
          setPriority(data.priority || "medium");
          setPushNotification(data.push_notification ?? false);
          setInitialPushNotification(data.push_notification ?? false);
          setNotes(data.notes || "");
          setRepeatType(data.repeat_type || "none");

          if (data.expiry_date) {
            setExpiryDate(toLocalDateInput(data.expiry_date));
          }
          if (data.schedule_type) {
            setScheduleType(data.schedule_type.toLowerCase() === "custom" ? "custom" : "default");
          }

          if (data.reminder_at) {
            setReminderAt(toLocalDateInput(data.reminder_at));
          }

          if (!CATEGORY_OPTIONS.find((c) => c.id === data.category)) {
            setIsCustomCategory(true);
            setCustomCategory(data.category || "");
          }

          // Set document info if document exists
          if (data.document_url && data.document_name) {
            setFilePreview(data.document_url);
            setExistingDocumentUuid(data.document_url.split('/').pop()); // Extract UUID from URL
            
            // Set file type based on document name
            if (data.document_name.endsWith(".pdf")) {
              setFileType("pdf");
            } else if (data.document_name.endsWith(".docx") || data.document_name.endsWith(".doc")) {
              setFileType("docx");
            } else if (data.document_name.endsWith(".xlsx") || data.document_name.endsWith(".xls")) {
              setFileType("xlsx");
            } else if (data.document_name.endsWith(".txt")) {
              setFileType("txt");
            } else if (data.document_name.match(/\.(jpg|jpeg|png|webp|heic)$/i)) {
              setFileType("image");
            } else {
              setFileType("file");
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

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      updateError("file", "File size exceeds 10MB limit.");
      return;
    }

    clearError("file");
    setUploadedFile(file);
    setRemoveExistingFile(true); // Treat new upload as a replacement

    // Set file type based on MIME type
    if (file.type.startsWith("image/")) {
      setFileType("image");
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
        if (openCrop) {
          setCropImage(e.target.result);
          setShowCropModal(true);
        }
      };
      reader.readAsDataURL(file);
    } else if (file.type === "application/pdf") {
      setFileType("pdf");
      setFilePreview(null);
    } else if (file.type.includes("word")) {
      setFileType("docx");
      setFilePreview(null);
    } else if (file.type.includes("excel")) {
      setFileType("xlsx");
      setFilePreview(null);
    } else if (file.type === "text/plain") {
      setFileType("txt");
      setFilePreview(null);
    } else {
      setFileType("file");
      setFilePreview(null);
    }
  };

  // Remove uploaded file
  const removeFile = () => {
    setUploadedFile(null);
    setFilePreview(null);
    setRemoveExistingFile(true);
    setFileType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // Remove existing document
  const removeExistingDocument = () => {
    setExistingDocumentUuid(null);
    setFilePreview(null);
    setFileType(null);
    setRemoveExistingFile(true);
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

    try {
      const formData = new FormData();

      // Add form fields
      formData.append("timezone", "UTC");
      formData.append("category", isCustomCategory ? customCategory.trim() : docCategory);
      formData.append("title", reminderTitle.trim());
      formData.append("repeat_type", repeatType);
      formData.append("priority", priority);
      formData.append("expiry_date", expiryDate);
      formData.append("schedule_type", scheduleType === "default" ? "DEFAULT" : "CUSTOM");
      
      if (reminderAt) {
        formData.append("reminder_at", toUTCISOString(reminderAt, "09:00:00"));
      }

      formData.append("enable_push", pushNotification ? "true" : "false");
      formData.append("email_notification", "true");

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

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage("Reminder updated successfully!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        const errorData = await response.json();
        updateError("api", errorData.detail || "Failed to update reminder");
      }
    } catch (err) {
      console.error("Error updating reminder:", err);
      updateError("api", "Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getMinDate = () => {
    const today = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-200 border-t-navy-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading reminder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Edit Reminder</h1>
            </div>
            <PrimaryButton
              onClick={handleSubmit}
              disabled={saving}
              className="min-h-[44px] px-6"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Save Changes</span>
                </div>
              )}
            </PrimaryButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2m-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-green-800 font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.api && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span className="text-red-800 font-medium">{errors.api}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Document Preview Section */}
          {existingDocumentUuid && !uploadedFile && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Current Document
              </h2>
              <DocumentPreview 
                documentUuid={existingDocumentUuid} 
                onRemove={removeExistingDocument}
              />
            </div>
          )}

          {/* File Upload Section */}
          <section className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Document <span className="text-gray-500">(Optional)</span>
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
            
            {/* File naming input - shown when file is selected recently */}
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

            {!filePreview ? (
              <div className="relative space-y-4">
                {/* Upload Area */}
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

                {errors.file && !filePreview && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                    </svg>
                    {errors.file}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-navy-50 to-blue-50 rounded-xl p-6 border border-navy-200 mt-4">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  {/* File Preview */}
                  <div className="relative w-full sm:w-28 h-32 sm:h-28 rounded-lg overflow-hidden border-2 border-navy-300 flex-shrink-0 shadow-md bg-white flex items-center justify-center">
                    {fileType === "pdf" ? (
                      <div className="text-center w-full">
                        <svg className="w-12 h-12 text-navy-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-xs text-navy-600 font-medium block">PDF</span>
                      </div>
                    ) : fileType === "docx" ? (
                      <div className="text-center w-full">
                        <svg className="w-12 h-12 text-blue-500 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,12L12,14L17,9"/>
                        </svg>
                        <span className="text-xs text-blue-600 font-medium block">DOCX</span>
                      </div>
                    ) : fileType === "xlsx" ? (
                      <div className="text-center w-full">
                        <svg className="w-12 h-12 text-green-500 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M8,12H16V14H8V12M8,16H10V18H8V16M12,16H14V18H12V16M16,16H18V18H16V16Z"/>
                        </svg>
                        <span className="text-xs text-green-600 font-medium block">XLSX</span>
                      </div>
                    ) : fileType === "txt" ? (
                      <div className="text-center w-full">
                        <svg className="w-12 h-12 text-gray-500 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M8,12H16V14H8V12M8,16H13V18H8V16Z"/>
                        </svg>
                        <span className="text-xs text-gray-600 font-medium block">TXT</span>
                      </div>
                    ) : (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* File Info & Actions */}
                  <div className="flex-1 min-w-0 w-full">
                    <p className="font-semibold text-gray-900 truncate">
                      {uploadedFile ? (uploadedFile.displayName || uploadedFile.name) : "Current Document"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {fileType === "pdf" ? "PDF Document" : 
                       fileType === "docx" ? "Word Document" :
                       fileType === "xlsx" ? "Excel Spreadsheet" :
                       fileType === "txt" ? "Text File" : "Image File"}
                    </p>
                    
                    {uploadedFile && (
                      <p className="text-sm text-gray-600 mt-0.5 font-medium">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3 w-full">
                      {fileType !== "pdf" && uploadedFile && (
                        <button
                          type="button"
                          onClick={() => {
                            setCropImage(filePreview);
                            setShowCropModal(true);
                          }}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-navy-700 bg-navy-100 rounded-lg hover:bg-navy-200 transition-colors min-h-[40px]"
                        >
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 10h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">Crop</span>
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={removeFile}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors min-h-[40px]"
                      >
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="truncate">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Other form sections would go here... */}
          {/* For brevity, I'm showing just the document upload section */}
        </form>
      </main>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Image</h3>
            <div className="relative mb-4">
              <img
                src={cropImage}
                alt="Crop preview"
                className="w-full h-auto rounded-lg"
              />
              {/* Crop overlay would go here */}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowCropModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyCrop}
                className="px-4 py-2 bg-navy-600 text-white rounded-lg hover:bg-navy-700 transition-colors"
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
