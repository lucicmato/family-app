"use client";

import { useEffect } from "react";

// Registers the service worker after the page loads.
// Split into a small client component so the layout can stay a Server Component.
export const ServiceWorkerRegistrar = () => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch (error) {
        // Don't crash the app if registration fails — PWA is a progressive enhancement.
        console.error("Service worker registration failed:", error);
      }
    };

    register();
  }, []);

  return null;
};
