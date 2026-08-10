"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { ActionResult, ShoppingItem } from "@/lib/types";

const AUTH_ERROR = "Niste prijavljeni.";
const RETENTION_DAYS = 10;

// Fetch all shopping items: unchecked first, newest first within each
// group. Before reading, permanently deletes anything checked off more
// than 10 days ago — this is the only cleanup mechanism (no cron/edge
// function), so old purchases disappear the next time someone opens the
// list rather than on a fixed schedule.
export const getShoppingItems = async (): Promise<{
  items: ShoppingItem[];
  error: string | null;
}> => {
  const user = await getCurrentUser();
  if (!user) {
    return { items: [], error: AUTH_ERROR };
  }

  const supabase = await createClient();

  const cutoff = new Date(
    Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  // Best-effort cleanup: a failed delete shouldn't block reading the list.
  await supabase
    .from("shopping_items")
    .delete()
    .eq("done", true)
    .lt("checked_at", cutoff);

  const { data, error } = await supabase
    .from("shopping_items")
    .select("*")
    .order("done", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return { items: [], error: error.message };
  }

  return { items: (data ?? []) as ShoppingItem[], error: null };
};

// Add a new item.
export const addShoppingItem = async (
  formData: FormData,
): Promise<ActionResult> => {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: AUTH_ERROR };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { ok: false, error: "Naziv artikla je obavezan." };
  }

  const noteRaw = String(formData.get("note") ?? "").trim();

  const supabase = await createClient();
  const { error } = await supabase.from("shopping_items").insert({
    name,
    note: noteRaw || null,
    created_by: user.id,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/shopping");
  return { ok: true };
};

// Toggle bought/not-bought. Checking sets checked_by/checked_at (starts
// the 10-day countdown); unchecking clears both, so a later re-check
// restarts the countdown instead of inheriting a stale timestamp.
export const toggleShoppingItem = async (
  id: string,
  done: boolean,
): Promise<ActionResult> => {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: AUTH_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("shopping_items")
    .update(
      done
        ? {
            done: true,
            checked_by: user.id,
            checked_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : {
            done: false,
            checked_by: null,
            checked_at: null,
            updated_at: new Date().toISOString(),
          },
    )
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/shopping");
  return { ok: true };
};

// Delete an item (manual removal — independent of the 10-day auto-delete).
export const deleteShoppingItem = async (id: string): Promise<ActionResult> => {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: AUTH_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("shopping_items").delete().eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/shopping");
  return { ok: true };
};
