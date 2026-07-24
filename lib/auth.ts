import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Fetch the logged-in user (or null). cache() dedupes the call within the
// same request if both the page and UserBar call it during the same render.
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
});
