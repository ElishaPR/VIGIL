/**
 * Unified error handling for API responses
 */

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.status = status;
    this.data = data;
    this.isValidationError = false;
    this.fieldErrors = {};
  }
}

/**
 * Parse API error responses and return user-friendly messages
 */
export const parseApiError = (error) => {
  if (!error) {
    return {
      message: "An unknown error occurred. Please try again.",
      type: "unknown",
      fieldErrors: {},
    };
  }

  // Network error
  if (error instanceof TypeError) {
    return {
      message: "Unable to connect to server. Please check your internet connection.",
      type: "network",
      fieldErrors: {},
    };
  }

  // ApiError instance
  if (error instanceof ApiError) {
    return {
      message: error.message,
      type: error.status >= 500 ? "server" : error.status >= 400 ? "validation" : "unknown",
      status: error.status,
      fieldErrors: error.fieldErrors,
    };
  }

  // Generic error object
  return {
    message: error.message || "An error occurred. Please try again.",
    type: "unknown",
    fieldErrors: {},
  };
};

/**
 * Handle API response errors consistently
 */
export const handleApiResponse = async (response) => {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    
    const error = new ApiError(
      data.detail || `Request failed: ${response.statusText}`,
      response.status,
      data
    );

    // Parse validation errors from backend
    if (response.status === 422 && data.detail) {
      error.isValidationError = true;
      
      if (Array.isArray(data.detail)) {
        data.detail.forEach((err) => {
          const fieldPath = err.loc?.[1] || "general";
          error.fieldErrors[fieldPath] = err.msg || "Invalid value";
        });
      }
    }

    throw error;
  }

  return response;
};

/**
 * User-friendly error messages for common scenarios
 */
export const getErrorMessage = (error, context = "") => {
  const parsed = parseApiError(error);

  // Specific error messages based on context
  if (context === "login" && error?.status === 401) {
    return "Invalid email or password.";
  }

  if (context === "signup" && error?.status === 409) {
    return "This email is already registered.";
  }

  if (context === "file" && error?.status === 413) {
    return "File is too large. Maximum size is 10MB.";
  }

  if (context === "reminder" && error?.status === 404) {
    return "Reminder not found.";
  }

  // Default message
  return parsed.message;
};
