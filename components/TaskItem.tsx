"use client";

import { useTransition } from "react";
import type { Task } from "@/lib/types";
import { toggleTask, deleteTask } from "@/app/actions/tasks";

// One row in the list: done checkbox + delete.
export function TaskItem({ task }: { task: Task }) {
  const [pending, startTransition] = useTransition();

  function onToggle() {
    startTransition(async () => {
      await toggleTask(task.id, !task.done);
    });
  }

  function onDelete() {
    startTransition(async () => {
      await deleteTask(task.id);
    });
  }

  return (
    <li
      className={`flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 ${
        pending ? "opacity-50" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={task.done}
        onChange={onToggle}
        disabled={pending}
        className="h-5 w-5 shrink-0 accent-zinc-900 dark:accent-zinc-100"
      />
      <span
        className={`flex-1 text-base ${
          task.done ? "text-zinc-400 line-through" : ""
        }`}
      >
        {task.title}
      </span>
      <button
        onClick={onDelete}
        disabled={pending}
        aria-label="Obriši zadatak"
        className="shrink-0 rounded-md px-2 py-1 text-sm text-zinc-400 hover:text-red-600"
      >
        ✕
      </button>
    </li>
  );
}
