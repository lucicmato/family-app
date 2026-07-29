"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Google OAuth and redirect the user to Google's consent screen.
export const signInWithGoogle = async (): Promise<never> => {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=auth");
  }

  redirect(data.url);
};

// Sign out.
export const signOut = async (): Promise<never> => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
};
