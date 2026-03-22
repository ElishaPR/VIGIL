/**
 * Validation utilities for forms
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password requirements
const PASSWORD_MIN_LENGTH = 8;

/**
 * Validators for authentication fields
 */
export const authValidators = {
  email: (value) => {
    if (!value || value.trim() === "") {
      return "Email is required";
    }
    if (!EMAIL_REGEX.test(value)) {
      return "Please enter a valid email address";
    }
    return "";
  },

  password: (value) => {
    if (!value) {
      return "Password is required";
    }
    if (value.length < PASSWORD_MIN_LENGTH) {
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }
    return "";
  },

  confirmPassword: (value, compareValue) => {
    if (!value) {
      return "Please confirm your password";
    }
    if (value !== compareValue) {
      return "Passwords do not match";
    }
    return "";
  },

  displayName: (value) => {
    if (!value || value.trim() === "") {
      return "Name is required";
    }
    if (value.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    if (value.trim().length > 100) {
      return "Name must be less than 100 characters";
    }
    return "";
  },
};

/**
 * Validators for reminder fields
 */
export const reminderValidators = {
  title: (value) => {
    if (!value || value.trim() === "") {
      return "Reminder title is required";
    }
    if (value.trim().length > 200) {
      return "Title must be less than 200 characters";
    }
    return "";
  },

  category: (value) => {
    if (!value || value.trim() === "") {
      return "Please select a category";
    }
    return "";
  },

  customCategory: (value) => {
    if (value && value.trim().length > 50) {
      return "Category name must be less than 50 characters";
    }
    return "";
  },

  priority: (value) => {
    const validPriorities = ["low", "medium", "high"];
    if (!value || !validPriorities.includes(value)) {
      return "Please select a valid priority";
    }
    return "";
  },

  expiryDate: (value) => {
    if (!value) {
      return "Expiry date is required";
    }

    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return "Expiry date must be in the future";
    }

    return "";
  },

  reminderTime: (value) => {
    if (!value || value.trim() === "") {
      return "Please select a reminder time";
    }
    return "";
  },

  description: (value) => {
    if (value && value.length > 1000) {
      return "Description must be less than 1000 characters";
    }
    return "";
  },
};

/**
 * Validators for document fields
 */
export const documentValidators = {
  title: (value) => {
    if (!value || value.trim() === "") {
      return "Document title is required";
    }
    if (value.trim().length > 200) {
      return "Title must be less than 200 characters";
    }
    return "";
  },

  category: (value) => {
    if (!value || value.trim() === "") {
      return "Please select a category";
    }
    return "";
  },

  file: (file) => {
    if (!file) {
      return "Please select a file";
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return "File size must be less than 10MB";
    }

    // Allowed types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(file.type)) {
      return "File type not supported. Please upload an image, PDF, or document file.";
    }

    return "";
  },

  expiryDate: (value) => {
    if (!value) return ""; // Optional field

    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return "Expiry date must be in the future";
    }

    return "";
  },
};

/**
 * Create a custom validator that checks a required field
 */
export const createRequiredValidator = (fieldName) => {
  return (value) => {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return `${fieldName} is required`;
    }
    return "";
  };
};

/**
 * Create a custom validator for minimum length
 */
export const createMinLengthValidator = (fieldName, minLength) => {
  return (value) => {
    if (value && value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters`;
    }
    return "";
  };
};

/**
 * Create a custom validator for maximum length
 */
export const createMaxLengthValidator = (fieldName, maxLength) => {
  return (value) => {
    if (value && value.length > maxLength) {
      return `${fieldName} must be less than ${maxLength} characters`;
    }
    return "";
  };
};

/**
 * Combine multiple validators for a single field
 */
export const combineValidators = (...validators) => {
  return (value) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return "";
  };
};
