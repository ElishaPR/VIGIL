import React from "react";

export function AuthBrandPanel({ title, subtitle }) {
  return (
    <div className="hidden lg:flex lg:flex-1 bg-gradient-hero rounded-l-2xl p-10 flex-col justify-between relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full"></div>
        <div className="absolute bottom-10 -left-10 w-56 h-56 bg-white/5 rounded-full"></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2.5 mb-10">
          <img src="/vigil-logo.svg" alt="Vigil" className="h-10 w-10" />
          <span className="text-xl font-bold text-white tracking-tight">VIGIL</span>
        </div>

        <h2 className="text-3xl font-bold text-white leading-snug mb-4">
          {title}
        </h2>
        <p className="text-blue-200 text-base leading-relaxed max-w-sm">
          {subtitle}
        </p>
      </div>

      <div className="relative z-10 flex flex-col gap-4 mt-10">
        <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-medium">Email Reminders</p>
            <p className="text-blue-200 text-xs">Get notified before documents expire</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-medium">Secure Storage</p>
            <p className="text-blue-200 text-xs">Your documents are kept safe</p>
          </div>
        </div>
      </div>
    </div>
  );
}
