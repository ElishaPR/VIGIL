import React, {useState} from "react";
import FileValidator from "../../components/User/FileValidator.jsx";
import ExpiryDateChecker from "../../components/User/ExpiryDateChecker.jsx";

export function AddReminderForm() {
    const[uploadedFile,getFile] = useState("");
    const[userSelectedDate, getDate] = useState("");
    const[remindBefore, getRemindBefore] = useState("");

    return (
        <div className="fixed inset-0 bg-gray-200 flex justify-center items-center">
            <div className="w-full max-w-sm  h-auto bg-white border border-gray-300 rounded-lg shadow-lg overflow-y-auto flex flex-col md:w-full md:max-w-4xl md:mx-8 border-4 border-gray-300">
                <form className="flex flex-col h-full p-4 md:p-6 lg:p-8">
                    <fieldset className="space-y-4 flex flex-col">
                        <legend className="text-xl font-semibold text-black text-center md:text-2xl">Add Document Reminder</legend>

                        <div className="flex flex-col space-y-2 md:flex md:flex-row md:items-center md:gap-4">
                            <label htmlFor="uploadedFile" className="text-black text-base font-medium text-left md:text-lg md:w-[300px] md:flex-shrink-0">Upload a Document:</label>
                            <input 
                            type="file" 
                            id="uploadedFile"
                            value={uploadedFile} 
                            accept="application/pdf,image/jpeg,image/png,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            className="w-full border-2 border-gray-500 rounded shadow-md p-2 text-base font-normal md:flex-1 md:max-w-[300px]" 
                            onChange={(e)=>getFile(e.target.files[0])}/>
                            <FileValidator uploadedFile={uploadedFile}/>
                            <div className="absolute left-0 bg-gray-800 text-white opacity-0 group-hover:opacity-100">
                                <p> Allowed file formats - pdf, jpeg/jpg, png, doc, docx, xls, xlsx!</p>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-2 md:flex md:flex-row md:items-center md:gap-4">
                            <label htmlFor="expDate" className="text-black text-base font-medium text-left md:text-lg md:w-[300px] md:flex-shrink-0 ">Expiry Date:</label>
                            <input 
                            type="date" 
                            id="expDate" 
                            value={userSelectedDate}
                            required 
                            className="w-full font-medium border-2 border-gray-500 rounded shadow-md p-2 text-base font-normal md:flex-1 md:max-w-[200px]"
                            onChange={(e)=>getDate(e.target.value)}/>
                            <ExpiryDateChecker userSelectedDate={userSelectedDate}/>     
                        </div>

                        <div className="flex flex-col space-y-2 md:flex md:flex-row md:items-center md:gap-4">
                            <label htmlFor="reminderOpt" className="text-base font-medium text-black text-left md:text-lg md:w-[300px] md:flex-shrink-0">Remind me before expiry:</label>
                            <select 
                            id="reminderOpt" 
                            required 
                            className="w-full font-medium border-2 border-gray-500 rounded shadow-md p-2 text-base md:flex-1 md:max-w-[200px]"
                            value={remindBefore}
                            onChange={(e)=>getRemindBefore(e.target.value)}>
                                <option value="1day">1 day</option>
                                <option value="3days">3 days</option>
                                <option value="1week">1 week</option>
                                <option value="3weeks">3 weeks</option>
                                <option value="1month">1 month</option>
                                <option value="3months">3 months</option>
                            </select>
                        </div>

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

                        {/* This should be removed. */}
                        <div className="flex flex-col space-y-2 md:flex md:flex-row md:items-center md:gap-4">
                            <label htmlFor="email" className="text-base font-medium text-black text-left md:text-lg md:w-[300px] md:flex-shrink-0">Email Address:</label>
                            <input type="email" id="email" placeholder="youremail@domain.com" required className="w-full border-2 border-gray-500 rounded shadow-md p-2 text-base font-normal md:flex-1 md:max-w-[200px]" />
                        </div>

                        <div className="flex justify-between space-x-2 mt-auto py-4 md:flex md:flex-row md:items-center md:gap-28 md:justify-center">
                            <button className="flex-1 px-4 py-2 text-white text-base font-medium bg-green-600 hover:shadow-md md:flex-grow-0 md:w-24">Save</button>
                            <button className="flex-1 px-4 py-2 text-white text-base font-medium bg-red-600 hover:shadow-md md:flex-grow-0 md:w-24">Cancel</button>
                        </div>
                    </fieldset>
                </form>
            </div>
        </div>
    );
}
