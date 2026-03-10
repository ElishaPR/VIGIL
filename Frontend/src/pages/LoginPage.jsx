import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "../components/Auth/AuthLayout";
import { AuthBrandPanel } from "../components/Auth/AuthBrandPanel";
import { FormInput } from "../components/Auth/FormInput";
import { PrimaryButton } from "../components/Auth/PrimaryButton";
import { AuthFooter } from "../components/Auth/AuthFooter";
import { validateEmail, validatePassword } from "../utils/validators";

export function LoginPage({ setIsAuthenticated }) {
  const navigate = useNavigate();
  const [userEmailAddress, setUserEmailAddress] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    api: "",
  });

  const updateError = (field, value) => {
    setErrors((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmailBlur = () => {
    const err = validateEmail(userEmailAddress);
    updateError("email", err);
  };

  const handlePasswordBlur = () => {
    if (!userPassword) {
      updateError("password", "Password is required.");
    } else {
      updateError("password", "");
    }
  };

  const validateAll = () => {
    const emailErr = validateEmail(userEmailAddress);
    const passErr = !userPassword ? "Password is required." : "";
    setErrors({ email: emailErr, password: passErr, api: "" });
    return !emailErr && !passErr;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);
    updateError("api", "");

    try {
      const response = await fetch("http://localhost:8000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email_address: userEmailAddress,
          raw_password: userPassword,
        }),
      });
      const result = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        navigate("/dashboard");
      } else if (response.status === 403) {
        // Email not verified
        navigate("/verify", { state: { email: userEmailAddress } });
      } else {
        updateError("api", result.detail || result.message || "Login failed. Please try again.");
      }
    } catch {
      updateError("api", "Server not connected. Try again...");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex bg-white rounded-2xl shadow-xl overflow-hidden min-h-screen lg:min-h-[600px] max-w-5xl mx-auto animate-fade-in">
        {/* Left brand panel */}
        <AuthBrandPanel
          title="Welcome Back"
          subtitle="Log in to access your document dashboard and manage your reminders."
        />

        {/* Right form panel */}
        <div className="flex-1 flex flex-col justify-center p-6 sm:p-8 lg:p-12">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <img src="/vigil-logo.svg" alt="Vigil" className="h-8 w-8" />
            <span className="text-lg font-bold text-navy-900 tracking-tight">VIGIL</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl lg:text-4xl">Log in to your account</h1>
            <p className="text-sm text-gray-500 mt-2 md:text-base lg:text-lg">Enter your credentials to continue.</p>
          </div>

          {/* API error */}
          {errors.api && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2.5">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{errors.api}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5" noValidate>
            <FormInput
              label="Email Address"
              id="loginEmail"
              type="email"
              placeholder="you@example.com"
              value={userEmailAddress}
              onChangeValue={(val) => {
                setUserEmailAddress(val);
                if (errors.email) updateError("email", "");
              }}
              onBlur={handleEmailBlur}
              error={errors.email}
              required
            />

            {/* Password with toggle */}
            <div className="flex flex-col gap-1.5 w-full">
              <label htmlFor="loginPassword" className="text-sm font-medium text-gray-700">
                Password <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="loginPassword"
                  placeholder="Enter your password"
                  className={`input-field pr-10 ${errors.password ? "input-error" : ""}`}
                  value={userPassword}
                  onChange={(e) => {
                    setUserPassword(e.target.value);
                    if (errors.password) updateError("password", "");
                  }}
                  onBlur={handlePasswordBlur}
                  required
                  autoComplete="current-password"
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

            <div className="mt-1">
              <PrimaryButton
                text="Log in"
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading}
                fullWidth
              />
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-navy-700 font-semibold hover:text-navy-900 transition-colors"
              >
                Forgot your password?
              </button>
            </div>

            <AuthFooter
              text="Don't have an account?"
              linkText="Sign Up"
              linkTo="/signup"
            />
          </form>
        </div>
      </div>
    </AuthLayout>
  );
}
