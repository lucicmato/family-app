// Result of a mutation (Server Action) — clearly signals success or failure,
// shared across all features (no silently swallowing errors).
export type ActionResult = { ok: true } | { ok: false; error: string };

// 1 = high, 2 = medium, 3 = low — lower number = higher priority.
export type Priority = 1 | 2 | 3;

// Type matching the `tasks` table in Supabase.
export type Task = {
  id: string;
  title: string;
  description: string | null;
  done: boolean;
  created_by: string | null;
  assigned_to: string | null;
  due_date: string | null;
  priority: Priority;
  created_at: string;
  updated_at: string;
};

// One of the two family members, matching the `profiles` table.
export type FamilyMember = {
  id: string;
  email: string;
  label: string;
};

// Type matching the `shopping_items` table in Supabase.
export type ShoppingItem = {
  id: string;
  name: string;
  note: string | null;
  // Store department key from lib/shoppingCategories.ts; plain string
  // because the DB column isn't an enum and may hold a retired key.
  category: string;
  done: boolean;
  created_by: string | null;
  checked_by: string | null;
  checked_at: string | null;
  created_at: string;
  updated_at: string;
};
