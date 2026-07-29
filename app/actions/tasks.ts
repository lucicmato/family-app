"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getFamilyMembers, isValidAssignee } from "@/lib/family";
import type { ActionResult, Task } from "@/lib/types";

const AUTH_ERROR = "Niste prijavljeni.";

// Fetch all tasks: open ones first; within each group, soonest due date
// first (no due date = last), ties broken by priority, then newest first.
// Pass filter="mine" for tasks assigned to the current user, or
// filter="unassigned" for tasks with no assignee yet.
export const getTasks = async (
  filter?: "mine" | "unassigned",
): Promise<{
  tasks: Task[];
  error: string | null;
}> => {
  const user = await getCurrentUser();
  if (!user) {
    return { tasks: [], error: AUTH_ERROR };
  }

  const supabase = await createClient();
  let query = supabase.from("tasks").select("*");

  if (filter === "mine") {
    query = query.eq("assigned_to", user.id);
  } else if (filter === "unassigned") {
    query = query.is("assigned_to", null);
  }

  const { data, error } = await query
    .order("done", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("priority", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    return { tasks: [], error: error.message };
  }

  return { tasks: (data ?? []) as Task[], error: null };
};

// Add a new task.
export const addTask = async (formData: FormData): Promise<ActionResult> => {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: AUTH_ERROR };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { ok: false, error: "Ime taska je obavezan podatak." };
  }

  const dueDateRaw = String(formData.get("due_date") ?? "").trim();
  const priorityRaw = Number(formData.get("priority"));
  const assignedToRaw = String(formData.get("assigned_to") ?? "").trim();
  const assignedTo = assignedToRaw || null;

  const { self, partner, error: familyError } = await getFamilyMembers();
  if (familyError) {
    return { ok: false, error: `Greška pri dohvaćanju korisnika: ${familyError}` };
  }
  if (!isValidAssignee(assignedTo, self, partner)) {
    return { ok: false, error: "Nepoznata osoba za dodjelu." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    title,
    created_by: user.id,
    due_date: dueDateRaw || null,
    priority: [1, 2, 3].includes(priorityRaw) ? priorityRaw : 2,
    assigned_to: assignedTo,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/tasks");
  return { ok: true };
};

// Toggle the done/not-done status.
export const toggleTask = async (
  id: string,
  done: boolean,
): Promise<ActionResult> => {
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
};

// Reassign a task (null = unassigned).
export const setTaskAssignee = async (
  id: string,
  assignedTo: string | null,
): Promise<ActionResult> => {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: AUTH_ERROR };
  }

  const { self, partner, error: familyError } = await getFamilyMembers();
  if (familyError) {
    return { ok: false, error: `Greška pri dohvaćanju korisnika: ${familyError}` };
  }
  if (!isValidAssignee(assignedTo, self, partner)) {
    return { ok: false, error: "Nepoznata osoba za dodjelu." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ assigned_to: assignedTo, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/tasks");
  return { ok: true };
};

// Delete a task.
export const deleteTask = async (id: string): Promise<ActionResult> => {
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
};
