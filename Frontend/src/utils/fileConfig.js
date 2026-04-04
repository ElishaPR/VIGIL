// Shared file upload configuration
// Keep in sync with backend: Backend/app/modules/user/services/document_service.py

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Allowed MIME types - must match backend validation
export const ALLOWED_MIME_TYPES = [
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

// File extensions for accept attribute (must align with MIME types above)
export const ACCEPT_FILE_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.webp,.heic,.txt,.doc,.docx,.xls,.xlsx";

// Accept attribute for image inputs (camera capture)
export const ACCEPT_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/heic";
