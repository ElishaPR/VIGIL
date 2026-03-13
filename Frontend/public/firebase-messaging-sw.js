importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyBszv0d2HJqPPOas8haUH1_rA92HlSGpmg",
    authDomain: "vigil-31e47.firebaseapp.com",
    projectId: "vigil-31e47",
    storageBucket: "vigil-31e47.firebasestorage.app",
    messagingSenderId: "975026624658",
    appId: "975026624658:web:b546002dc7707926c1ae4b"
});

// ← CORRECT METHOD for COMPAT
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload){
    console.log("✅ BACKGROUND MESSAGE:", payload);
    
    const title = payload.notification?.title || 'Vigil Alert';
    const options = {
        body: payload.notification?.body || 'Document expiring!',
        icon: "/icon.png",
        badge: "/icon.png",
        vibrate: [200, 100, 200],
        data: payload.data
    };
    
    self.registration.showNotification(title, options);
});