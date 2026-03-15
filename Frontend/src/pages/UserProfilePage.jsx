import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { validateEmail } from "../utils/validators";

const OTP_LENGTH = 6;

export function UserProfilePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState("main"); // main, changeEmail, changePassword
  const [userData, setUserData] = useState({
    display_name: "",
    email_address: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Change Email State
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [emailStep, setEmailStep] = useState(1); // 1: Email, 2: OTP
  const emailInputRefs = useRef([]);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Display Name State
  const [displayName, setDisplayName] = useState("");

  // UI State
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:8000/users/me", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setDisplayName(data.display_name);
        } else if (response.status === 401) {
          navigate("/login");
        } else {
          setErrors({ api: "Failed to load user profile." });
        }
      } catch {
        setErrors({ api: "Server not connected. Try again..." });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const updateError = (field, value) => {
    setErrors((prev) => ({ ...prev, [field]: value }));
  };

  // Update Display Name
  const handleUpdateDisplayName = async (e) => {
    e.preventDefault();

    if (!displayName.trim()) {
      updateError("displayName", "Display name is required.");
      return;
    }

    setSaving(true);
    updateError("api", "");
    setSuccessMessage("");

    try {
      const response = await fetch("http://localhost:8000/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ display_name: displayName.trim() }),
      });

      if (response.ok) {
        setUserData((prev) => ({ ...prev, display_name: displayName.trim() }));
        setSuccessMessage("Display name updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else if (response.status === 401) {
        navigate("/login");
      } else {
        const result = await response.json();
        updateError("api", result.detail || "Failed to update display name.");
      }
    } catch {
      updateError("api", "Server not connected. Try again...");
    } finally {
      setSaving(false);
    }
  };

  // Email OTP handlers
  const focusEmailInput = (index) => {
    if (emailInputRefs.current[index]) {
      emailInputRefs.current[index].focus();
    }
  };

  const handleEmailOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...emailOtp];
    newOtp[index] = value;
    setEmailOtp(newOtp);
    updateError("emailOtp", "");

    if (value && index < OTP_LENGTH - 1) {
      focusEmailInput(index + 1);
    }
  };

  const handleEmailOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !emailOtp[index] && index > 0) {
      focusEmailInput(index - 1);
    }
    if (e.key === "ArrowLeft" && index > 0) {
      focusEmailInput(index - 1);
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusEmailInput(index + 1);
    }
  };

  // Send Email Change Code
  const handleSendEmailCode = async (e) => {
    e.preventDefault();

    const emailErr = validateEmail(newEmail);
    if (emailErr) {
      updateError("email", emailErr);
      return;
    }

    if (newEmail === userData.email_address) {
      updateError("email", "This is your current email.");
      return;
    }

    setSaving(true);
    updateError("api", "");

    try {
      const response = await fetch("http://localhost:8000/users/change-email/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ new_email: newEmail }),
      });

      if (response.ok) {
        setEmailStep(2);
        setEmailOtp(Array(OTP_LENGTH).fill(""));
        updateError("email", "");
      } else {
        const result = await response.json();
        updateError("api", result.detail || "Failed to send verification code.");
      }
    } catch {
      updateError("api", "Server not connected. Try again...");
    } finally {
      setSaving(false);
    }
  };

  // Verify Email OTP
  const handleVerifyEmailOtp = async (e) => {
    e.preventDefault();
    const code = emailOtp.join("");

    if (code.length !== OTP_LENGTH) {
      updateError("emailOtp", "Please enter the complete 6-digit code.");
      return;
    }

    setSaving(true);
    updateError("api", "");

    try {
      const response = await fetch("http://localhost:8000/users/change-email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ new_email: newEmail, otp: code }),
      });

      if (response.ok) {
        setUserData((prev) => ({ ...prev, email_address: newEmail }));
        setSuccessMessage("Email changed successfully!");
        setStep("main");
        setEmailStep(1);
        setNewEmail("");
        setEmailOtp(Array(OTP_LENGTH).fill(""));
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const result = await response.json();
        updateError("api", result.detail || "Verification failed.");
      }
    } catch {
      updateError("api", "Server not connected. Try again...");
    } finally {
      setSaving(false);
    }
  };

  // Resend Email OTP
  const handleResendEmailOtp = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    updateError("api", "");

    try {
      const response = await fetch("http://localhost:8000/users/change-email/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ new_email: newEmail }),
      });

      if (response.ok) {
        setEmailOtp(Array(OTP_LENGTH).fill(""));
        setResendCooldown(60);
        focusEmailInput(0);
      } else {
        const result = await response.json();
        updateError("api", result.detail || "Failed to resend code.");
      }
    } catch {
      updateError("api", "Server not connected. Try again...");
    } finally {
      setResendLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!currentPassword) {
      errors.currentPassword = "Current password is required.";
    }

    if (!newPassword) {
      errors.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setErrors((prev) => ({ ...prev, ...errors }));
      return;
    }

    setSaving(true);
    updateError("api", "");

    try {
      const response = await fetch("http://localhost:8000/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (response.ok) {
        setSuccessMessage("Password changed successfully!");
        setStep("main");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const result = await response.json();
        updateError("api", result.detail || "Failed to change password.");
      }
    } catch {
      updateError("api", "Server not connected. Try again...");
    } finally {
      setSaving(false);
    }
  };

  // Logout all devices
  const handleLogoutAllDevices = async () => {
    if (!confirm("Are you sure you want to log out from all devices? You'll need to sign in again.")) return;

    setSaving(true);
    updateError("api", "");

    try {
      const response = await fetch("http://localhost:8000/users/logout-all", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        navigate("/login");
      } else {
        updateError("api", "Failed to log out from all devices.");
      }
    } catch {
      updateError("api", "Server not connected. Try again...");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-200 border-t-navy-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Change Email Form
  if (step === "changeEmail") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <button
            onClick={() => {
              setStep("main");
              setEmailStep(1);
              setNewEmail("");
              setEmailOtp(Array(OTP_LENGTH).fill(""));
              setErrors({});
            }}
            className="flex items-center gap-2 text-navy-700 hover:text-navy-900 transition-colors text-sm font-medium mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {emailStep === 1 ? (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Change Email</h1>
                <p className="text-sm text-gray-500">Enter your new email address</p>
              </div>

              {errors.api && (
                <div className="mb-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{errors.api}</p>
                </div>
              )}

              <form onSubmit={handleSendEmailCode} className="flex flex-col gap-5">
                <div>
                  <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    id="newEmail"
                    placeholder="newemail@example.com"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      if (errors.email) updateError("email", "");
                    }}
                    className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none ${errors.email ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-navy-500"}`}
                  />
                  {errors.email && <p className="text-sm text-red-600 mt-2">{errors.email}</p>}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-navy-900 text-white py-3 rounded-xl font-semibold hover:bg-navy-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Sending..." : "Send Verification Code"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Email</h1>
                <p className="text-sm text-gray-500">Enter the 6-digit code sent to {newEmail}</p>
              </div>

              {errors.api && (
                <div className="mb-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{errors.api}</p>
                </div>
              )}

              <form onSubmit={handleVerifyEmailOtp} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Verification Code</label>
                  <div className="flex gap-2 justify-center">
                    {emailOtp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (emailInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleEmailOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleEmailOtpKeyDown(index, e)}
                        className={`w-12 h-12 text-center text-lg font-semibold rounded-lg border-2 transition-colors focus:outline-none ${errors.emailOtp ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-navy-500"}`}
                      />
                    ))}
                  </div>
                  {errors.emailOtp && <p className="text-sm text-red-600 mt-2">{errors.emailOtp}</p>}
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-navy-900 text-white py-3 rounded-xl font-semibold hover:bg-navy-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Verifying..." : "Verify Email"}
                </button>

                <button
                  type="button"
                  onClick={handleResendEmailOtp}
                  disabled={resendCooldown > 0 || resendLoading}
                  className="text-navy-700 text-sm font-medium hover:text-navy-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Didn't receive code? Resend"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  // Change Password Form
  if (step === "changePassword") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <button
            onClick={() => {
              setStep("main");
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setErrors({});
            }}
            className="flex items-center gap-2 text-navy-700 hover:text-navy-900 transition-colors text-sm font-medium mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Change Password</h1>
            <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
          </div>

          {errors.api && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2.5">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{errors.api}</p>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="flex flex-col gap-5">
            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (errors.currentPassword) updateError("currentPassword", "");
                  }}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none pr-10 ${errors.currentPassword ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-navy-500"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showCurrentPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.currentPassword && <p className="text-sm text-red-600 mt-2">{errors.currentPassword}</p>}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) updateError("newPassword", "");
                  }}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none pr-10 ${errors.newPassword ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-navy-500"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showNewPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.newPassword && <p className="text-sm text-red-600 mt-2">{errors.newPassword}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) updateError("confirmPassword", "");
                  }}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none pr-10 ${errors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-navy-500"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-600 mt-2">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-navy-900 text-white py-3 rounded-xl font-semibold hover:bg-navy-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Main Profile Page
  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
            <p className="text-lg text-gray-600">Manage your account information and security</p>
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
                <p className="text-sm text-gray-500 mb-1">Profile</p>
                <p className="text-base font-semibold text-gray-900">{userData.display_name}</p>
              </div>
            </div>
          </div>

          {/* Display Name Section */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Display Name</h2>
            <form onSubmit={handleUpdateDisplayName} className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (errors.displayName) updateError("displayName", "");
                  }}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-colors focus:outline-none ${errors.displayName ? "border-red-500 bg-red-50" : "border-gray-200 focus:border-navy-500"}`}
                />
                {errors.displayName && <p className="text-sm text-red-600 mt-2">{errors.displayName}</p>}
              </div>
              <button
                type="submit"
                disabled={saving || displayName === userData.display_name}
                className="px-6 py-3 bg-navy-900 text-white rounded-xl font-semibold hover:bg-navy-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </form>
          </div>

          {/* Email Section */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Email Address</h2>
                <p className="text-sm text-gray-500 mt-1">{userData.email_address}</p>
              </div>
              <button
                onClick={() => {
                  setStep("changeEmail");
                  setEmailStep(1);
                  setNewEmail("");
                  setErrors({});
                }}
                className="px-4 py-2 border-2 border-navy-900 text-navy-900 rounded-lg font-semibold hover:bg-navy-50 transition-colors text-sm"
              >
                Change Email
              </button>
            </div>
          </div>

          {/* Password Section */}
          <div className="mb-12 pb-8 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Password</h2>
              <button
                onClick={() => {
                  setStep("changePassword");
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setErrors({});
                }}
                className="px-4 py-2 border-2 border-navy-900 text-navy-900 rounded-lg font-semibold hover:bg-navy-50 transition-colors text-sm"
              >
                Change Password
              </button>
            </div>
            <p className="text-sm text-gray-500">Keep your account secure by using a strong password</p>
          </div>

          {/* Danger Zone */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Danger Zone</h2>
            <p className="text-sm text-gray-600 mb-4">These actions cannot be undone.</p>
            <button
              onClick={handleLogoutAllDevices}
              disabled={saving}
              className="px-6 py-3 bg-red-50 text-red-700 border-2 border-red-200 rounded-lg font-semibold hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Logging out..." : "Log Out from All Devices"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
