import Link from "next/link";
import { getTasks } from "@/app/actions/tasks";
import { getFamilyMembers } from "@/lib/family";
import { AddTaskForm } from "@/components/AddTaskForm";
import { TaskItem } from "@/components/TaskItem";
import { UserBar } from "@/components/UserBar";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const activeFilter = filter === "mine" || filter === "unassigned" ? filter : undefined;

  const [
    { tasks, error: tasksError },
    { self, partner, error: familyError },
  ] = await Promise.all([getTasks(activeFilter), getFamilyMembers()]);

  const error = tasksError ?? familyError;

  const tabs = [
    { key: undefined, href: "/tasks", label: "Svi" },
    { key: "mine" as const, href: "/tasks?filter=mine", label: "Moji" },
    {
      key: "unassigned" as const,
      href: "/tasks?filter=unassigned",
      label: "Nedodijeljeni",
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8">
      <UserBar />

      <div className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Natrag na izbornik"
          className="rounded-md p-1 text-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ←
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Naši zadaci</h1>
      </div>

      <AddTaskForm self={self} partner={partner} />

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              activeFilter === tab.key
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40">
          Greška pri dohvaćanju: {error}
        </p>
      )}

      {tasks.length === 0 && !error ? (
        <p className="py-8 text-center text-zinc-400">
          {activeFilter === "mine"
            ? "Nema zadataka dodijeljenih tebi."
            : activeFilter === "unassigned"
              ? "Svi zadaci su dodijeljeni."
              : "Nema zadataka. Dodaj prvi gore. 👆"}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} self={self} partner={partner} />
          ))}
        </ul>
      )}
    </main>
  );
}
