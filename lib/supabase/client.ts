import { createBrowserClient } from "@supabase/ssr";

// Supabase client for the browser (Client Components).
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
