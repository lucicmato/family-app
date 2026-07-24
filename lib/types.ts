// Result of a mutation (Server Action) — clearly signals success or failure,
// shared across all features (no silently swallowing errors).
export type ActionResult = { ok: true } | { ok: false; error: string };

// Type matching the `tasks` table in Supabase.
export type Task = {
  id: string;
  title: string;
  description: string | null;
  done: boolean;
  created_by: string | null;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
};
