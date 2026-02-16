import React, { useState } from "react";

export function AddReminderForm3() {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [userSelectedDate, setUserSelectedDate] = useState("");
    const [remindBefore, setRemindBefore] = useState("");
    const [email, setEmail] = useState("");
    const [timezone, setTimezone] = useState("UTC");  // New: Timezone state

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("🟢 Submit clicked");

        if (!uploadedFile) {
            alert("Please upload a file");
            return;
        }

        try {
            console.log("🟡 Before subscribeToPush");
            const pushSubscription = await subscribeToPush();
            console.log("🟢 After subscribeToPush", pushSubscription);

            console.log("🟡 Creating FormData");
            const formData = new FormData();
            formData.append("file", uploadedFile);
            formData.append("expiry_date", userSelectedDate);
            formData.append("remind_before", remindBefore);
            formData.append("email", email);
            formData.append("timezone", timezone);

            if (pushSubscription) {
                formData.append(
                    "push_subscription",
                    JSON.stringify(pushSubscription)
                );
            }

            console.log("🟡 Before fetch");
            const response = await fetch("http://localhost:8000/upload-reminder", {
                method: "POST",
                body: formData,
            });

            console.log("🟢 After fetch", response);
            const result = await response.json();
            alert(result.message);

        } catch (err) {
            console.error("❌ Form submit failed:", err);
            alert("Something went wrong. Check console.");
        }
    };

    function urlBase64ToUint8Array(base64String) {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const rawData = window.atob(base64);
        return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
    }


    let cachedSubscription = null;

    async function subscribeToPush() {
        if (!("serviceWorker" in navigator)) return null;
        // if (cachedSubscription) return cachedSubscription;

        const permission =
            Notification.permission === "granted"
                ? "granted"
                : await Notification.requestPermission();

        if (permission !== "granted") return null;
        const registration = await navigator.serviceWorker.ready;
        if (!navigator.serviceWorker.controller) {
            console.warn("Service worker not controlling the page yet");
            return null;
        }
        // const registration =
        //     (await navigator.serviceWorker.getRegistration()) ||
        //     (await navigator.serviceWorker.register("/sw.js"));

    // 🔥 Edge-safe cleanup
        let subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            await subscription.unsubscribe();
        }
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                "BERPBj9_A1Y28bm2WFeYyb50vVn6wdfzvVLzgzqfPfWf7vBkkVGJ7YGZ-tHcXgszX7tEHzzyDyrxwZutw837W_w"
            ),
        });
        console.log("🧩 Edge subscription object:", subscription);
        console.log("🧩 Edge subscription JSON:", JSON.stringify(subscription));

        
        return subscription;
    }



    return (
        <div className="fixed inset-0 bg-gray-200 flex justify-center items-center">
            <div className="w-full max-w-sm h-auto bg-white rounded-lg shadow-lg overflow-y-auto flex flex-col md:w-full md:max-w-4xl md:mx-8">
                <form className="flex flex-col h-full p-4 md:p-6 lg:p-8" onSubmit={handleSubmit}>
                    <fieldset className="space-y-4 flex flex-col">
                        <legend className="txt-xl font-semibold text-black text-center md:text-2xl">
                            Add Document Reminder
                        </legend>

                        <div className="flex flex-col space-y-2 md:flex md:flex-row md:items-center md:gap-4">
                            <label htmlFor="uploadedFile" className="text-black text-base font-medium text-left md:text-lg md:w-[300px] flex-shrink-0">
                                Upload a Document:
                            </label>
                            <input
                                type="file"
                                id="uploadedFile"
                                className="w-full border-2 border-gray-500 rounded shadow-md p-2 text-base font-normal md:flex-1 md:max-w-[300px]"
                                onChange={(e) => setUploadedFile(e.target.files[0])}
                            />
                        </div>

                        <div className="flex flex-col space-y-2 md:flex md:flex-row md:items-center md:gap-4">
                            <label htmlFor="expDate" className="text-black text-base font-medium text-left md:text-lg md:w-[300px] flex-shrink-0">
                                Expiry Date:
                            </label>
                            <input
                                type="date"
                                id="expDate"
                                className="w-full font-medium border-2 border-gray-500 rounded shadow-md p-2 text-base font-normal md:flex-1 md:max-w-[200px]"
                                value={userSelectedDate}
                                onChange={(e) => setUserSelectedDate(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col space-y-2 md:flex md:flex-row md:items-center md:gap-4">
                            <label htmlFor="reminderOpt" className="text-base font-medium text-black text-left md:text-lg md:w-[300px] md:flex-shrink-0">
                                Remind me before expiry:
                            </label>
                            <select
                                id="reminderOpt"
                                required
                                className="w-full font-medium border-2 border-gray-500 rounded shadow-md p-2 text-base md:flex-1 md:max-w-[200px]"
                                value={remindBefore}
                                onChange={(e) => setRemindBefore(e.target.value)}
                            >
                                <option value="">Select</option>
                                <option value="1day">1 day</option>
                                <option value="3days">3 days</option>
                                <option value="1week">1 week</option>
                                <option value="3weeks">3 weeks</option>
                                <option value="1month">1 month</option>
                                <option value="3months">3 months</option>
                            </select>
                        </div>

                        <div className="flex flex-col space-y-2 md:flex md:flex-row md:items-center md:gap-4">
                            <label htmlFor="email" className="text-base font-medium text-black text-left md:text-lg md:w-[300px] md:flex-shrink-0">
                                Email Address:
                            </label>
                            <input
                                type="email"
                                id="email"
                                placeholder="youremail@domain.com"
                                required
                                className="w-full border-2 border-gray-500 rounded shadow-md p-2 text-base font-normal md:flex-1 md:max-w-[200px]"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* New: Timezone selector */}
                        <div className="flex flex-col space-y-2 md:flex md:flex-row md:items-center md:gap-4">
                            <label htmlFor="timezone" className="text-base font-medium text-black text-left md:text-lg md:w-[300px] md:flex-shrink-0">
                                Timezone:
                            </label>
                            <select
                                id="timezone"
                                required
                                className="w-full font-medium border-2 border-gray-500 rounded shadow-md p-2 text-base md:flex-1 md:max-w-[200px]"
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                            >
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">Eastern Time</option>
                                <option value="America/Los_Angeles">Pacific Time</option>
                                {/* Add more as needed */}
                            </select>
                        </div>

                        <div className="flex justify-between space-x-2 mt-auto py-4 md:flex md:flex-row md:items-center md:gap-28 md:justify-center">
                            <button className="flex-1 px-4 py-2 text-white text-base font-medium bg-green-600 hover:shadow-md md:flex-grow-0 md:w-24">
                                Save
                            </button>
                            <button className="flex-1 px-4 py-2 text-white text-base font-medium bg-red-500 hover:shadow-md md:flex-grow-0 md:w-24">
                                Cancel
                            </button>
                        </div>
                    </fieldset>
                </form>
            </div>
        </div>
    );
}