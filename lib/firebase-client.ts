"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, isSupported, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export async function enablePushNotifications(
  role: "Customer" | "Admin",
  customerMobile?: string,
) {
  if (typeof window === "undefined" || !("Notification" in window)) {
    throw new Error("This browser does not support notifications.");
  }

  const supported = await isSupported();
  if (!supported) {
    throw new Error("Firebase Cloud Messaging is not supported in this browser.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const registration = await navigator.serviceWorker.ready;
  const messaging = getMessaging(getFirebaseApp());

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    throw new Error("Firebase did not return a push notification token.");
  }

  localStorage.setItem("RM_FCM_TOKEN", token);

  const response = await fetch("/api/notifications/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(role === "Admin"
        ? {
            Authorization: `Bearer ${localStorage.getItem("AdminToken") ?? ""}`,
          }
        : {}),
    },
    body: JSON.stringify({
      token,
      role,
      customerMobile: customerMobile || localStorage.getItem("RMCustomerMobile") || "",
    }),
  });

  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to save push subscription.");
  }

  return token;
}

export async function identifyCustomerPushSubscription(
  customerMobile: string,
) {
  if (typeof window === "undefined") return;

  const token = localStorage.getItem("RM_FCM_TOKEN");
  if (!token) return;

  await fetch("/api/notifications/identify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      customerMobile,
    }),
  });
}

export async function listenForForegroundMessages(
  callback: (payload: unknown) => void,
) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;

  const supported = await isSupported();
  if (!supported) return;

  const messaging = getMessaging(getFirebaseApp());
  return onMessage(messaging, callback);
}
