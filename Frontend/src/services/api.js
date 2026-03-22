import { API_BASE_URL } from "../utils/constants.js";
import { handleApiResponse, ApiError } from "../utils/error-handler.js";

/**
 * Centralized API client with consistent error handling
 */

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, defaultOptions);
  return handleApiResponse(response);
};

/**
 * USER ENDPOINTS
 */
export const userApi = {
  getCurrentUser: async () => {
    const response = await apiCall("/users/me");
    return response.json();
  },

  login: async (email, password) => {
    const response = await apiCall("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  signup: async (email, password, displayName) => {
    const response = await apiCall("/users/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, display_name: displayName }),
    });
    return response.json();
  },

  verify: async (email, code) => {
    const response = await apiCall("/users/verify", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
    return response.json();
  },

  logout: async () => {
    const response = await apiCall("/users/logout", {
      method: "POST",
    });
    return response.json();
  },

  forgotPassword: async (email) => {
    const response = await apiCall("/users/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return response.json();
  },

  resetPassword: async (email, code, newPassword) => {
    const response = await apiCall("/users/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, new_password: newPassword }),
    });
    return response.json();
  },

  updateProfile: async (displayName, email) => {
    const response = await apiCall("/users/update-profile", {
      method: "PUT",
      body: JSON.stringify({ display_name: displayName, email }),
    });
    return response.json();
  },
};

/**
 * REMINDER ENDPOINTS
 */
export const reminderApi = {
  getDashboard: async () => {
    const response = await apiCall("/reminders/dashboard");
    return response.json();
  },

  getById: async (uuid) => {
    const response = await apiCall(`/reminders/${uuid}`);
    return response.json();
  },

  create: async (reminderData) => {
    const response = await apiCall("/reminders/create", {
      method: "POST",
      body: JSON.stringify(reminderData),
    });
    return response.json();
  },

  update: async (uuid, reminderData) => {
    const response = await apiCall(`/reminders/${uuid}`, {
      method: "PUT",
      body: JSON.stringify(reminderData),
    });
    return response.json();
  },

  delete: async (uuid) => {
    const response = await apiCall(`/reminders/${uuid}`, {
      method: "DELETE",
    });
    return response.json();
  },

  searchByTitle: async (title) => {
    const response = await apiCall(`/reminders/search?title=${encodeURIComponent(title)}`);
    return response.json();
  },
};

/**
 * DOCUMENT ENDPOINTS
 */
export const documentApi = {
  list: async () => {
    const response = await apiCall("/documents/list");
    return response.json();
  },

  getById: async (uuid) => {
    const response = await apiCall(`/documents/${uuid}`);
    return response.json();
  },

  upload: async (formData) => {
    const response = await apiCall("/documents/upload", {
      method: "POST",
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it with boundary
    });
    return response.json();
  },

  update: async (uuid, documentData) => {
    const response = await apiCall(`/documents/${uuid}`, {
      method: "PUT",
      body: JSON.stringify(documentData),
    });
    return response.json();
  },

  delete: async (uuid) => {
    const response = await apiCall(`/documents/${uuid}`, {
      method: "DELETE",
    });
    return response.json();
  },

  download: async (uuid) => {
    const response = await apiCall(`/documents/${uuid}/download`);
    return response.blob();
  },

  convertImage: async (uuid, fileType) => {
    const response = await apiCall(`/documents/${uuid}/convert`, {
      method: "POST",
      body: JSON.stringify({ file_type: fileType }),
    });
    return response.json();
  },

  scanImage: async (uuid) => {
    const response = await apiCall(`/documents/${uuid}/scan-image`, {
      method: "POST",
    });
    return response.json();
  },

  cropImage: async (uuid, cropData) => {
    const response = await apiCall(`/documents/${uuid}/crop-image`, {
      method: "POST",
      body: JSON.stringify(cropData),
    });
    return response.json();
  },
};

/**
 * NOTIFICATION ENDPOINTS
 */
export const notificationApi = {
  requestPermission: async () => {
    if (!("Notification" in window)) {
      throw new Error("This browser does not support notifications");
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  },

  registerServiceWorker: async () => {
    if ("serviceWorker" in navigator) {
      try {
        await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        return true;
      } catch (error) {
        console.error("Service Worker registration failed:", error);
        return false;
      }
    }
    return false;
  },
};
