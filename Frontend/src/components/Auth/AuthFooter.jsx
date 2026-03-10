import React from "react";
import { Link } from "react-router-dom";

export function AuthFooter({ text, linkText, linkTo }) {
  return (
    <p className="text-center text-sm text-gray-500 md:text-base lg:text-lg">
      {text}{" "}
      <Link to={linkTo} className="text-navy-700 font-semibold hover:text-navy-900 transition-colors">
        {linkText}
      </Link>
    </p>
  );
}
