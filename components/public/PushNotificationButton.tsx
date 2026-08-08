"use client";

import { useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { enablePushNotifications } from "@/lib/firebase-client";

export default function PushNotificationButton({
  role,
}: {
  role: "Customer" | "Admin";
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (typeof window !== "undefined" && !("Notification" in window)) {
    return null;
  }

  const permission =
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "default";

  if (permission === "granted") return null;

  async function handleEnable() {
    setLoading(true);
    setMessage("");

    try {
      await enablePushNotifications(role);
      setMessage("Notifications enabled.");
      window.setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to enable notifications.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-24 right-4 z-[9998] max-w-xs">
      <button
        type="button"
        onClick={handleEnable}
        disabled={loading}
        className="flex items-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-[#0B0F19] shadow-2xl transition hover:scale-[1.02] disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : permission === "denied" ? (
          <BellOff className="h-4 w-4" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        {permission === "denied"
          ? "Allow notifications in browser settings"
          : "Enable notifications"}
      </button>

      {message && (
        <p className="mt-2 rounded-xl bg-black/80 px-3 py-2 text-xs text-white">
          {message}
        </p>
      )}
    </div>
  );
}
