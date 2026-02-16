import React from "react";

export function AuthLayout({children}){
    return (
        <div className="fixed inset-0 bg-blue-100 flex justify-center items-center">
            {children}
        </div>
    );
}