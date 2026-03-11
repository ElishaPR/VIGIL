import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/Auth/AuthLayout";
import { FormInput } from "../components/Auth/FormInput";
import { PrimaryButton } from "../components/Auth/PrimaryButton";
import { validateEmail } from "../utils/validators";

const OTP_LENGTH = 6;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password
  const [userEmailAddress, setUserEmailAddress] = useState("");
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errors, setErrors] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
    api: "",
  });
  const inputRefs = useRef([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (otp.join("").length === 6) {
      handleVerifyOtp(new Event("submit"));
    }
  }, [otp]);

  const updateError = (field, value) => {
    setErrors((prev) => ({ ...prev, [field]: value }));
  };

  // Step 1: Send Reset Code
  const handleSendResetCode = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(userEmailAddress);
    if (emailErr) {
      updateError("email", emailErr);
      return;
    }

    setLoading(true);
    updateError("api", "");

    try {
      const response = await fetch("http://localhost:8000/password-reset/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_address: userEmailAddress }),
      });
      const result = await response.json();

      if (response.ok) {
        setStep(2);
        setOtp(Array(OTP_LENGTH).fill(""));
        updateError("email", "");
      } else {
        updateError("api", result.detail || result.message || "Failed to send reset code. Please try again.");
      }
    } catch {
      updateError("api", "Server not connected. Try again...");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const focusInput = (index) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index].focus();
    }
  };

  const handleChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    updateError("otp", "");

    if (value && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      focusInput(index - 1);
    }
    if (e.key === "ArrowLeft" && index > 0) {
      focusInput(index - 1);
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pasted)) return;

    const digits = pasted.slice(0, OTP_LENGTH).split("");
    const newOtp = [...otp];
    digits.forEach((d, i) => {
      newOtp[i] = d;
    });
    setOtp(newOtp);
    updateError("otp", "");
    focusInput(Math.min(digits.length, OTP_LENGTH - 1));
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const code = otp.join("");

    if (code.length !== OTP_LENGTH) {
      updateError("otp", "Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);
    updateError("api", "");

    try {
      const response = await fetch("http://localhost:8000/password-reset/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_address: userEmailAddress,
          otp: code,
        }),
      });
      const result = await response.json();

      if (response.ok) {
        setStep(3);
        updateError("otp", "");
      } else {
        updateError("api", result.detail || result.message || "Verification failed. Please try again.");
      }
    } catch {
      updateError("api", "Server not connected. Try again...");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!newPassword) {
      errors.password = "Password is required.";
    } else if (newPassword.length < 8) {
      errors.password = "Password must be at least 8 characters.";
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

    setLoading(true);
    updateError("api", "");

    try {
      const response = await fetch("http://localhost:8000/password-reset/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_address: userEmailAddress,
          otp: otp.join(""),
          new_password: newPassword,
        }),
      });
      const result = await response.json();

      if (response.ok) {
        navigate("/login", { state: { passwordReset: true } });
      } else {
        updateError("api", result.detail || result.message || "Failed to reset password. Please try again.");
      }
    } catch {
      updateError("api", "Server not connected. Try again...");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    updateError("api", "");

    try {
      const response = await fetch("http://localhost:8000/password-reset/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_address: userEmailAddress }),
      });
      const result = await response.json();

      if (response.ok) {
        setOtp(Array(OTP_LENGTH).fill(""));
        setResendCooldown(60);
        focusInput(0);
      } else {
        updateError("api", result.detail || result.message || "Failed to resend code.");
      }
    } catch {
      updateError("api", "Server not connected. Try again...");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 animate-fade-in">
        {/* Step 1: Email */}
        {step === 1 && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
              <p className="text-sm text-gray-500">Enter your email to receive a reset code.</p>
            </div>

            {errors.api && (
              <div className="mb-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2.5">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{errors.api}</p>
              </div>
            )}

            <form onSubmit={handleSendResetCode} className="flex flex-col gap-5">
              <FormInput
                label="Email Address"
                id="resetEmail"
                type="email"
                placeholder="you@example.com"
                value={userEmailAddress}
                onChangeValue={(val) => {
                  setUserEmailAddress(val);
                  if (errors.email) updateError("email", "");
                }}
                onBlur={() => {
                  const err = validateEmail(userEmailAddress);
                  updateError("email", err);
                }}
                error={errors.email}
                required
              />

              <PrimaryButton
                text="Send Reset Code"
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
                fullWidth
              />
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
              <p className="text-sm text-gray-500">
                We sent a 6-digit code to
              </p>
              <p className="text-sm font-semibold text-navy-700 mt-1">{userEmailAddress}</p>
            </div>

            {errors.api && (
              <div className="mb-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2.5">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{errors.api}</p>
              </div>
            )}

            <form onSubmit={handleVerifyOtp}>
              <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-12 h-14 text-center text-xl font-semibold rounded-xl border-2 transition-all duration-200 focus:outline-none
                      ${errors.otp
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : digit
                          ? "border-navy-300 bg-navy-50 focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
                          : "border-gray-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
                      } text-gray-900`}
                    aria-label={`Digit ${index + 1}`}
                  />
                ))}
              </div>

              {errors.otp && (
                <div className="mb-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2.5">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-700">{errors.otp}</p>
                </div>
              )}

              <PrimaryButton
                text="Verify Code"
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
                fullWidth
              />
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                {"Didn't receive the code? "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading || resendCooldown > 0}
                  className="text-navy-700 font-semibold hover:text-navy-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading
                    ? "Sending..."
                    : resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend Code"}
                </button>
              </p>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp(Array(OTP_LENGTH).fill(""));
                }}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Back to Email
              </button>
            </div>
          </>
        )}

        {/* Step 3: Reset Password */}
        {step === 3 && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Set New Password</h1>
              <p className="text-sm text-gray-500">Create a strong password for your account.</p>
            </div>

            {errors.api && (
              <div className="mb-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2.5">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700">{errors.api}</p>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                  New Password <span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    placeholder="Min. 8 characters"
                    className={`input-field pr-10 ${errors.password ? "input-error" : ""}`}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (errors.password) updateError("password", "");
                    }}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-start gap-1.5">
                    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-600 text-sm">{errors.password}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5 w-full">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password <span className="text-red-500 ml-0.5">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="Re-enter your password"
                    className={`input-field pr-10 ${errors.confirmPassword ? "input-error" : ""}`}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) updateError("confirmPassword", "");
                    }}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="flex items-start gap-1.5">
                    <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
                  </div>
                )}
              </div>

              <PrimaryButton
                text="Reset Password"
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
                fullWidth
              />
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
