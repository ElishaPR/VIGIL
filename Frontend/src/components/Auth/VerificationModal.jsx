import React, { useState } from "react";
import { FormInput } from "./FormInput";
import { PrimaryButton } from "./PrimaryButton";
import { validateVerificationCode } from "../../utils/validators";

export function VerificationModal({ email, onVerify, onResend, onClose }) {
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();

    const codeErrors = validateVerificationCode(code);
    if (codeErrors.length > 0) {
      setErrors(codeErrors);
      return;
    }

    setErrors([]);
    setLoading(true);

    try {
      await onVerify(code);
    } catch (error) {
      setErrors([error.message || "Verification failed. Please try again."]);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage("");
    try {
      await onResend();
      setResendMessage("A new verification code has been sent to your email.");
      setCode("");
    } catch (error) {
      setErrors([error.message || "Failed to resend code. Please try again."]);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <svg
                className="w-12 h-12 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600 text-sm">
            We have sent a 6-digit verification code to
          </p>
          <p className="text-blue-600 font-semibold">{email}</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <FormInput
            label="Verification Code"
            id="verificationCode"
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChangeValue={setCode}
            error={errors[0]}
            required
          />

          {resendMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {resendMessage}
            </div>
          )}

          <div className="space-y-3">
            <PrimaryButton
              text="Verify Email"
              type="submit"
              variant="primary"
              loading={loading}
              fullWidth
            />

            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Resend Code"}
              </button>
            </div>
          </div>
        </form>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
