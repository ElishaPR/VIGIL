import React from "react";

export function AuthCard({children}){
    return (
        <div className="w-full max-w-sm h-auto bg-white rounded-lg shadow-lg overflow-y-auto flex flex-col md:w-full md:max-w-sm md:mx-8">
            {children}
        </div>
    );
}