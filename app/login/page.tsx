import { signInWithGoogle } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-8 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Obiteljska aplikacija
      </h1>
      <p className="text-zinc-500 dark:text-zinc-400">
        Prijavi se da vidiš zajedničke zadatke.
      </p>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40">
          Prijava nije uspjela. Pokušaj ponovno.
        </p>
      )}

      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-6 py-3 text-base font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Prijava s Google računom
        </button>
      </form>
    </main>
  );
}
