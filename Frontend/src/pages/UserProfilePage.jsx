import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FormInput } from "../components/Auth/FormInput";
import { PrimaryButton } from "../components/Auth/PrimaryButton";

export function UserProfilePage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    display_name: "",
    email_address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({
    api: "",
    displayName: "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  const updateError = (field, value) => {
    setErrors((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:8000/users/profile", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else if (response.status === 401) {
          navigate("/login");
        } else {
          updateError("api", "Failed to load user profile.");
        }
      } catch {
        updateError("api", "Server not connected. Try again...");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!userData.display_name.trim()) {
      updateError("displayName", "Display name is required.");
      return;
    }

    setSaving(true);
    updateError("api", "");
    setSuccessMessage("");

    try {
      const response = await fetch("http://localhost:8000/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          display_name: userData.display_name.trim(),
        }),
      });

      if (response.ok) {
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else if (response.status === 401) {
        navigate("/login");
      } else {
        const result = await response.json();
        updateError("api", result.detail || result.message || "Failed to update profile.");
      }
    } catch {
      updateError("api", "Server not connected. Try again...");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-200 border-t-navy-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-navy-700 hover:text-navy-900 transition-colors text-sm font-medium mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Profile</h1>
            <p className="text-lg text-gray-600">Manage your account information</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-start gap-2.5">
              <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {errors.api && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2.5">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{errors.api}</p>
            </div>
          )}

          {/* Avatar Section */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-navy-100 text-navy-700 rounded-full flex items-center justify-center font-bold text-2xl">
                {userData.display_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Profile Picture</p>
                <p className="text-base font-semibold text-gray-900">{userData.display_name}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-lg font-semibold text-gray-900 mb-2">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                placeholder="Your full name"
                className={`input-field ${errors.displayName ? "input-error" : ""}`}
                value={userData.display_name}
                onChange={(e) => {
                  setUserData((prev) => ({ ...prev, display_name: e.target.value }));
                  if (errors.displayName) updateError("displayName", "");
                }}
                required
              />
              {errors.displayName && (
                <div className="flex items-start gap-1.5 mt-2">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 text-sm">{errors.displayName}</p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-lg font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={userData.email_address}
                disabled
                className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-sm text-gray-500 mt-2">Email cannot be changed. Contact support if needed.</p>
            </div>

            {/* Submit Button */}
            <div className="pt-6 flex gap-3">
              <PrimaryButton
                text="Save Changes"
                type="submit"
                variant="primary"
                loading={saving}
                disabled={saving}
                fullWidth
              />
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 px-6 py-3 bg-white text-navy-900 border-2 border-navy-900 rounded-lg font-semibold text-sm hover:bg-navy-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Danger Zone</h2>
            <p className="text-sm text-gray-600 mb-4">These actions cannot be undone.</p>
            <button
              onClick={() => {
                if (confirm("Are you sure you want to log out from all devices?")) {
                  // Logout implementation would go here
                }
              }}
              className="px-6 py-3 bg-red-50 text-red-700 border-2 border-red-200 rounded-lg font-semibold text-sm hover:bg-red-100 transition-colors"
            >
              Log Out from All Devices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
