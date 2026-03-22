/**
 * Date utility functions for consistent formatting and logic
 */

/**
 * Format date to readable string
 */
export const formatDate = (dateString, format = "short") => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; // Invalid date
  
  const options = {
    short: { day: "numeric", month: "short", year: "numeric" },
    long: { day: "numeric", month: "long", year: "numeric" },
    full: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
    time: { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" },
  };

  return date.toLocaleDateString("en-IN", options[format] || options.short);
};

/**
 * Get days until date
 */
export const daysUntil = (dateString) => {
  if (!dateString) return null;
  
  const now = new Date();
  const expiryDate = new Date(dateString);
  
  const diffTime = expiryDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Determine status based on expiry date
 */
export const getStatus = (expiryDateString) => {
  if (!expiryDateString) return "active";
  
  const days = daysUntil(expiryDateString);
  
  if (days < 0) return "expired";
  if (days <= 7) return "expiring"; // Expiring within 7 days
  return "active";
};

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
};

/**
 * Parse date from input field to ISO string
 */
export const parseInputDate = (inputValue) => {
  if (!inputValue) return null;
  
  const date = new Date(inputValue);
  return date.toISOString();
};

/**
 * Get human readable relative time (e.g., "in 2 days", "3 days ago")
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return "";
  
  const days = daysUntil(dateString);
  
  if (days < 0) {
    return `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} ago`;
  }
  
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  
  return `in ${days} day${days !== 1 ? "s" : ""}`;
};

/**
 * Check if date is valid
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Check if date is in the past
 */
export const isPastDate = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  
  return date < now;
};

/**
 * Get minimum date for input (today)
 */
export const getMinimumDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
};
