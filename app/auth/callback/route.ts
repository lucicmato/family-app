import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Defense in depth alongside the Supabase-dashboard signup restriction: even
// if signups were ever re-enabled, only these accounts can use the app.
const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

// Google redirects here after login; exchange the code for a session and forward.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const email = data.user?.email?.toLowerCase();
      if (email && ALLOWED_EMAILS.includes(email)) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login?error=not_allowed`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
