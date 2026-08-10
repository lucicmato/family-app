"use client";

import { useTransition } from "react";

import type { ActionResult, FamilyMember, ShoppingItem } from "@/lib/types";
import { toggleShoppingItem, deleteShoppingItem } from "@/app/actions/shopping";
import { useToast } from "@/components/Toast";

const CONNECTION_ERROR = "Greška: nema veze sa serverom.";

// One row in the list: done checkbox + delete.
export const ShoppingItemRow = ({
  item,
  self,
  partner,
}: {
  item: ShoppingItem;
  self: FamilyMember | null;
  partner: FamilyMember | null;
}) => {
  const [pending, startTransition] = useTransition();
  const showToast = useToast();

  const run = (action: () => Promise<ActionResult>) => {
    startTransition(async () => {
      try {
        const result = await action();
        if (!result.ok) showToast(`Greška: ${result.error}`);
      } catch {
        showToast(CONNECTION_ERROR);
      }
    });
  };

  const onToggle = () => run(() => toggleShoppingItem(item.id, !item.done));

  const onDelete = () => run(() => deleteShoppingItem(item.id));

  const checkedByLabel =
    item.checked_by === self?.id
      ? "Ja"
      : item.checked_by === partner?.id
        ? partner?.label
        : null;

  return (
    <li
      className={`flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 ${
        pending ? "opacity-50" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={item.done}
        onChange={onToggle}
        disabled={pending}
        className="h-5 w-5 shrink-0 accent-zinc-900 dark:accent-zinc-100"
      />
      <div className="flex-1">
        <span
          className={`text-base ${
            item.done ? "text-zinc-400 line-through" : ""
          }`}
        >
          {item.name}
          {item.note && <span className="text-zinc-400"> — {item.note}</span>}
        </span>
        {item.done && checkedByLabel && (
          <div className="mt-1 text-xs text-zinc-400">
            Kupio/la: {checkedByLabel}
          </div>
        )}
      </div>
      <button
        onClick={onDelete}
        disabled={pending}
        aria-label="Obriši stavku"
        className="shrink-0 rounded-md px-2 py-1 text-sm text-zinc-400 hover:text-red-600"
      >
        ✕
      </button>
    </li>
  );
};
