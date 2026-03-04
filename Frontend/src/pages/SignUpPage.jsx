import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "../components/Auth/AuthLayout";
import { AuthBrandPanel } from "../components/Auth/AuthBrandPanel";
import { FormInput } from "../components/Auth/FormInput";
import { PrimaryButton } from "../components/Auth/PrimaryButton";
import { AuthFooter } from "../components/Auth/AuthFooter";
import { validateEmail, validateDisplayName, validatePassword } from "../utils/validators";

export function SignUpPage() {
  const navigate = useNavigate();
  const [userEmailAddress, setUserEmailAddress] = useState("");
  const [userDisplayName, setUserDisplayName] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isIndiaResident, setIsIndiaResident] = useState(false);
  const [consentUpload, setConsentUpload] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    displayName: "",
    password: "",
    residency: "",
    consent: "",
    terms: "",
    api: "",
  });

  const updateError = (field, value) => {
    setErrors((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmailBlur = () => {
    const err = validateEmail(userEmailAddress);
    updateError("email", err);
  };

  const handleDisplayNameBlur = () => {
    const err = validateDisplayName(userDisplayName);
    updateError("displayName", err);
  };

  const handlePasswordBlur = () => {
    const err = validatePassword(userPassword);
    updateError("password", err);
  };

  const validateAll = () => {
    const emailErr = validateEmail(userEmailAddress);
    const nameErr = validateDisplayName(userDisplayName.trim());
    const passErr = validatePassword(userPassword);
    let residencyErr = "";
    let consentErr = "";
    let termsErr = "";

    if (!isIndiaResident) {
      residencyErr = "You must confirm that you are currently residing in India to use this service.";
    }
    if (!consentUpload) {
      consentErr = "You must provide consent to upload and store your documents.";
    }
    if (!acceptTerms) {
      termsErr = "You must accept the Terms & Conditions to continue.";
    }

    setErrors({
      email: emailErr,
      displayName: nameErr,
      password: passErr,
      residency: residencyErr,
      consent: consentErr,
      terms: termsErr,
      api: "",
    });

    return !emailErr && !nameErr && !passErr && !residencyErr && !consentErr && !termsErr;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);
    updateError("api", "");

    try {
      const response = await fetch("http://localhost:8000/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_address: userEmailAddress,
          display_name: userDisplayName.trim(),
          raw_password: userPassword,
          is_india_resident: isIndiaResident,
        }),
      });
      const result = await response.json();

      if (response.ok) {
        navigate("/verify", { state: { email: userEmailAddress } });
      } else {
        updateError("api", result.detail || result.message || "Signup failed. Please try again.");
      }
    } catch {
      updateError("api", "Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex bg-white rounded-2xl shadow-xl overflow-hidden min-h-[600px] animate-fade-in">
        {/* Left brand panel */}
        <AuthBrandPanel
          title="Keep Your Documents in Check"
          subtitle="Upload documents, set reminders, and never miss an expiry date again."
        />

        {/* Right form panel */}
        <div className="flex-1 flex flex-col p-6 sm:p-8 lg:p-10 overflow-y-auto">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <img src="/vigil-logo.svg" alt="Vigil" className="h-8 w-8" />
            <span className="text-lg font-bold text-navy-900 tracking-tight">VIGIL</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-sm text-gray-500 mt-1">Get started with Vigil in a few steps.</p>
          </div>

          {/* API error */}
          {errors.api && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2.5">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{errors.api}</p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="flex flex-col gap-4 flex-1" noValidate>
            <FormInput
              label="Email Address"
              id="emailAddress"
              type="email"
              placeholder="you@example.com"
              helperText="Notifications will be sent to this email."
              value={userEmailAddress}
              onChangeValue={(val) => {
                setUserEmailAddress(val);
                if (errors.email) updateError("email", "");
              }}
              onBlur={handleEmailBlur}
              error={errors.email}
              required
            />

            <FormInput
              label="Display Name"
              id="displayName"
              type="text"
              placeholder="Your full name"
              helperText="This name will appear on your dashboard."
              value={userDisplayName}
              onChangeValue={(val) => {
                setUserDisplayName(val);
                if (errors.displayName) updateError("displayName", "");
              }}
              onBlur={handleDisplayNameBlur}
              error={errors.displayName}
              maxLength={50}
              required
            />

            {/* Password with toggle */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Min. 8 characters"
                  className={`input-field pr-10 ${errors.password ? "input-error" : ""}`}
                  value={userPassword}
                  onChange={(e) => {
                    setUserPassword(e.target.value);
                    if (errors.password) updateError("password", "");
                  }}
                  onBlur={handlePasswordBlur}
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
              {!errors.password && (
                <p className="text-gray-400 text-xs">Must be 8 - 64 characters.</p>
              )}
            </div>

            {/* Residency, consent and terms section */}
            <div className="mt-2 flex flex-col gap-3 border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                Vigil currently operates within India. Due to document sensitivity and compliance requirements,
                we need to confirm your residency and obtain your consent.
              </p>

              {/* India residency */}
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={isIndiaResident}
                  onChange={(e) => {
                    setIsIndiaResident(e.target.checked);
                    if (errors.residency) updateError("residency", "");
                  }}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-navy-900 focus:ring-navy-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 leading-snug">
                  I confirm that I am currently residing in India.
                </span>
              </label>
              {errors.residency && (
                <p className="text-red-600 text-xs ml-6">{errors.residency}</p>
              )}

              {/* Document consent */}
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={consentUpload}
                  onChange={(e) => {
                    setConsentUpload(e.target.checked);
                    if (errors.consent) updateError("consent", "");
                  }}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-navy-900 focus:ring-navy-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 leading-snug">
                  I consent to uploading and storing my documents on Vigil.
                </span>
              </label>
              {errors.consent && (
                <p className="text-red-600 text-xs ml-6">{errors.consent}</p>
              )}

              {/* Terms */}
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    if (errors.terms) updateError("terms", "");
                  }}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 text-navy-900 focus:ring-navy-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 leading-snug">
                  I agree to the{" "}
                  <Link to="/terms" className="text-navy-700 font-medium hover:underline" target="_blank" rel="noopener noreferrer">
                    Terms & Conditions
                  </Link>.
                </span>
              </label>
              {errors.terms && (
                <p className="text-red-600 text-xs ml-6">{errors.terms}</p>
              )}
            </div>

            {/* Submit */}
            <div className="mt-4">
              <PrimaryButton
                text="Create Account"
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
                fullWidth
              />
            </div>

            <AuthFooter
              text="Already have an account?"
              linkText="Log in"
              linkTo="/login"
            />
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
