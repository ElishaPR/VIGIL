import React from "react";
import {Link} from "react-router-dom";

export function AuthFooter({ text, linkText, linkTo }) {
  return (
    <div className="flex flex-row space-x-2 items-center justify-center text-md ">
      <span>{text}</span>
      <Link to={linkTo} className="text-blue-700 font-medium hover:underline cursor-pointer">
        {linkText}
      </Link>
    </div>
  );
}
