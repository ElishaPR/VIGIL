import React from "react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="bg-gradient-hero pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -left-24 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          {/* Left copy */}
          <div className="flex-1 text-center lg:text-left animate-slide-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Stay on Top of Your <span className="text-blue-200">Document Deadlines</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-blue-100/90 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Upload your documents, set reminders, and receive email notifications before they expire.
              Keep your important paperwork organized in one secure place.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                to="/signup"
                className="bg-white text-navy-900 px-8 py-3.5 rounded-lg font-semibold text-base hover:shadow-xl transition-all hover:-translate-y-0.5 text-center"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="border-2 border-white/40 text-white px-8 py-3.5 rounded-lg font-semibold text-base hover:bg-white/10 transition-all text-center"
              >
                Log in
              </Link>
            </div>
          </div>

          {/* Right illustration card */}
          <div className="flex-1 w-full max-w-lg animate-fade-in hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-white/5 rounded-2xl transform rotate-3 scale-105"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="ml-2 text-sm text-gray-400 font-medium">Document Dashboard</span>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Card row 1 */}
                  <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                    <div className="bg-red-100 p-2.5 rounded-lg flex-shrink-0">
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">Passport</p>
                      <p className="text-xs text-red-600 font-medium">Expires in 5 days</p>
                    </div>
                    <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                      Urgent
                    </span>
                  </div>

                  {/* Card row 2 */}
                  <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="bg-amber-100 p-2.5 rounded-lg flex-shrink-0">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">Car Insurance</p>
                      <p className="text-xs text-amber-600 font-medium">Expires in 28 days</p>
                    </div>
                    <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                      Upcoming
                    </span>
                  </div>

                  {/* Card row 3 */}
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                    <div className="bg-green-100 p-2.5 rounded-lg flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">Health Insurance</p>
                      <p className="text-xs text-green-600 font-medium">Valid until Mar 2028</p>
                    </div>
                    <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
