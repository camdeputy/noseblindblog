import { createServerSupabase } from "@/lib/supabase/server";

export default async function FragrancePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabase();

  const { data: fragrance, error: fErr } = await supabase
    .from("fragrances")
    .select("id,name,description")
    .eq("id", params.id)
    .single();

  if (fErr || !fragrance) return <div className="p-6">Not found</div>;

  const { data: mapped, error: nErr } = await supabase
    .from("fragrance_note_map")
    .select("position, sort_order, fragrance_notes(name)")
    .eq("fragrance_id", params.id)
    .order("position", { ascending: true })
    .order("sort_order", { ascending: true });

  if (nErr) return <div className="p-6">{nErr.message}</div>;

  const top: string[] = [];
  const middle: string[] = [];
  const base: string[] = [];

  for (const row of mapped ?? []) {
    const name = (row as any).fragrance_notes?.name as string | undefined;
    if (!name) continue;
    if (row.position === "top") top.push(name);
    if (row.position === "middle") middle.push(name);
    if (row.position === "base") base.push(name);
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">{fragrance.name}</h1>
      <p className="mt-2">{fragrance.description}</p>

      <div className="mt-6 space-y-3">
        <div>
          <div className="font-semibold">Top</div>
          <div>{top.join(", ") || "—"}</div>
        </div>
        <div>
          <div className="font-semibold">Middle</div>
          <div>{middle.join(", ") || "—"}</div>
        </div>
        <div>
          <div className="font-semibold">Base</div>
          <div>{base.join(", ") || "—"}</div>
        </div>
      </div>
    </main>
  );
}
