importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyDKEfiFpIoDovgHAmfx21TaWgilbMK8eh4",
  authDomain: "prohome-af6b4.firebaseapp.com",
  projectId: "prohome-af6b4",
  storageBucket: "prohome-af6b4.firebasestorage.app",
  messagingSenderId: "442215237822",
  appId: "1:442215237822:web:2650891ee340955cd736ef",
});

const messaging = firebase.messaging();

// Fon (background) da kelgan notificationlarni ushlaydi
messaging.onBackgroundMessage((payload) => {
  console.log("Background xabar keldi:", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/logo192.png",
  });
});
