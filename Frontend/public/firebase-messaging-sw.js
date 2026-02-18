self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("push", function (event) {
    const data = event.data ? event.data.json() : {};

    event.waitUntil(
        self.registration.showNotification(data.title || "Reminder", {
            body: data.body || "You have a reminder",
            icon: "/icon.png",
        })
    );
});
