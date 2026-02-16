import React from "react";

export function PrimaryButton({ text }) {
  return (
    <button
      type="submit"
      className=" px-4 text-white text-base font-medium hover:shadow-md md:flex-grow-0 md:w-24"
      style={{
        background:
          "radial-gradient(circle at 50% 40%, #2563eb 0%, #1d4edb 45%, #1e3a8a 100%)"
      }}
    >
      {text}
    </button>
  );
}
