import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { documentApi } from "../services/api.js";
import { documentValidators } from "../services/validation.js";
import { formatDateForInput, parseInputDate } from "../utils/date-utils.js";
import { useForm } from "../hooks/useForm.js";
import { PREDEFINED_CATEGORIES } from "../utils/constants.js";
import { LoadingState } from "../components/common/LoadingState.jsx";
import { ErrorAlert } from "../components/common/ErrorAlert.jsx";
import { SuccessAlert } from "../components/common/SuccessAlert.jsx";
import { Button } from "../components/common/Button.jsx";
import { FormInput } from "../components/common/FormInput.jsx";
import { FormSelect } from "../components/common/FormSelect.jsx";
import { FileUpload } from "../components/forms/FileUpload.jsx";

/**
 * Unified Document Form Page - handles both add and edit modes
 */
export function DocumentFormPage() {
  const navigate = useNavigate();
  const { id: documentId } = useParams();
  const isEditMode = !!documentId;

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [customCategory, setCustomCategory] = useState("");

  const form = useForm(
    {
      title: "",
      category: "",
      expiryDate: "",
    },
    {
      title: documentValidators.title,
      category: documentValidators.category,
      file: isEditMode ? () => "" : documentValidators.file, // File required only on add
    },
    handleSubmit
  );

  // Load existing document if editing
  useEffect(() => {
    if (isEditMode) {
      loadDocument();
    }
  }, [documentId]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      const doc = await documentApi.getById(documentId);

      form.resetFormWithValues({
        title: doc.doc_title || "",
        category: doc.doc_category || "",
        expiryDate: doc.expiry_date ? formatDateForInput(doc.expiry_date) : "",
      });

      // Set custom category if not predefined
      const PREDEFINED_IDS = PREDEFINED_CATEGORIES.map((c) => c.id);
      if (!PREDEFINED_IDS.includes(doc.doc_category)) {
        setCustomCategory(doc.doc_category);
      }
    } catch (err) {
      console.error("[v0] Failed to load document:", err);
      setError("Failed to load document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  async function handleSubmit(values) {
    try {
      setSubmitting(true);
      setError(null);

      // Validate file requirement for add mode
      if (!isEditMode && !uploadedFile) {
        setError("Please select a file to upload");
        return;
      }

      const finalCategory = customCategory || values.category;
      const documentData = {
        doc_title: values.title,
        doc_category: finalCategory,
        ...(values.expiryDate && { expiry_date: parseInputDate(values.expiryDate) }),
      };

      if (isEditMode) {
        await documentApi.update(documentId, documentData);
        setSuccess("Document updated successfully!");
      } else {
        // For add mode, upload the file
        if (!uploadedFile) {
          throw new Error("File is required");
        }

        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("title", values.title);
        formData.append("category", finalCategory);
        if (values.expiryDate) {
          formData.append("expiry_date", parseInputDate(values.expiryDate));
        }

        await documentApi.upload(formData);
        setSuccess("Document uploaded successfully!");
      }

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("[v0] Form submission error:", err);
      setError(err.message || "Failed to save document. Please try again.");

      // Handle field-level errors
      if (err.fieldErrors) {
        form.setFieldErrors(err.fieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const categoryOptions = [
    { value: "", label: "Select a category" },
    ...PREDEFINED_CATEGORIES.filter((c) => c.id !== "all").map((cat) => ({
      value: cat.id,
      label: cat.label,
    })),
  ];

  if (loading) {
    return <LoadingState message="Loading document..." fullScreen />;
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
            {isEditMode ? "Edit Document" : "Upload Document"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditMode
              ? "Update your document details"
              : "Store and track your important documents with optional expiry dates"}
          </p>
        </div>

        {/* Alerts */}
        {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}
        {success && <SuccessAlert message={success} />}

        {/* Form */}
        <form onSubmit={form.handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
          {/* Document Title */}
          <div className="mb-6">
            <FormInput
              label="Document Title"
              id="title"
              name="title"
              placeholder="e.g., Passport, Car Registration"
              value={form.values.title}
              onChangeValue={(value) => form.setFieldValue("title", value)}
              onBlur={form.handleBlur}
              error={form.touched.title && form.errors.title}
              required
              maxLength={200}
            />
          </div>

          {/* Category */}
          <div className="mb-6">
            <div className="space-y-3">
              {/* Predefined Categories */}
              <div>
                <label className="text-sm font-medium text-gray-700 md:text-base lg:text-lg mb-2 block">
                  Category
                  <span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {PREDEFINED_CATEGORIES.filter((cat) => cat.id !== "all").map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        form.setFieldValue("category", category.id);
                        setCustomCategory("");
                      }}
                      className={`flex items-center gap-2 p-2 rounded-lg border-2 transition-all text-sm ${
                        form.values.category === category.id && !customCategory
                          ? "border-navy-900 bg-navy-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={category.icon} />
                      </svg>
                      <span className="truncate">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Category */}
              <div>
                <label className="text-sm font-medium text-gray-700">Custom Category (Optional)</label>
                <FormInput
                  id="customCategory"
                  placeholder="Or enter a custom category name"
                  value={customCategory}
                  onChangeValue={(value) => {
                    setCustomCategory(value);
                    if (value) {
                      form.setFieldValue("category", "");
                    }
                  }}
                  maxLength={50}
                />
              </div>
            </div>

            {form.touched.category && form.errors.category && (
              <div className="flex items-start gap-1.5 mt-2">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-600 text-sm">{form.errors.category}</p>
              </div>
            )}
          </div>

          {/* Expiry Date (Optional) */}
          <div className="mb-6">
            <FormInput
              label="Expiry Date (Optional)"
              id="expiryDate"
              name="expiryDate"
              type="date"
              value={form.values.expiryDate}
              onChangeValue={(value) => form.setFieldValue("expiryDate", value)}
              onBlur={form.handleBlur}
              helperText="Leave empty if this document doesn't expire"
            />
          </div>

          {/* File Upload */}
          {!isEditMode && (
            <div className="mb-8">
              <FileUpload
                label="Select File to Upload"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                file={uploadedFile}
                onFileSelect={(file, error) => {
                  if (error) {
                    form.setFieldError("file", error);
                  } else {
                    setUploadedFile(file);
                    form.setFieldError("file", "");
                  }
                }}
                onFileRemove={() => {
                  setUploadedFile(null);
                  form.setFieldError("file", "");
                }}
                showPreview
                required
              />
            </div>
          )}

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
              {isEditMode ? "Update Document" : "Upload Document"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
