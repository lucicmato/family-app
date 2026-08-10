import Link from "next/link";
import { getShoppingItems } from "@/app/actions/shopping";
import { getFamilyMembers } from "@/lib/family";
import { AddShoppingItemForm } from "@/components/AddShoppingItemForm";
import { ShoppingItemRow } from "@/components/ShoppingItemRow";
import { UserBar } from "@/components/UserBar";

export default async function ShoppingPage() {
  const [
    { items, error: itemsError },
    { self, partner, error: familyError },
  ] = await Promise.all([getShoppingItems(), getFamilyMembers()]);

  const error = itemsError ?? familyError;

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
        <h1 className="text-2xl font-semibold tracking-tight">
          Popis za kupovinu
        </h1>
      </div>

      <AddShoppingItemForm />

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40">
          Greška pri dohvaćanju: {error}
        </p>
      )}

      {items.length === 0 && !error ? (
        <p className="py-8 text-center text-zinc-400">
          Popis je prazan. Dodaj prvu stavku gore. 👆
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <ShoppingItemRow
              key={item.id}
              item={item}
              self={self}
              partner={partner}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
