import React, { useState } from "react";

export function AddReminderForm2() {
    // State for form fields (renamed for clarity)
    const [file, setFile] = useState(null);
    const [expiryDate, setExpiryDate] = useState("");
    const [remindBefore, setRemindBefore] = useState("");
    const [email, setEmail] = useState(""); // Kept as per your code, but you noted to remove it

    // State for tooltip visibility
    const [showTooltip, setShowTooltip] = useState(false);

    // State for errors (object with field names as keys)
    const [errors, setErrors] = useState({});

    // Helper: Validate file on change (triggers on user selecting a file)
    const validateFile = (selectedFile) => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ];

        if (!selectedFile) {
            return "Please select a file.";
        }
        if (selectedFile.size > maxSize) {
            return "File must be within 10MB!";
        }
        if (!allowedTypes.includes(selectedFile.type)) {
            return "Invalid file format! Allowed: pdf, jpeg/jpg, png, doc, docx, xls, xlsx.";
        }
        return ""; // No error
    };

    // Helper: Validate expiry date on blur (triggers on user leaving the field)
    const validateExpiryDate = (date) => {
        const today = new Date().toISOString().split("T")[0];
        if (!date) {
            return "Expiry date is required.";
        }
        if (date < today) {
            return "Invalid date! Must be today or later.";
        }
        return ""; // No error
    };

    // Handle file change (validate immediately on selection)
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        const error = validateFile(selectedFile);
        setErrors({ ...errors, file: error });
    };

    // Handle expiry date blur (validate on leaving the field)
    const handleExpiryDateBlur = () => {
        const error = validateExpiryDate(expiryDate);
        setErrors({ ...errors, expiryDate: error });
    };

    // Handle other changes (clear errors on input)
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "expiryDate") setExpiryDate(value);
        else if (name === "remindBefore") setRemindBefore(value);
        else if (name === "email") setEmail(value);

        // Clear error on change for better UX
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    // Placeholder for save (we'll add submit logic next)
    const handleSave = () => {
        // For now, just log (we'll refine save button behavior later)
        console.log("Save clicked:", { file, expiryDate, remindBefore, email });
    };

    return (
        <div className="fixed inset-0 bg-gray-200 flex justify-center items-center">
            <div className="w-full max-w-sm h-auto bg-white border border-gray-300 rounded-lg shadow-lg overflow-y-auto flex flex-col md:w-full md:max-w-4xl md:mx-8 border-4 border-gray-300">
                <form className="flex flex-col h-full p-4 md:p-6 lg:p-8">
                    <fieldset className="space-y-4 flex flex-col">
                        <legend className="text-xl font-semibold text-black text-center md:text-2xl">Add Document Reminder</legend>

                        {/* File Upload */}
                        <div className="flex flex-col space-y-2 md:flex md:flex-row md:items-center md:gap-4">
                            <label
                                htmlFor="uploadedFile"
                                className="text-black text-base font-medium text-left md:text-lg md:w-[300px] md:flex-shrink-0"
                            >
                                Upload a Document:
                            </label>

                            {/* Put group here ONLY */}
                            <div className="relative md:flex-1 md:max-w-[300px]">
                                <input
                                    type="file"
                                    id="uploadedFile"
                                    accept="application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                    className={`w-full border-2 rounded shadow-md p-2 text-base font-normal ${errors.file ? "border-red-500" : "border-gray-500"
                                        }`}
                                    onChange={handleFileChange}
                                    onMouseEnter={() => setShowTooltip(true)}
                                    onMouseLeave={() => setShowTooltip(false)}
                                />

                                {/* Tooltip ON FILE ONLY */}
                                <div className={`absolute left-0 top-full mt-1 bg-gray-800 text-white text-sm transition-opacity z-20 p-2 rounded max-w-[300px] ${showTooltip ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                                    Allowed file formats: pdf, jpeg/jpg, png, doc, docx, xls, xlsx!
                                </div>

                                {errors.file && (
                                    <div className="mt-1 text-red-600 text-sm font-normal">
                                        {errors.file}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Expiry Date */}
                        <div className="flex flex-col space-y-2 md:flex md:flex-row md:items-center md:gap-4 relative">
                            <label htmlFor="expDate" className="text-black text-base font-medium text-left md:text-lg md:w-[300px] md:flex-shrink-0">
                                Expiry Date:
                            </label>
                            <div className="relative md:flex-1 md:max-w-[200px]">
                            <input
                                type="date"
                                id="expDate"
                                name="expiryDate"
                                value={expiryDate}
                                required
                                className={`w-full font-medium border-2 rounded shadow-md p-2 text-base font-normal ${errors.expiryDate ? "border-red-500" : "border-gray-500"
                                    }`}
                                onChange={handleChange}
                                onBlur={handleExpiryDateBlur} // Validates on blur
                            />
                            {errors.expiryDate && (
                                <div className="mt-1 text-red-600 text-sm font-normal">
                                    {errors.expiryDate}
                                </div>
                            )}
                            </div>
                        </div>

                        {/* Remind Before */}
                        <div className="flex flex-col space-y-2 md:flex md:flex-row md:items-center md:gap-4">
                            <label htmlFor="reminderOpt" className="text-base font-medium text-black text-left md:text-lg md:w-[300px] md:flex-shrink-0">
                                Remind me before expiry:
                            </label>
                            <select
                                id="reminderOpt"
                                name="remindBefore"
                                required
                                className="w-full font-medium border-2 border-gray-500 rounded shadow-md p-2 text-base md:flex-1 md:max-w-[200px]"
                                value={remindBefore}
                                onChange={handleChange}
                            >
                                <option value="">Select an option</option>
                                <option value="1day">1 day</option>
                                <option value="3days">3 days</option>
                                <option value="1week">1 week</option>
                                <option value="3weeks">3 weeks</option>
                                <option value="1month">1 month</option>
                                <option value="3months">3 months</option>
                            </select>
                        </div>

                        {/* Reminder Type */}
                        <fieldset className="flex flex-col space-y-2 md:flex-row md:items-center md:gap-4">
                            <div className="md:w-[300px] md:flex-shrink-0">
                                <legend className="text-base font-medium text-black text-left md:text-lg">
                                    Choose Reminder Type:
                                </legend>
                            </div>
                            <label htmlFor="emailReminder" className="text-black text-sm font-medium flex items-center space-x-2 md:text-base md:flex-shrink-0">
                                <input type="checkbox" id="emailReminder" name="reminderType" defaultChecked />
                                <span>Email</span>
                            </label>
                            <label htmlFor="notificationReminder" className="text-black text-sm font-medium flex items-center space-x-2 md:text-base md:flex-shrink-0">
                                <input type="checkbox" id="notificationReminder" name="reminderType" defaultChecked />
                                <span>Pop-Up Notification</span>
                            </label>
                        </fieldset>

                        {/* Email (You noted to remove this) */}
                        <div className="flex flex-col space-y-2 md:flex md:flex-row md:items-center md:gap-4">
                            <label htmlFor="email" className="text-base font-medium text-black text-left md:text-lg md:w-[300px] md:flex-shrink-0">
                                Email Address:
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="youremail@domain.com"
                                required
                                className="w-full border-2 border-gray-500 rounded shadow-md p-2 text-base font-normal md:flex-1 md:max-w-[200px]"
                                value={email}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-between space-x-2 mt-auto py-4 md:flex md:flex-row md:items-center md:gap-28 md:justify-center">
                            <button
                                type="button"
                                className="flex-1 px-4 py-2 text-white text-base font-medium bg-green-600 hover:shadow-md md:flex-grow-0 md:w-24"
                                onClick={handleSave}
                            >
                                Save
                            </button>
                            <button className="flex-1 px-4 py-2 text-white text-base font-medium bg-red-600 hover:shadow-md md:flex-grow-0 md:w-24">
                                Cancel
                            </button>
                        </div>
                    </fieldset>
                </form>
            </div>
        </div>
    );
}
