# Vigil - Complete Code Reference

This document contains all the remaining pages and components you need to create for your modern Vigil website.

## Table of Contents
1. Landing Page Components
2. SignUpPage with 2-Panel Design
3. LoginPage
4. VerifyEmailPage
5. DashboardPage
6. Terms & Privacy Pages
7. App.jsx Routes Update

---

## 1. LANDING PAGE COMPONENTS

### Frontend/src/components/Landing/Features.jsx

```jsx
import React from "react";

export function Features() {
  const features = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      title: "Smart Reminders",
      description: "Get email and push notifications before your documents expire. Customize reminder schedules to fit your needs.",
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Secure Storage",
      description: "Your documents are stored securely with industry-standard encryption. Only you have access to your files.",
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      title: "Easy Organization",
      description: "Categorize documents by type. Search and filter to find what you need instantly.",
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: "Multi-Device Access",
      description: "Access your documents from any device. Responsive design works on desktop, tablet, and mobile.",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Stay Organized
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Vigil provides all the tools you need to manage your document expiry dates efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all hover-lift"
            >
              <div className="text-blue-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Frontend/src/components/Landing/HowItWorks.jsx

```jsx
import React from "react";

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Sign Up",
      description: "Create your free account in seconds. No credit card required.",
    },
    {
      number: "2",
      title: "Upload Documents",
      description: "Add your important documents and set their expiry dates.",
    },
    {
      number: "3",
      title: "Get Reminders",
      description: "Receive automatic reminders before your documents expire.",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600">
            Get started in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-primary text-white text-3xl font-bold mb-6">
                {step.number}
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 text-lg">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Frontend/src/components/Landing/CTASection.jsx

```jsx
import React from "react";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="bg-gradient-primary py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center text-white">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join hundreds of users who never miss a document expiry date.
        </p>
        <Link
          to="/signup"
          className="inline-block bg-white text-blue-600 px-10 py-4 rounded-lg font-semibold text-lg hover:shadow-2xl transition-all transform hover:-translate-y-1"
        >
          Create Free Account
        </Link>
      </div>
    </section>
  );
}
```

### Frontend/src/components/Landing/Footer.jsx

```jsx
import React from "react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/vigil-logo.svg" alt="Vigil" className="h-8 w-8" />
              <span className="text-xl font-bold">VIGIL</span>
            </div>
            <p className="text-gray-400">
              Smart document reminder system for busy professionals.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/signup" className="hover:text-white">Sign Up</Link></li>
              <li><Link to="/login" className="hover:text-white">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-gray-400">
              For support and inquiries, please contact us through the app.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 Vigil. All rights reserved. Service available for India residents only.</p>
        </div>
      </div>
    </footer>
  );
}
```

### Frontend/src/pages/LandingPage.jsx

```jsx
import React from "react";
import { Navbar } from "../components/Shared/Navbar";
import { Hero } from "../components/Landing/Hero";
import { Features } from "../components/Landing/Features";
import { HowItWorks } from "../components/Landing/HowItWorks";
import { CTASection } from "../components/Landing/CTASection";
import { Footer } from "../components/Landing/Footer";

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={false} />
      <Hero />
      <Features />
      <HowItWorks />
      <CTASection />
      <Footer />
    </div>
  );
}
```

---

## 2. SIGNUP PAGE WITH 2-PANEL DESIGN

### Frontend/src/pages/SignUpPage.jsx

```jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "../components/Auth/AuthLayout";
import { AuthCard } from "../components/Auth/AuthCard";
import { AuthHeader } from "../components/Auth/AuthHeader";
import { FormInput } from "../components/Auth/FormInput";
import { PrimaryButton } from "../components/Auth/PrimaryButton";
import { VerificationModal } from "../components/Auth/VerificationModal";
import {
  validateEmail,
  validateDisplayName,
  validatePassword,
  validateConsents,
} from "../utils/validators";

export function SignUpPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailAddress: "",
    displayName: "",
    password: "",
    isIndiaResident: false,
    termsAccepted: false,
    privacyAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });

    let fieldErrors = [];
    if (field === "emailAddress") {
      fieldErrors = validateEmail(formData.emailAddress);
    } else if (field === "displayName") {
      fieldErrors = validateDisplayName(formData.displayName);
    } else if (field === "password") {
      fieldErrors = validatePassword(formData.password);
    }

    setErrors({ ...errors, [field]: fieldErrors[0] || "" });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    const emailErrors = validateEmail(formData.emailAddress);
    const nameErrors = validateDisplayName(formData.displayName);
    const passwordErrors = validatePassword(formData.password);
    const consentErrors = validateConsents(
      formData.isIndiaResident,
      formData.termsAccepted,
      formData.privacyAccepted
    );

    if (
      emailErrors.length > 0 ||
      nameErrors.length > 0 ||
      passwordErrors.length > 0 ||
      Object.keys(consentErrors).length > 0
    ) {
      setErrors({
        emailAddress: emailErrors[0],
        displayName: nameErrors[0],
        password: passwordErrors[0],
        ...consentErrors,
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("http://localhost:8000/users/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_address: formData.emailAddress,
          display_name: formData.displayName,
          raw_password: formData.password,
          is_india_resident: formData.isIndiaResident,
          terms_accepted: formData.termsAccepted,
          privacy_accepted: formData.privacyAccepted,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Signup failed");
      }

      setShowVerificationModal(true);
    } catch (error) {
      setErrors({ submit: error.message });
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (code) => {
    const response = await fetch("http://localhost:8000/users/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email_address: formData.emailAddress,
        verification_code: code,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || "Verification failed");
    }

    alert(result.message);
    navigate("/login");
  };

  const handleResend = async () => {
    const response = await fetch("http://localhost:8000/users/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email_address: formData.emailAddress }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.detail || "Failed to resend code");
    }
  };

  return (
    <AuthLayout>
      <AuthCard wide>
        <div className="grid md:grid-cols-2">
          {/* Left Panel - Branding */}
          <div className="bg-gradient-primary p-12 text-white hidden md:flex flex-col justify-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <img src="/vigil-logo.svg" alt="Vigil" className="h-16 w-16" />
                <h1 className="text-4xl font-bold">VIGIL</h1>
              </div>
              <h2 className="text-2xl font-semibold">
                Join thousands who never miss a deadline
              </h2>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Smart email and push notifications</span>
                </li>
                <li className="flex items-start space-x-3">
                  <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Secure document storage</span>
                </li>
                <li className="flex items-start space-x-3">
                  <svg className="w-6 h-6 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Never miss an expiry date</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Panel - Signup Form */}
          <div className="p-8 md:p-12">
            <AuthHeader
              title="Create Account"
              subtitle="Get started with your free account"
            />

            <form onSubmit={handleSignUp} className="mt-8 space-y-6">
              <FormInput
                label="Email Address"
                id="emailAddress"
                type="email"
                placeholder="you@example.com"
                value={formData.emailAddress}
                onChangeValue={(value) =>
                  setFormData({ ...formData, emailAddress: value })
                }
                onBlur={() => handleBlur("emailAddress")}
                error={touched.emailAddress && errors.emailAddress}
                required
              />

              <FormInput
                label="Full Name"
                id="displayName"
                type="text"
                placeholder="Enter your full name"
                value={formData.displayName}
                onChangeValue={(value) =>
                  setFormData({ ...formData, displayName: value })
                }
                onBlur={() => handleBlur("displayName")}
                error={touched.displayName && errors.displayName}
                helperText="This name will appear on your dashboard."
                required
              />

              <FormInput
                label="Password"
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChangeValue={(value) =>
                  setFormData({ ...formData, password: value })
                }
                onBlur={() => handleBlur("password")}
                error={touched.password && errors.password}
                helperText="At least 8 characters with 1 number"
                required
              />

              <div className="space-y-4 pt-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="isIndiaResident"
                    checked={formData.isIndiaResident}
                    onChange={(e) =>
                      setFormData({ ...formData, isIndiaResident: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isIndiaResident" className="ml-3 text-sm text-gray-700">
                    I confirm that I am currently residing in India and agree to share my documents with Vigil.
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                </div>
                {errors.isIndiaResident && (
                  <p className="text-error text-sm">{errors.isIndiaResident}</p>
                )}

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={(e) =>
                      setFormData({ ...formData, termsAccepted: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="termsAccepted" className="ml-3 text-sm text-gray-700">
                    I agree to the{" "}
                    <Link to="/terms" className="text-blue-600 hover:underline">
                      Terms of Service
                    </Link>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                </div>
                {errors.termsAccepted && (
                  <p className="text-error text-sm">{errors.termsAccepted}</p>
                )}

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="privacyAccepted"
                    checked={formData.privacyAccepted}
                    onChange={(e) =>
                      setFormData({ ...formData, privacyAccepted: e.target.checked })
                    }
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="privacyAccepted" className="ml-3 text-sm text-gray-700">
                    I agree to the{" "}
                    <Link to="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                </div>
                {errors.privacyAccepted && (
                  <p className="text-error text-sm">{errors.privacyAccepted}</p>
                )}
              </div>

              <PrimaryButton
                text="Create Account"
                type="submit"
                variant="primary"
                loading={loading}
                fullWidth
              />

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </AuthCard>

      {showVerificationModal && (
        <VerificationModal
          email={formData.emailAddress}
          onVerify={handleVerify}
          onResend={handleResend}
          onClose={() => navigate("/login")}
        />
      )}
    </AuthLayout>
  );
}
```

---

## 3. LOGIN PAGE

### Frontend/src/pages/LoginPage.jsx

```jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthLayout } from "../components/Auth/AuthLayout";
import { AuthCard } from "../components/Auth/AuthCard";
import { AuthHeader } from "../components/Auth/AuthHeader";
import { FormInput } from "../components/Auth/FormInput";
import { PrimaryButton } from "../components/Auth/PrimaryButton";
import { validateEmail, validatePassword } from "../utils/validators";

export function LoginPage() {
  const navigate = useNavigate();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    const emailErrors = validateEmail(emailAddress);
    const passwordErrors = validatePassword(password);

    if (emailErrors.length > 0 || passwordErrors.length > 0) {
      setErrors({
        emailAddress: emailErrors[0],
        password: passwordErrors[0],
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("http://localhost:8000/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email_address: emailAddress,
          raw_password: password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Login failed");
      }

      alert(result.message);
      navigate("/dashboard");
    } catch (error) {
      setErrors({ submit: error.message });
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="p-8">
          <AuthHeader
            title="Welcome Back"
            subtitle="Login to access your dashboard"
          />

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <FormInput
              label="Email Address"
              id="emailAddress"
              type="email"
              placeholder="you@example.com"
              value={emailAddress}
              onChangeValue={setEmailAddress}
              error={errors.emailAddress}
              required
            />

            <FormInput
              label="Password"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChangeValue={setPassword}
              error={errors.password}
              required
            />

            <PrimaryButton
              text="Login"
              type="submit"
              variant="primary"
              loading={loading}
              fullWidth
            />

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
```

---

## 4. DASHBOARD PAGE

### Frontend/src/components/Dashboard/DashboardLayout.jsx

```jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export function DashboardLayout({ children, userName }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/vigil-logo.svg" alt="Vigil" className="h-10 w-10" />
              <span className="text-2xl font-bold text-gradient">VIGIL</span>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {userName}</span>
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors px-4 py-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
```

### Frontend/src/components/Dashboard/WelcomeSection.jsx

```jsx
import React from "react";
import { Link } from "react-router-dom";

export function WelcomeSection({ userName }) {
  return (
    <div className="bg-gradient-primary rounded-2xl p-8 text-white mb-8">
      <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}!</h1>
      <p className="text-blue-100 mb-6">
        Manage your document reminders and never miss an expiry date.
      </p>
      <Link
        to="/addreminder"
        className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
      >
        Add New Reminder
      </Link>
    </div>
  );
}
```

### Frontend/src/pages/DashboardPage.jsx

```jsx
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../components/Dashboard/DashboardLayout";
import { WelcomeSection } from "../components/Dashboard/WelcomeSection";

export function DashboardPage() {
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const fetchUserData = async () => {
      // TODO: Fetch user data from backend using the cookie
      // For now, using placeholder
      setUserName("User");
    };

    fetchUserData();
  }, []);

  return (
    <DashboardLayout userName={userName}>
      <WelcomeSection userName={userName} />

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Total Documents</h3>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Active Reminders</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm font-semibold mb-2">Expiring Soon</h3>
          <p className="text-3xl font-bold text-yellow-600">0</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reminders</h2>
        <p className="text-gray-500 text-center py-12">
          No reminders yet. Add your first reminder to get started.
        </p>
      </div>
    </DashboardLayout>
  );
}
```

---

## 5. TERMS & PRIVACY PAGES

### Frontend/src/pages/TermsAndConditionsPage.jsx

```jsx
import React from "react";
import { Link } from "react-router-dom";

export function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <Link to="/" className="text-blue-600 hover:underline mb-6 inline-block">
            &larr; Back to Home
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Terms and Conditions
          </h1>

          <div className="prose max-w-none">
            <p className="text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <p className="text-sm text-yellow-800">
                This page is intentionally left blank for you to add your terms and conditions.
                Please consult with a legal professional to create appropriate terms for your service.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Add Your Terms Here
              </h2>
              <p className="text-gray-600">
                Your terms and conditions content will go here. This should include:
              </p>
              <ul className="list-disc pl-6 mt-4 text-gray-600 space-y-2">
                <li>Service description and usage terms</li>
                <li>User responsibilities and acceptable use</li>
                <li>Data handling and privacy practices</li>
                <li>Liability limitations</li>
                <li>Termination conditions</li>
                <li>Dispute resolution</li>
                <li>Governing law</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Frontend/src/pages/PrivacyPolicyPage.jsx

```jsx
import React from "react";
import { Link } from "react-router-dom";

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <Link to="/" className="text-blue-600 hover:underline mb-6 inline-block">
            &larr; Back to Home
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>

          <div className="prose max-w-none">
            <p className="text-gray-600 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <p className="text-sm text-yellow-800">
                This page is intentionally left blank for you to add your privacy policy.
                Please consult with a legal professional to create an appropriate privacy policy for your service.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Add Your Privacy Policy Here
              </h2>
              <p className="text-gray-600">
                Your privacy policy content will go here. This should include:
              </p>
              <ul className="list-disc pl-6 mt-4 text-gray-600 space-y-2">
                <li>Data collection practices</li>
                <li>How user data is stored and protected</li>
                <li>Third-party services and data sharing</li>
                <li>User rights and data access</li>
                <li>Cookie usage</li>
                <li>Data retention policies</li>
                <li>Contact information for privacy concerns</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Important Note for India Residents
              </h2>
              <p className="text-gray-600">
                This service is only available to residents of India. Your privacy policy should
                clearly state compliance with Indian data protection laws and regulations.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. APP.JSX ROUTES UPDATE

### Frontend/src/App.jsx

```jsx
import "./App.css";
import { useEffect } from "react";
import { messaging } from "./firebase";
import { onMessage } from "firebase/messaging";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { LandingPage } from "./pages/LandingPage";
import { SignUpPage } from "./pages/SignUpPage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AddReminderPage } from "./pages/AddReminderPage";
import { TermsAndConditionsPage } from "./pages/TermsAndConditionsPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";

function App() {
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);

      const title = payload.notification?.title;
      const body = payload.notification?.body;

      if (Notification.permission === "granted" && title && body) {
        new Notification(title, {
          body: body,
          icon: "/vigil-logo.svg",
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/addreminder" element={<AddReminderPage />} />
        <Route path="/terms" element={<TermsAndConditionsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## INSTALLATION & TESTING

### Install Frontend Dependencies
```bash
cd Frontend
npm install
```

### Run the Application
```bash
# Terminal 1 - Backend
cd Backend
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

### Test Flow
1. Visit http://localhost:5173
2. Click "Get Started Free" on landing page
3. Fill signup form with all consents checked
4. Receive verification email
5. Enter 6-digit code
6. Login with credentials
7. Access dashboard

---

## KEY FEATURES IMPLEMENTED

1. ✅ Modern gradient design (light blue to dark blue)
2. ✅ Geometric V logo with favicon
3. ✅ Responsive 2-panel signup with consent checkboxes
4. ✅ OTP-based email verification
5. ✅ Frontend + backend validation
6. ✅ India residency verification
7. ✅ Terms & Privacy Policy acceptance
8. ✅ Secure HTTP-only cookie authentication
9. ✅ Modern landing page with hero, features, how-it-works
10. ✅ Clean dashboard layout

---

## NEXT STEPS

1. Fill in Terms & Privacy Policy pages with your legal content
2. Implement document listing on dashboard
3. Style the AddReminderPage to match new design
4. Add user profile management
5. Implement document categories and filtering

This completes your modern Vigil authentication system!
