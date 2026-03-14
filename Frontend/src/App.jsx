import "./App.css";
import { useEffect, useState } from "react";
import { messaging } from "./firebase";
import { onMessage } from "firebase/messaging";
import { LandingPage } from "./pages/LandingPage.jsx";
import { SignUpPage } from "./pages/SignUpPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { VerifyPage } from "./pages/VerifyPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { AddReminderPage } from "./pages/AddReminderPage.jsx";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage.jsx";
import { UserProfilePage } from "./pages/UserProfilePage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function ProtectedRoute({ element, isAuthenticated, isLoading }) {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-200 border-t-navy-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? element : <Navigate to="/login" replace />;
}

function AuthRoute({ element, isAuthenticated, isLoading }) {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-navy-200 border-t-navy-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : element;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const checkAuth = async () => {

      try {

        const response = await fetch(
          "http://localhost:8000/users/me",
          { credentials: "include" }
        );

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }

      } catch {
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    checkAuth();

  }, []);

  useEffect(() => {

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);

      const title = payload.notification?.title;
      const body = payload.notification?.body;

      if (Notification.permission === "granted" && title && body) {
        new Notification(title, {
          body: body,
          icon: "/icon.png"
        });
      }
    });

    return () => unsubscribe();

  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/signup"
          element={<AuthRoute element={<SignUpPage />} isAuthenticated={isAuthenticated} isLoading={isLoading} />}
        />
        <Route
          path="/login"
          element={<AuthRoute element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} isAuthenticated={isAuthenticated} isLoading={isLoading} />}
        />
        <Route
          path="/forgot-password"
          element={<AuthRoute element={<ForgotPasswordPage />} isAuthenticated={isAuthenticated} isLoading={isLoading} />}
        />
        <Route
          path="/verify"
          element={<AuthRoute element={<VerifyPage setIsAuthenticated={setIsAuthenticated} />} isAuthenticated={isAuthenticated} isLoading={isLoading} />}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<DashboardPage setIsAuthenticated={setIsAuthenticated} />} isAuthenticated={isAuthenticated} isLoading={isLoading} />}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute element={<UserProfilePage />} isAuthenticated={isAuthenticated} isLoading={isLoading} />}
        />
        <Route
          path="/addreminder"
          element={<ProtectedRoute element={<AddReminderPage />} isAuthenticated={isAuthenticated} isLoading={isLoading} />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
