import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Admin client with the service_role key — BYPASSES Row Level Security.
// Used EXCLUSIVELY on the server (never in a "use client" component), and
// only for operations that must read/write across user boundaries, e.g.
// fetching the other person's push subscriptions when sending notifications.
// A "server-only" import would throw if this module ever ended up in the client bundle.
export const createAdminClient = () =>
  createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );