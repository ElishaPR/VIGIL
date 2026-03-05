import React from "react";
import { Navbar } from "../components/Shared/Navbar";
import { Hero } from "../components/Landing/Hero";
import { Features } from "../components/Landing/Features";
import { HowItWorks } from "../components/Landing/HowItWorks";
import { Footer } from "../components/Landing/Footer";

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
