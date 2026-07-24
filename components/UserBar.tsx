import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";

// Shows the logged-in user + sign-out. Rendered as an async Server Component.
export async function UserBar() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-3 text-sm text-zinc-500 dark:text-zinc-400">
      <span className="truncate">{user.email}</span>
      <form action={signOut}>
        <button
          type="submit"
          className="shrink-0 underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Odjava
        </button>
      </form>
    </div>
  );
}
