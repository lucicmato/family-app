import type { FamilyMember } from "@/lib/types";

// Today's date as "YYYY-MM-DD" in local time (Europe/Zagreb), matching the
// format native date inputs and Postgres date/timestamptz columns use.
// Deliberately NOT `new Date().toISOString()` — that's UTC, which reads as
// "yesterday" between 00:00 and 01:00/02:00 local time.
// Components must be spelled out as "2-digit" — without them, some ICU
// implementations render single-digit month/day unpadded (e.g. "2026-7-29"),
// which is not a valid HTML date-input value and breaks string comparisons.
const ZAGREB_DATE = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Zagreb",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const todayIso = (): string => ZAGREB_DATE.format(new Date());

// due_date comes back as either "YYYY-MM-DD" (date column) or a full
// timestamp like "YYYY-MM-DDT00:00:00+00:00" (timestamptz column) — only
// the first 10 chars ever matter here.
export const formatDueDate = (dueDate: string): string => {
  const [year, month, day] = dueDate.slice(0, 10).split("-");
  return `${day}.${month}.${year.slice(2)}.`;
};

export const isOverdue = (dueDate: string, done: boolean): boolean => {
  if (done) return false;
  return dueDate.slice(0, 10) < todayIso();
};

// Cycles assignment: nitko -> ja -> partner -> nitko.
export const nextAssignee = (
  current: string | null,
  self: FamilyMember,
  partner: FamilyMember | null,
): string | null => {
  if (current === null) return self.id;
  if (current === self.id) return partner?.id ?? null;
  return null;
};