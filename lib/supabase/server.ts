import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase client for the server (Server Components, Server Actions).
// cookies() is async in Next.js 16, which is why this is an async function too.
export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // setAll called from a Server Component — can be ignored
            // if middleware exists that refreshes the session.
          }
        },
      },
    },
  );
};
