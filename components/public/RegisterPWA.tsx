"use client";

import { useEffect } from "react";

export default function RegisterPWA({ manifestHref }: { manifestHref: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", async () => {
        try {
          await navigator.serviceWorker.register("/service-worker.js");
          console.log("Service worker registered.");
        } catch (error) {
          console.error("Service worker registration failed:", error);
        }
      });
    }
  }, []);

  return (
    <link rel="manifest" href={manifestHref} />
  );
}
