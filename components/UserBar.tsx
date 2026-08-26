import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/actions/auth";
import { NotificationsToggle } from "@/components/NotificationsToggle";

// Shows the logged-in user + sign-out. Rendered as an async Server Component.
export const UserBar = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
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
      <NotificationsToggle />
    </div>
  );
};
