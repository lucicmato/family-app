import type { Priority } from "@/lib/types";

export const PRIORITIES: Priority[] = [1, 2, 3];

export const PRIORITY_LABELS: Record<Priority, string> = {
  1: "Visok",
  2: "Srednji",
  3: "Nizak",
};

// Subtle badge styling, used on task rows in the list.
export const PRIORITY_BADGE_STYLES: Record<Priority, string> = {
  1: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
  2: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
  3: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

// Muted, per-priority coloring for the selected state of the priority
// toggle buttons in the add-task form — duller than the badge colors so
// the row doesn't look alarming, but still clearly color-coded.
export const PRIORITY_BUTTON_STYLES: Record<Priority, string> = {
  1: "border-red-300 bg-red-100 text-red-800 dark:border-red-900/70 dark:bg-red-950/60 dark:text-red-300",
  2: "border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/60 dark:text-amber-300",
  3: "border-zinc-400 bg-zinc-200 text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
};

export const PRIORITY_BUTTON_INACTIVE =
  "border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400";
