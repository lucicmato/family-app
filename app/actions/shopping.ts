"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { categorizeItem } from "@/lib/categorizeItem";
import { INPUT_LIMITS } from "@/lib/inputLimits";
import { categoryIndex } from "@/lib/shoppingCategories";
import type { ActionResult, ShoppingItem } from "@/lib/types";

const AUTH_ERROR = "Niste prijavljeni.";
const RETENTION_DAYS = 10;

// Fetch all shopping items: unchecked first, silently ordered by store
// department (no headings in the UI), then checked items newest first.
// Before reading, permanently deletes anything checked off more than 10 days
// ago — this is the only cleanup mechanism (no cron/edge
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

  // Store-walk order lives in code (SHOPPING_CATEGORIES), not the DB, so it
  // is applied here. Array.sort is stable, so the DB's newest-first order
  // survives within each department. Checked items skip the department step:
  // they're history, and newest-first is what matters there.
  const items = ((data ?? []) as ShoppingItem[]).sort(
    (a, b) =>
      Number(a.done) - Number(b.done) ||
      (a.done ? 0 : categoryIndex(a.category) - categoryIndex(b.category)),
  );

  return { items, error: null };
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

  if (name.length > INPUT_LIMITS.shoppingName) {
    return { ok: false, error: `Naziv može imati najviše ${INPUT_LIMITS.shoppingName} znakova.` };
  }

  const noteRaw = String(formData.get("note") ?? "").trim();
  if (noteRaw.length > INPUT_LIMITS.shoppingNote) {
    return { ok: false, error: `Napomena može imati najviše ${INPUT_LIMITS.shoppingNote} znakova.` };
  }

  // Only after validation: this may call the paid Anthropic API.
  const category = await categorizeItem(name);

  const supabase = await createClient();
  const { error } = await supabase.from("shopping_items").insert({
    name,
    note: noteRaw || null,
    category,
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
