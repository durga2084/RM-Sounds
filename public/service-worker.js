importScripts(
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyD2iIWjZzWwM7C7vSAsU9qklv4-3ceGbxI",
  authDomain: "rm-sounds.firebaseapp.com",
  projectId: "rm-sounds",
  storageBucket: "rm-sounds.firebasestorage.app",
  messagingSenderId: "319815354986",
  appId: "1:319815354986:web:fa574363c351848c809813",
});

const firebaseMessaging = firebase.messaging();

firebaseMessaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {};
  const title = notification.title || "RM Sounds";
  const body = notification.body || "You have a new notification.";
  const link = payload.data?.link || "/";
  self.registration.showNotification(title, {
    body,
    icon: notification.icon || "/icons/client-icon-192x192.png",
    badge: "/icons/client-icon-192x192.png",
    data: { link },
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const link = event.notification.data?.link || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(link);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(link);
        }
        return undefined;
      }),
  );
});
