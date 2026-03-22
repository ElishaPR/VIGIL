import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { reminderApi } from "../services/api.js";
import { reminderValidators } from "../services/validation.js";
import { formatDateForInput, parseInputDate, getMinimumDate } from "../utils/date-utils.js";
import { useForm } from "../hooks/useForm.js";
import { LoadingState } from "../components/common/LoadingState.jsx";
import { ErrorAlert } from "../components/common/ErrorAlert.jsx";
import { SuccessAlert } from "../components/common/SuccessAlert.jsx";
import { Button } from "../components/common/Button.jsx";
import { FormInput } from "../components/common/FormInput.jsx";
import { FormTextarea } from "../components/common/FormTextarea.jsx";
import { FormSelect } from "../components/common/FormSelect.jsx";
import { CategorySelector } from "../components/forms/CategorySelector.jsx";
import { PrioritySelector } from "../components/forms/PrioritySelector.jsx";
import { FileUpload } from "../components/forms/FileUpload.jsx";

/**
 * Unified Reminder Form Page - handles both add and edit modes
 */
export function ReminderFormPage() {
  const navigate = useNavigate();
  const { id: reminderId } = useParams();
  const isEditMode = !!reminderId;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [customCategory, setCustomCategory] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  const form = useForm(
    {
      title: "",
      category: "",
      priority: "medium",
      expiryDate: "",
      reminderTime: "09:00",
      notes: "",
    },
    {
      title: reminderValidators.title,
      category: reminderValidators.category,
      priority: reminderValidators.priority,
      expiryDate: reminderValidators.expiryDate,
    },
    handleSubmit
  );

  // Load existing reminder if editing
  useEffect(() => {
    if (isEditMode) {
      loadReminder();
    }
  }, [reminderId]);

  const loadReminder = async () => {
    try {
      setLoading(true);
      setError(null);
      const reminder = await reminderApi.getById(reminderId);

      form.resetFormWithValues({
        title: reminder.title || "",
        category: reminder.category || "",
        priority: reminder.priority || "medium",
        expiryDate: formatDateForInput(reminder.expiryDate) || "",
        reminderTime: reminder.reminder_at?.substring(11, 16) || "09:00",
        notes: reminder.notes || "",
      });

      // Set custom category if it's not predefined
      const PREDEFINED_IDS = ["travel", "medical", "vehicle", "bills", "housing", "insurance"];
      if (!PREDEFINED_IDS.includes(reminder.category)) {
        setCustomCategory(reminder.category);
      }
    } catch (err) {
      console.error("[v0] Failed to load reminder:", err);
      setError("Failed to load reminder. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  async function handleSubmit(values) {
    try {
      setSubmitting(true);
      setError(null);

      const finalCategory = customCategory || values.category;

      const reminderData = {
        title: values.title,
        category: finalCategory,
        priority: values.priority,
        expiryDate: parseInputDate(values.expiryDate),
        reminderAt: `${values.expiryDate}T${values.reminderTime}:00`,
        notes: values.notes || null,
      };

      // Handle file upload if provided
      if (uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("title", values.title);
        formData.append("category", finalCategory);

        const docResult = await reminderApi.api.documentApi.upload(formData);
        reminderData.documentUuid = docResult.doc_uuid;
      }

      if (isEditMode) {
        await reminderApi.update(reminderId, reminderData);
        setSuccess("Reminder updated successfully!");
      } else {
        await reminderApi.create(reminderData);
        setSuccess("Reminder created successfully!");
      }

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("[v0] Form submission error:", err);
      setError(err.message || "Failed to save reminder. Please try again.");

      // Handle field-level errors
      if (err.fieldErrors) {
        form.setFieldErrors(err.fieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState message="Loading reminder..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Reminder" : "Create New Reminder"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditMode ? "Update your reminder details below" : "Set up a new reminder to track important dates"}
          </p>
        </div>

        {/* Alerts */}
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
        {success && <SuccessAlert message={success} />}

        {/* Form */}
        <form onSubmit={form.handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          {/* Title */}
          <div className="mb-6">
            <FormInput
              label="Reminder Title"
              id="title"
              name="title"
              placeholder="e.g., Car Insurance Renewal"
              value={form.values.title}
              onChangeValue={(value) => form.setFieldValue("title", value)}
              onBlur={form.handleBlur}
              error={form.touched.title && form.errors.title}
              required
              maxLength={200}
            />
          </div>

          {/* Category Selection */}
          <div className="mb-6">
            <CategorySelector
              value={form.values.category}
              onChange={(e) => form.setFieldValue("category", e.target.value)}
              error={form.touched.category && form.errors.category}
              onBlur={form.handleBlur}
              customValue={customCategory}
              onCustomChange={setCustomCategory}
              required
            />
          </div>

          {/* Priority */}
          <div className="mb-6">
            <PrioritySelector
              value={form.values.priority}
              onChange={(e) => form.setFieldValue("priority", e.target.value)}
              error={form.touched.priority && form.errors.priority}
              onBlur={form.handleBlur}
              required
            />
          </div>

          {/* Expiry Date */}
          <div className="mb-6">
            <FormInput
              label="Expiry Date"
              id="expiryDate"
              name="expiryDate"
              type="date"
              value={form.values.expiryDate}
              onChangeValue={(value) => form.setFieldValue("expiryDate", value)}
              onBlur={form.handleBlur}
              error={form.touched.expiryDate && form.errors.expiryDate}
              required
            />
          </div>

          {/* Reminder Time */}
          <div className="mb-6">
            <FormInput
              label="Reminder Time"
              id="reminderTime"
              name="reminderTime"
              type="time"
              value={form.values.reminderTime}
              onChangeValue={(value) => form.setFieldValue("reminderTime", value)}
              onBlur={form.handleBlur}
              helperText="We'll notify you at this time on the expiry date"
            />
          </div>

          {/* Notes */}
          <div className="mb-6">
            <FormTextarea
              label="Additional Notes"
              id="notes"
              name="notes"
              placeholder="Add any important details or instructions..."
              value={form.values.notes}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              rows={4}
              maxLength={1000}
              helperText="Optional: Add details about this reminder"
            />
          </div>

          {/* File Upload */}
          <div className="mb-8">
            <FileUpload
              label="Attach Document (Optional)"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              file={uploadedFile}
              onFileSelect={(file, error) => {
                if (error) {
                  setError(error);
                } else {
                  setUploadedFile(file);
                  setError(null);
                }
              }}
              onFileRemove={() => setUploadedFile(null)}
              showPreview
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate("/dashboard")}
              disabled={form.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={form.isSubmitting}
            >
              {isEditMode ? "Update Reminder" : "Create Reminder"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
