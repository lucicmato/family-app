import Link from "next/link";
import { UserBar } from "@/components/UserBar";

// List of app features. New feature = new entry here + new route.
const FEATURES = [
  {
    href: "/tasks",
    title: "Zadaci",
    description: "Zajednički popis svakodnevnih zadataka.",
    icon: "✅",
  },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8">
      <UserBar />

      <h1 className="text-2xl font-semibold tracking-tight">
        Obiteljska aplikacija
      </h1>

      <nav className="flex flex-col gap-3">
        {FEATURES.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-5 text-left transition active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="text-2xl">{feature.icon}</span>
            <span className="flex-1">
              <span className="block text-lg font-medium">
                {feature.title}
              </span>
              <span className="block text-sm text-zinc-500 dark:text-zinc-400">
                {feature.description}
              </span>
            </span>
            <span className="text-zinc-400">›</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
