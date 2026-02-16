import React from "react";

export function AuthHeader({ title }) {
  return (
    <>
      <h1 className="font-semibold text-blue-900 text-center">VIGIL</h1>
      <h2 className="text-3xl font-semibold text-black text-center">
        {title}
      </h2>
    </>
  );
}
