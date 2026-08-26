"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { ActionResult } from "@/lib/types";

const AUTH_ERROR = "Niste prijavljeni.";

// Data the browser provides when subscribing (PushSubscription.toJSON()).
type SubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

// Save (or refresh) this device's subscription for the current user.
// RLS requires user_id = auth.uid(), so we write under the signed-in user.
// upsert by endpoint: the same device isn't duplicated if it subscribes again.
export const savePushSubscription = async (
  subscription: SubscriptionInput,
): Promise<ActionResult> => {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: AUTH_ERROR };
  }

  if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return { ok: false, error: "Nevaljana pretplata." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
};

// Remove this device's subscription (when the user turns off notifications).
export const removePushSubscription = async (
  endpoint: string,
): Promise<ActionResult> => {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: AUTH_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
};