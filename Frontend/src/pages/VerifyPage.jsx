import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthLayout } from "../components/Auth/AuthLayout";
import { PrimaryButton } from "../components/Auth/PrimaryButton";

const OTP_LENGTH = 6;
const MAX_ATTEMPTS = 5;

export function VerifyPage({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  // If no email in state, redirect to signup
  useEffect(() => {
    if (!email) {
      navigate("/signup", { replace: true });
    }
  }, [email, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerifyRef = useRef();
  const hasAutoSubmitted = useRef(false);

  useEffect(() => {
    handleVerifyRef.current = handleVerify;
  });

  useEffect(() => {
    const code = otp.join("");
    if (code.length === OTP_LENGTH && !hasAutoSubmitted.current) {
      hasAutoSubmitted.current = true;
      handleVerifyRef.current();
    } else if (code.length < OTP_LENGTH) {
      hasAutoSubmitted.current = false;
    }
  }, [otp]);

  const focusInput = (index) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index].focus();
    }
  };

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next
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
    setError("");
    focusInput(Math.min(digits.length, OTP_LENGTH - 1));
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();

    if (attempts >= MAX_ATTEMPTS) {
      setError("Too many attempts. Please request a new OTP.");
      return;
    }

    const code = otp.join("");

    if (code.length !== OTP_LENGTH) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/email-verification/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          otp: code,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        navigate("/dashboard");
      } else {
        setAttempts((prev) => prev + 1);

        const remaining = MAX_ATTEMPTS - (attempts + 1);

        if (remaining <= 0) {
          setError("Maximum OTP attempts reached.");
        } else {
          setError(`Invalid code. Attempts left: ${remaining}`);
        }
      }
    } catch {
      setError("Server not connected. Try again...");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setResendLoading(true);
    setResendMessage("");
    setError("");

    try {
      const response = await fetch("http://localhost:8000/email-verification/send", {
        method: "POST",
        credentials: "include"
      });
      const result = await response.json();

      if (response.ok) {
        setResendMessage("A new code has been sent to your email.");
        setOtp(Array(OTP_LENGTH).fill(""));
        setAttempts(0);
        setResendCooldown(60);
        focusInput(0);
      } else {
        setError(result.detail || result.message || "Failed to resend code.");
      }
    } catch {
      setError("Server not connected. Try again...");
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

  return (
    <AuthLayout>
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 animate-fade-in">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-navy-50 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 md:text-3xl lg:text-3xl">Verify Your Email</h1>
          <p className="text-sm text-gray-500 md:text-base lg:text-lg">
            We sent a 6-digit verification code to
          </p>
          <p className="text-sm font-semibold text-navy-700 mt-1 md:text-base lg:text-lg">{email}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2.5">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success */}
        {resendMessage && (
          <div className="mb-5 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-start gap-2.5">
            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-700">{resendMessage}</p>
          </div>
        )}

        <form onSubmit={handleVerify}>
          {/* OTP inputs */}
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
                  ${error
                    ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : digit
                      ? "border-navy-300 bg-navy-50 focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
                      : "border-gray-200 focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
                  } text-gray-900`}
                aria-label={`Digit ${index + 1}`}
              />
            ))}
          </div>

          <PrimaryButton
            text="Verify Email"
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
            onClick={() => navigate("/signup")}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Back to Sign Up
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
