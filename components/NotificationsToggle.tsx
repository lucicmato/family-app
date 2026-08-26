"use client";

import { useEffect, useState } from "react";
import { savePushSubscription, removePushSubscription } from "@/app/actions/push";
import { useToast } from "@/components/Toast";

// The VAPID public key arrives as a base64url string; pushManager needs a Uint8Array.
const urlBase64ToUint8Array = (base64: string): Uint8Array<ArrayBuffer> => {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  // Explicit ArrayBuffer (not SharedArrayBuffer) so the type matches
  // applicationServerKey: BufferSource in strict mode.
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
};

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

type State = "loading" | "unsupported" | "off" | "on" | "denied";

// Button to turn push notifications on/off on THIS device.
// Permission is only requested on click (a browser requirement, especially on iOS).
export const NotificationsToggle = () => {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const showToast = useToast();

  // On startup, determine whether push is supported and whether this device is already subscribed.
  useEffect(() => {
    const init = async () => {
      // A missing key is a deploy misconfiguration, not an unsupported browser.
      // NEXT_PUBLIC_* is inlined at build time, so an env var absent on the
      // deploy target has no symptom other than this button vanishing. Nothing
      // the user can act on, so it goes to the console, not the UI.
      if (!PUBLIC_KEY) {
        console.error(
          "NotificationsToggle: NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing from this build — push is unavailable.",
        );
        setState("unsupported");
        return;
      }

      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

      if (!supported) {
        setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        setState("denied");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      setState(existing ? "on" : "off");
    };

    init().catch((error) => {
      console.error("NotificationsToggle: init failed:", error);
      setState("unsupported");
    });
  }, []);

  const enable = async () => {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "off");
        showToast("Obavijesti nisu dopuštene.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_KEY!),
      });

      const result = await savePushSubscription(
        subscription.toJSON() as {
          endpoint: string;
          keys: { p256dh: string; auth: string };
        },
      );

      if (result.ok) {
        setState("on");
        showToast("Obavijesti uključene 🔔");
      } else {
        await subscription.unsubscribe();
        setState("off");
        showToast(`Greška: ${result.error}`);
      }
    } catch {
      showToast("Greška pri uključivanju obavijesti.");
      setState("off");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await removePushSubscription(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setState("off");
      showToast("Obavijesti isključene.");
    } catch {
      showToast("Greška pri isključivanju obavijesti.");
    } finally {
      setBusy(false);
    }
  };

  if (state === "loading" || state === "unsupported") return null;

  if (state === "denied") {
    return (
      <p className="text-xs text-zinc-400">
        Obavijesti su blokirane u postavkama preglednika za ovu stranicu.
      </p>
    );
  }

  const on = state === "on";
  return (
    <button
      type="button"
      onClick={on ? disable : enable}
      disabled={busy}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${
        on
          ? "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400"
          : "border border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
      }`}
    >
      {busy ? "…" : on ? "🔔 Obavijesti uključene" : "🔕 Uključi obavijesti"}
    </button>
  );
};