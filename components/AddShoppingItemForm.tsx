"use client";

import { useState, useTransition } from "react";
import { addShoppingItem } from "@/app/actions/shopping";

// Quick item adding: name + optional note, one submit. Minimal number of clicks.
export const AddShoppingItemForm = () => {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await addShoppingItem(formData);
        if (result.ok) {
          setName("");
          setNote("");
        } else {
          setError(result.error);
        }
      } catch {
        setError("Greška.");
      }
    });
  };

  return (
    <form action={onSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nova stavka…"
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
      <input
        name="note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Napomena (npr. x2, light) — opcionalno"
        autoComplete="off"
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
};
