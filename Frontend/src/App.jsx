import "./App.css";
import { useEffect } from "react";
import { messaging } from "./firebase";
import { onMessage } from "firebase/messaging";
import { LandingPage } from "./pages/LandingPage.jsx";
import { SignUpPage } from "./pages/SignUpPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { VerifyPage } from "./pages/VerifyPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { AddReminderPage } from "./pages/AddReminderPage.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {

  useEffect(() => {

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);

      const title = payload.notification?.title;
      const body = payload.notification?.body;

      if (Notification.permission === "granted" && title && body) {
        new Notification(title, {
          body: body,
          icon: "/vigil-logo.svg"
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
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/addreminder" element={<AddReminderPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
