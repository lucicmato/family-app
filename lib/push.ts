import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

// Web Push configuration (VAPID) — identifies our server to push services.
// Set once per process. VAPID_PRIVATE_KEY is secret, server-only.
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

let configured = false;
const ensureConfigured = (): boolean => {
  if (configured) return true;
  if (!publicKey || !privateKey) return false;
  // The "mailto:" contact is part of the VAPID standard (who the push service contacts if there's a problem).
  webpush.setVapidDetails("mailto:lucicmato93@gmail.com", publicKey, privateKey);
  configured = true;
  return true;
};

// Notification content that reaches the service worker.
export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

// Send a push to all of one user's devices.
// Reads subscriptions via the admin (service_role) client because RLS
// would otherwise block reading another user's rows. Deletes invalid
// subscriptions (404/410). Intentionally NEVER throws — sending a
// notification is "best effort" and must not break the main mutation
// (adding/assigning a task).
export const sendPushToUser = async (
  userId: string,
  payload: PushPayload,
): Promise<void> => {
  if (!ensureConfigured()) {
    console.warn("Push is not configured (missing VAPID keys) — skipping.");
    return;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) {
    console.error("sendPushToUser: fetching subscriptions failed:", error.message);
    return;
  }

  const subscriptions = data ?? [];
  if (subscriptions.length === 0) return;

  const body = JSON.stringify(payload);

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body,
        );
      } catch (err) {
        // 404/410 = the subscription no longer exists (the user disabled
        // notifications or removed the app) → clean it up from the database.
        const statusCode =
          typeof err === "object" && err !== null && "statusCode" in err
            ? (err as { statusCode?: number }).statusCode
            : undefined;

        if (statusCode === 404 || statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
        } else {
          console.error("sendPushToUser: sending failed:", err);
        }
      }
    }),
  );
};