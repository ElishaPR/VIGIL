import React, { useState } from "react";
import { messaging } from "../firebase";
import { getToken } from "firebase/messaging";
import { AuthLayout } from "../components/Auth/AuthLayout";
import { AuthCard } from "../components/Auth/AuthCard";
import { AuthHeader } from "../components/Auth/AuthHeader";
import { FormInput } from "../components/Auth/FormInput";
import { PrimaryButton } from "../components/Auth/PrimaryButton";

export function AddReminderPage() {
    const [docCategory, setDocCategory] = useState("");
    const [reminderTitle, setReminderTitle] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [scheduleType, setScheduleType] = useState("");
    const [reminderAt, setReminderAt] = useState("");
    const [repeatType, setRepeatType] = useState("");
    const [pushNotification, setPushNotification] = useState(false);
    const [priority, setPriority] = useState("");
    const [notes, setNotes] = useState("");
    const [uploadedFile, setUploadedFile] = useState(null);
    
    const handleAddReminder = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append(
            "reminder_data", JSON.stringify({
                reminder: {
                    reminder_title: reminderTitle,
                    schedule_type: scheduleType,
                    reminder_at: reminderAt,
                    repeat_type: repeatType,
                    push_notification: pushNotification,
                    priority: priority,
                    notes: notes
                },
                document: {
                    doc_category: docCategory,
                    expiry_date: expiryDate
                }
            })
        );

        if(uploadedFile){
            formData.append("uploaded_doc", uploadedFile);
        }

        if(pushNotification){
            let permission = Notification.permission;

            if(permission !== "granted"){
                permission = await Notification.requestPermission();
            }

            if(permission === "granted"){
                let registration = await navigator.serviceWorker.getRegistration();

                if(!registration){
                    registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
                }

                const token = await getToken(messaging, {
                    vapidKey: import.meta.env.VITE_FIREBASE_PUBLIC_VAPID_KEY,
                    serviceWorkerRegistration: registration
                });

                if (token){
                    await fetch("http://localhost:8000/users/save-fcm-token", {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json"},
                        body: JSON.stringify({ fcm_token: token})
                    });
                }
            } else {
                alert("Push notification permission denied.");
                setPushNotification(false);
            }
        }
        
        const response = await fetch("http://localhost:8000/reminders/addreminder", {
            method: "POST",
            credentials: "include",
            body: formData
        });
        
        const result = await response.json();
        alert(result.message);       
    };

    return (
        <AuthLayout>
            <AuthCard>
                <form 
                className="flex flex-col h-full p-4 space-y-4 md:p-6 lg:p-8"
                onSubmit={handleAddReminder}>

                    <AuthHeader title="Add Reminder" />

                    <FormInput 
                    label="Document Category:" 
                    id="docCategory" 
                    type="text" 
                    value={docCategory} 
                    onChangeValue={setDocCategory}/>

                    <FormInput 
                    label="Reminder Title:" 
                    id="reminderTitle" 
                    type="text" 
                    value={reminderTitle} 
                    onChangeValue={setReminderTitle}/>
                    
                    <FormInput 
                    label="Expiry Date:" 
                    id="expiryDate" 
                    type="date" 
                    value={expiryDate} 
                    onChangeValue={setExpiryDate}/>

                    <div className="flex flex-col space-y-2 md:flex-row md:items-center md:gap-4">
                        <div className="md:w-[300px] md:flex-shrink-0">
                            <legend 
                            className="text-base font-medium text-black text-left md:text-lg">
                                Choose Reminder Type:
                            </legend>
                        </div>
                        <label 
                        htmlFor="emailReminder" 
                        className="text-black text-sm font-medium flex items-center space-x-2 md:text-base md:flex-shrink-0">
                            <input 
                            type="radio" 
                            id="default" 
                            name="scheduleType" 
                            value="DEFAULT" 
                            onChange={(e) => setScheduleType(e.target.value)}/>
                            <span>Default</span>
                        </label>
                        <label 
                        htmlFor="notificationReminder" 
                        className="text-black text-sm font-medium flex items-center space-x-2 md:text-base md:flex-shrink-0">
                            <input 
                            type="radio" 
                            id="custom" 
                            name="scheduleType" 
                            value="CUSTOM" 
                            onChange={(e) => setScheduleType(e.target.value)}/>
                            <span>Custom</span>
                        </label>
                    </div>

                    <FormInput 
                    label="Reminder Date:" 
                    id="reminderAt" 
                    type="date" 
                    value={reminderAt} 
                    onChangeValue={setReminderAt}/>

                    <div className="flex flex-col space-y-2 md:flex md:flex-row md:items-center md:gap-4">
                        <label 
                        htmlFor="repeatType" 
                        className="text-base font-medium text-black text-left md:text-lg md:w-[300px] md:flex-shrink-0">
                            Repeat:
                        </label>
                        <select 
                        id="repeatType" 
                        required 
                        className="w-full font-medium border-2 border-gray-500 rounded shadow-md p-2 text-base md:flex-1 md:max-w-[200px]"
                        value={repeatType}
                        onChange={(e) => setRepeatType(e.target.value)}>
                            <option value="NONE">NONE</option>
                            <option value="WEEKLY">WEEKLY</option>
                            <option value="MONTHLY">MONTHLY</option>
                            <option value="YEARLY">YEARLY</option>
                        </select>
                    </div>

                    <div className="flex flex-col space-y-2 md:flex md:flex-row md:items-center md:gap-4">
                        <label 
                        htmlFor="pushNotification" 
                        className="text-black text-sm font-medium flex items-center space-x-2 md:text-base md:flex-shrink-0">
                            <input 
                            type="checkbox" 
                            id="pushNotification" 
                            name="pushNotification"
                            checked={pushNotification}
                            onChange={(e) => setPushNotification(e.target.checked)} />
                            <span>Enable Pop-Up Notification</span>
                        </label>
                    </div>

                    <div className="flex flex-col space-y-2 md:flex md:flex-row md:items-center md:gap-4">
                        <label 
                        htmlFor="priority" 
                        className="text-base font-medium text-black text-left md:text-lg md:w-[300px] md:flex-shrink-0">
                            Priority:
                        </label>
                        <select 
                        id="priority" 
                        required 
                        className="w-full font-medium border-2 border-gray-500 rounded shadow-md p-2 text-base md:flex-1 md:max-w-[200px]"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                    </div>

                    <FormInput 
                    label="Notes(Optional):" 
                    id="notes" 
                    type="text" 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)} />

                    <div className="flex flex-col space-y-2">
                        <label 
                        htmlFor="uploadedFile" 
                        className="text-black text-lg font-medium text-left">
                            Upload Document:
                        </label>
                        <input 
                        type="file" 
                        id="uploadedFile" 
                        placeholder="Choose a file" 
                        className="w-full border border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 rounded p-2 text-base font-normal md:max-w-[300px]" 
                        onChange={(e) => setUploadedFile(e.target.files[0])}/>
                    </div>
                    
                    <div className="flex flex-col pt-4 justify-center ">
                        <PrimaryButton 
                        text="Add" 
                        type="submit" 
                        variant="primary" />

                        <PrimaryButton 
                        text="Cancel" 
                        type="button" 
                        onClick={() => window.history.back()} 
                        variant="secondary"/>

                        <PrimaryButton 
                        text="Reset" 
                        type="reset" 
                        variant="danger"/>
                    </div>
                </form>
            </AuthCard>
        </AuthLayout>
    );
}