import Link from "next/link";
import { getTasks } from "@/app/actions/tasks";
import { AddTaskForm } from "@/components/AddTaskForm";
import { TaskItem } from "@/components/TaskItem";
import { UserBar } from "@/components/UserBar";

export default async function TasksPage() {
  const { tasks, error } = await getTasks();

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

      <AddTaskForm />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40">
          Greška pri dohvaćanju: {error}
        </p>
      )}

      {tasks.length === 0 && !error ? (
        <p className="py-8 text-center text-zinc-400">
          Nema zadataka. Dodaj prvi gore. 👆
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}
    </main>
  );
}
