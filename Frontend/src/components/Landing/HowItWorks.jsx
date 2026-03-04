import React from "react";

const steps = [
  {
    number: "01",
    title: "Create an Account",
    description: "Sign up with your email address. Verify your account to get started.",
  },
  {
    number: "02",
    title: "Upload Documents",
    description: "Add your important documents and set their expiry dates.",
  },
  {
    number: "03",
    title: "Set Reminders",
    description: "Choose when and how you want to be notified before a document expires.",
  },
  {
    number: "04",
    title: "Stay Informed",
    description: "Receive timely email notifications and manage everything from your dashboard.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Get started in a few simple steps.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center lg:text-left">
              <span className="text-5xl font-extrabold text-navy-100 block mb-3">
                {step.number}
              </span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 -right-3 w-6 text-navy-200" aria-hidden="true">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
