import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { FamilyMember } from "@/lib/types";

// Fetches the logged-in user + the other family member (if already signed
// in at least once — their `profiles` row is created on first login).
// There are always at most two users, so "partner" is just "the other row".
export const getFamilyMembers = cache(async (): Promise<{
  self: FamilyMember | null;
  partner: FamilyMember | null;
  error: string | null;
}> => {
  const user = await getCurrentUser();
  if (!user) {
    return { self: null, partner: null, error: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, user_name")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getFamilyMembers: profiles fetch failed:", error.message);
    return { self: null, partner: null, error: error.message };
  }

  const members = (data ?? []).map((row) => ({
    id: row.id,
    email: row.email,
    label: row.user_name || row.email,
  }));

  const self = members.find((m) => m.id === user.id) ?? null;
  const partner = members.find((m) => m.id !== user.id) ?? null;

  return { self, partner, error: null };
});

// Only self/partner (or unassigned) are valid — rejects stale or
// tampered-with ids so a task can't end up assigned to someone who
// isn't one of the two family members.
export const isValidAssignee = (
  candidate: string | null,
  self: FamilyMember | null,
  partner: FamilyMember | null,
): boolean =>
  candidate === null || candidate === self?.id || candidate === partner?.id;
