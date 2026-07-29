"use client";

import { useState, useTransition } from "react";
import { addTask } from "@/app/actions/tasks";
import type { FamilyMember, Priority } from "@/lib/types";
import {
  PRIORITIES,
  PRIORITY_BUTTON_INACTIVE,
  PRIORITY_BUTTON_STYLES,
  PRIORITY_LABELS,
} from "@/lib/priority";
import { todayIso } from "@/lib/helperFunctions";

// Quick task adding: one input + button. Minimal number of clicks.
export const AddTaskForm = ({
  self,
  partner,
}: {
  self: FamilyMember | null;
  partner: FamilyMember | null;
}) => {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>(2);

  const onSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await addTask(formData);
        if (result.ok) {
          setTitle("");
          setAssignedTo(null);
          setPriority(2);
        } else {
          setError(result.error);
        }
      } catch {
        setError("Greška.");
      }
    });
  };

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
      <div className="flex gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <label
            htmlFor="due_date"
            className="text-xs text-zinc-500 dark:text-zinc-400"
          >
            Završiti do
          </label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            defaultValue={todayIso()}
            min={todayIso()}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-600 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          />
        </div>
        <input type="hidden" name="priority" value={priority} />
        <div className="flex flex-1 gap-1" role="radiogroup" aria-label="Prioritet">
          {PRIORITIES.map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={priority === value}
              onClick={() => setPriority(value)}
              className={`flex-1 rounded-lg border px-2 py-2 text-sm font-medium transition ${
                priority === value
                  ? PRIORITY_BUTTON_STYLES[value]
                  : PRIORITY_BUTTON_INACTIVE
              }`}
            >
              {PRIORITY_LABELS[value]}
            </button>
          ))}
        </div>
      </div>
      {(self || partner) && (
        <div className="flex gap-2">
          <input type="hidden" name="assigned_to" value={assignedTo ?? ""} />
          {self && (
            <button
              type="button"
              onClick={() =>
                setAssignedTo((current) => (current === self.id ? null : self.id))
              }
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                assignedTo === self.id
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              Ja
            </button>
          )}
          {partner && (
            <button
              type="button"
              onClick={() =>
                setAssignedTo((current) =>
                  current === partner.id ? null : partner.id,
                )
              }
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                assignedTo === partner.id
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              {partner.label}
            </button>
          )}
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
};
