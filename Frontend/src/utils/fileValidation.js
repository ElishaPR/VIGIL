import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  ALLOWED_MIME_TYPES,
} from "./fileConfig.js";

/**
 * Validates a file for upload
 * @param {File} file - The file to validate
 * @returns {{valid: boolean, error?: string}} - Validation result
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Unsupported file type. Please upload an image, PDF, or document.",
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`,
    };
  }

  return { valid: true };
}

/**
 * Gets the file type category for display purposes
 * @param {string} mimeType - The MIME type of the file
 * @param {string} fileName - The file name (fallback for extension check)
 * @returns {string} - Category: 'image', 'pdf', 'document', 'spreadsheet', 'text', 'unknown'
 */
export function getFileTypeCategory(mimeType, fileName = "") {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "application/pdf") return "pdf";
  if (
    mimeType === "application/msword" ||
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "document";
  if (
    mimeType === "application/vnd.ms-excel" ||
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )
    return "spreadsheet";
  if (mimeType === "text/plain") return "text";

  // Fallback to extension check
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "heic"].includes(ext)) return "image";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "document";
  if (["xls", "xlsx"].includes(ext)) return "spreadsheet";
  if (ext === "txt") return "text";

  return "unknown";
}

/**
 * Checks if a file is an image
 * @param {File} file - The file to check
 * @returns {boolean}
 */
export function isImageFile(file) {
  return file?.type?.startsWith("image/");
}

/**
 * Formats file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Creates a file preview URL (for images)
 * @param {File} file - The image file
 * @returns {Promise<string>} - Data URL of the preview
 */
export function createFilePreview(file) {
  return new Promise((resolve, reject) => {
    if (!file || !isImageFile(file)) {
      resolve(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
