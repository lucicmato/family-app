"use client";

import { useTransition } from "react";

import type { ActionResult, FamilyMember, Task } from "@/lib/types";
import { toggleTask, deleteTask, setTaskAssignee } from "@/app/actions/tasks";
import { PRIORITY_BADGE_STYLES, PRIORITY_LABELS } from "@/lib/priority";
import { useToast } from "@/components/Toast";
import { formatDueDate, isOverdue, nextAssignee } from "@/lib/helperFunctions";

const CONNECTION_ERROR = "Greška: nema veze sa serverom.";

// One row in the list: done checkbox + delete.
export const TaskItem = ({
  task,
  self,
  partner,
}: {
  task: Task;
  self: FamilyMember | null;
  partner: FamilyMember | null;
}) => {
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  // Runs a mutation and always surfaces the outcome — a failed ActionResult
  // or a thrown error (network drop, 500) both end up in a toast instead of
  // silently leaving the UI in a state that doesn't match the database.
  const run = (action: () => Promise<ActionResult>, onOk?: () => void) => {
    startTransition(async () => {
      try {
        const result = await action();
        if (result.ok) {
          onOk?.();
        } else {
          showToast(`Greška: ${result.error}`);
        }
      } catch {
        showToast(CONNECTION_ERROR);
      }
    });
  };

  const onToggle = () => run(() => toggleTask(task.id, !task.done));

  const onDelete = () => run(() => deleteTask(task.id));

  const onCycleAssignee = () => {
    if (!self) return;
    const next = nextAssignee(task.assigned_to, self, partner);
    run(
      () => setTaskAssignee(task.id, next),
      () => {
        const label =
          next === self.id ? "Ja" : next === partner?.id ? partner.label : null;
        showToast(label ? `Dodijeljeno: ${label}` : "Nedodijeljeno");
      },
    );
  };

  const assigneeLabel =
    task.assigned_to === self?.id
      ? "Ja"
      : task.assigned_to === partner?.id
        ? partner?.label
        : null;

  // Defensive fallback: the priority column is NOT NULL DEFAULT 2, but
  // this keeps the badge from breaking if a row ever lacks a real value.
  const priority = task.priority ?? 2;

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
      <div className="flex-1">
        <span
          className={`text-base ${
            task.done ? "text-zinc-400 line-through" : ""
          }`}
        >
          {task.title}
        </span>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {task.due_date && (
            <span
              className={`text-xs ${
                isOverdue(task.due_date, task.done)
                  ? "font-medium text-red-600 dark:text-red-400"
                  : "text-zinc-400"
              }`}
            >
              do {formatDueDate(task.due_date)}
            </span>
          )}
          {priority !== 2 && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_BADGE_STYLES[priority]}`}
            >
              {PRIORITY_LABELS[priority]}
            </span>
          )}
        </div>
        {(self || partner) && (
          <div className="mt-1">
            <button
              type="button"
              onClick={onCycleAssignee}
              disabled={pending || !self}
              className={`rounded-full px-2 py-0.5 text-xs font-medium disabled:opacity-70 ${
                assigneeLabel
                  ? "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400"
                  : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
              }`}
            >
              {assigneeLabel ?? "Dodijeli"}
            </button>
          </div>
        )}
      </div>
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
};
