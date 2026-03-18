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

  self.registration.showNotification(
    payload.notification?.title || "Yangi bildirishnoma",
    {
      body: payload.notification?.body || "",
      icon: "/ProHomeLogo.png",
      badge: "/ProHomeLogo.png",
    },
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification?.data?.link || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    }),
  );
});
