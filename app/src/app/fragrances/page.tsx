import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";

type FragranceListItem = {
  id: string;
  name: string;
  rating: number | null;
  price_cents: number | null;
  currency: string | null;
};

export default async function FragrancesPage() {
  const supabase = createServerSupabase();

  const { data, error } = await supabase
    .from("fragrances")
    .select("id,name,rating,price_cents,currency")
    .order("name", { ascending: true });

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Fragrances</h1>
        <pre className="mt-4 text-sm">{error.message}</pre>
      </main>
    );
  }

  const fragrances = (data ?? []) as FragranceListItem[];

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Fragrances</h1>

      <ul className="mt-4 space-y-2">
        {fragrances.map((f) => (
          <li key={f.id}>
            <Link className="underline" href={`/fragrances/${f.id}`}>
              {f.name}
            </Link>
            {typeof f.rating === "number" ? <span> — {f.rating}/5</span> : null}
          </li>
        ))}
      </ul>
    </main>
  );
}
