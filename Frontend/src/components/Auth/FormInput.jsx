import React from "react";

export function FormInput({
    label,
    id,
    type = "text",
    placeholder,
    helperText,
    value,
    onChangeValue
}) {
    return (
        <div className="flex flex-col space-y-2 mb-6 w-full">
            <label htmlFor={id} className="text-black text-base font-medium text-left md:text-lg">
                {label}
            </label>
            <div className="w-full max-w-[300px]">
                <input type={type} id={id} placeholder={placeholder} className="w-full border-2 border-gray-500 rounded shadow-md p-2 text-base font-normal " value={value} onChange={(e) => { onChangeValue(e.target.value) }} />
                {helperText && (<p className="text-left text-sm font-medium mt-1">
                    {helperText}
                </p>)}
            </div>
        </div>
    );

}