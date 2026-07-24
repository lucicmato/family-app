"use client";

import { useRef, useState, useTransition } from "react";
import { addTask } from "@/app/actions/tasks";

// Quick task adding: one input + button. Minimal number of clicks.
export function AddTaskForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addTask(formData);
      if (result.ok) {
        formRef.current?.reset();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form ref={formRef} action={onSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="title"
          placeholder="Novi zadatak…"
          autoComplete="off"
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-base outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-5 py-3 text-base font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "…" : "Dodaj"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
