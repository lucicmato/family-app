"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { ActionResult, Task } from "@/lib/types";

const AUTH_ERROR = "Niste prijavljeni.";

// Fetch all tasks: open ones first, newest first within each group.
export async function getTasks(): Promise<{
  tasks: Task[];
  error: string | null;
}> {
  const user = await getCurrentUser();
  if (!user) {
    return { tasks: [], error: AUTH_ERROR };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("done", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return { tasks: [], error: error.message };
  }

  return { tasks: (data ?? []) as Task[], error: null };
}

// Add a new task.
export async function addTask(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: AUTH_ERROR };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { ok: false, error: "Ime taska je obavezan podatak." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .insert({ title, created_by: user.id });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/tasks");
  return { ok: true };
}

// Toggle the done/not-done status.
export async function toggleTask(
  id: string,
  done: boolean,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: AUTH_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ done, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/tasks");
  return { ok: true };
}

// Delete a task.
export async function deleteTask(id: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: AUTH_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/tasks");
  return { ok: true };
}
